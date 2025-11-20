import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { dbService } from '@/lib/db/service';
import { z } from 'zod';
import type { LoginRequest, ApiResponse, User } from '@/types';

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/login
 * Inicia sesión de usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar el cuerpo de la petición
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // Buscar el usuario por email
    const { data: user, error: userError } = await dbService.getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password',
      }, { status: 401 });
    }

    // Verificar la contraseña
    const isPasswordValid = await authService.comparePassword(
      password,
      (user as { password_hash: string }).password_hash
    );
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password',
      }, { status: 401 });
    }

    // Generar tokens de autenticación
    const tokens = await authService.generateTokens(user as User);

    return NextResponse.json<ApiResponse<{
      user: User;
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>>({
      success: true,
      data: {
        user: user as User,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during login',
    }, { status: 500 });
  }
}

/**
 * Manejador para otros métodos HTTP
 */
export async function GET() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST requests are allowed',
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST requests are allowed',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only POST requests are allowed',
  }, { status: 405 });
}