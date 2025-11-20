import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { z } from 'zod';
import type { ApiResponse } from '@/types';

// Esquema de validación
const logoutSchema = z.object({
  refresh_token: z.string().optional(),
});

/**
 * POST /api/auth/logout
 * Cierra sesión de usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Validar el cuerpo de la petición (opcional)
    const validationResult = logoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { refresh_token } = validationResult.data;

    // Si se proporciona un refresh token, revocarlo
    if (refresh_token) {
      try {
        // Obtener el userId del token para revocarlo
        const decoded = authService.verifyToken(refresh_token);
        if (decoded) {
          await authService.revokeRefreshToken(decoded.userId, refresh_token);
        }
      } catch {
        // Si el token es inválido, continuar igualmente
      }
    }

    // En una implementación completa, también invalidaríamos el access token
    // aquí, posiblemente usando una lista negra de tokens

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during logout',
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