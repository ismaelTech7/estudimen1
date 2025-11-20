import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { z } from 'zod';
import type { ApiResponse } from '@/types';

// Esquema de validación
const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /api/auth/refresh
 * Refresca los tokens de autenticación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar el cuerpo de la petición
    const validationResult = refreshSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { refresh_token } = validationResult.data;

    // Refrescar los tokens
    const tokens = await authService.refreshTokens(refresh_token);

    return NextResponse.json<ApiResponse<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>>({
      success: true,
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
      },
      message: 'Tokens refreshed successfully',
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof Error && error.message === 'Invalid refresh token') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or expired',
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during token refresh',
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