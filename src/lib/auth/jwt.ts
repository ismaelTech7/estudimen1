import jwt from 'jsonwebtoken';
import { getConfig } from '@/lib/config';

/**
 * Servicio JWT para manejo de tokens
 */
export class JwtService {
  private static instance: JwtService;

  private constructor() {}

  public static getInstance(): JwtService {
    if (!JwtService.instance) {
      JwtService.instance = new JwtService();
    }
    return JwtService.instance;
  }

  /**
   * Genera un access token JWT
   */
  public generateAccessToken(payload: any): string {
    const config = getConfig();
    
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
      issuer: 'estudimen',
      audience: 'estudimen-users',
    });
  }

  /**
   * Genera un refresh token
   */
  public generateRefreshToken(payload: any): string {
    const config = getConfig();
    
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'estudimen',
      audience: 'estudimen-users',
    });
  }

  /**
   * Verifica y decodifica un token JWT
   */
  public verifyToken(token: string): any {
    const config = getConfig();
    
    try {
      return jwt.verify(token, config.JWT_SECRET, {
        issuer: 'estudimen',
        audience: 'estudimen-users',
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decodifica un token sin verificarlo
   */
  public decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

// Exportar instancia singleton
export const jwtService = JwtService.getInstance();