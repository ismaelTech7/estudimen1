import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getConfig } from '@/lib/config';
import { dbService } from '@/lib/db/service';
import type { User } from '@/types';

/**
 * Servicio de autenticación con JWT y refresh tokens
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Hashea una contraseña
   */
  public async hashPassword(password: string): Promise<string> {
    const config = getConfig();
    return bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  /**
   * Compara una contraseña con su hash
   */
  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Genera un access token JWT
   */
  public generateAccessToken(user: User): string {
    const config = getConfig();
    
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
      issuer: 'estudimen',
      audience: 'estudimen-users',
    });
  }

  /**
   * Genera un refresh token
   */
  public generateRefreshToken(userId: string): string {
    const config = getConfig();
    
    const payload = {
      userId,
      tokenType: 'refresh',
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'estudimen',
      audience: 'estudimen-users',
    });
  }

  /**
   * Verifica y decodifica un token JWT
   */
  public verifyToken(token: string): { userId: string; email: string; name: string } {
    const config = getConfig();
    
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        issuer: 'estudimen',
        audience: 'estudimen-users',
      }) as any;

      return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Almacena un refresh token en la base de datos
   */
  public async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    const { error } = await dbService.getClient()
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token: this.hashRefreshToken(token),
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to store refresh token: ${error.message}`);
    }
  }

  /**
   * Valida un refresh token
   */
  public async validateRefreshToken(token: string): Promise<string | null> {
    try {
      // Verificar el JWT primero
      const decoded = jwt.verify(token, getConfig().JWT_SECRET) as any;
      
      if (decoded.tokenType !== 'refresh') {
        return null;
      }

      const userId = decoded.userId;
      const hashedToken = this.hashRefreshToken(token);

      // Verificar en la base de datos
      const { data, error } = await dbService.getClient()
        .from('refresh_tokens')
        .select('expires_at')
        .eq('user_id', userId)
        .eq('token', hashedToken)
        .single();

      if (error || !data) {
        return null;
      }

      // Verificar si no ha expirado
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        // Eliminar token expirado
        await this.revokeRefreshToken(userId, token);
        return null;
      }

      return userId;
    } catch {
      return null;
    }
  }

  /**
   * Revoca un refresh token
   */
  public async revokeRefreshToken(userId: string, token: string): Promise<void> {
    const hashedToken = this.hashRefreshToken(token);
    
    const { error } = await dbService.getClient()
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', hashedToken);

    if (error) {
      throw new Error(`Failed to revoke refresh token: ${error.message}`);
    }
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  public async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const { error } = await dbService.getClient()
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to revoke user refresh tokens: ${error.message}`);
    }
  }

  /**
   * Limpia los refresh tokens expirados
   */
  public async cleanupExpiredRefreshTokens(): Promise<number> {
    const now = new Date().toISOString();
    
    const { error, count } = await dbService.getClient()
      .from('refresh_tokens')
      .delete()
      .lt('expires_at', now);

    if (error) {
      throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Hash de refresh token para almacenamiento
   */
  private hashRefreshToken(token: string): string {
    return bcrypt.hashSync(token, 10);
  }

  /**
   * Genera tokens para un usuario
   */
  public async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);
    
    // Almacenar refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    // Calcular tiempo de expiración del access token
    const expiresIn = 15 * 60; // 15 minutos en segundos
    
    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Refresca los tokens de un usuario
   */
  public async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const userId = await this.validateRefreshToken(refreshToken);
    
    if (!userId) {
      throw new Error('Invalid refresh token');
    }

    // Obtener usuario
    const { data: user, error } = await dbService.getClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Generar nuevos tokens
    return this.generateTokens(user as User);
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();