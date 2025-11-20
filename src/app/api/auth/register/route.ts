import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { dbService } from '@/lib/db/service';
import { z } from 'zod';
import type { RegisterRequest, ApiResponse, User } from '@/types';

// Esquema de validación
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar el cuerpo de la petición
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { email, password, name } = validationResult.data;

    // Verificar si el usuario ya existe
    const { data: existingUser } = await dbService.getClient()
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
      }, { status: 409 });
    }

    // Hashear la contraseña
    const passwordHash = await authService.hashPassword(password);

    // Crear el usuario en la base de datos
    const { data: user, error: userError } = await dbService.getClient()
      .from('users')
      .insert({
        email,
        name,
        password_hash: passwordHash,
        is_active: true,
      })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Database error',
        message: 'Failed to create user',
      }, { status: 500 });
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
      message: 'User registered successfully',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during registration',
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