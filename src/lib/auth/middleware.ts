import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import type { ApiResponse } from '@/types';

/**
 * Middleware de autenticación para proteger rutas API
 */
export function withAuth(handler: (request: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Obtener el token de autorización
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
        }, { status: 401 });
      }

      const token = authHeader.substring(7);
      
      // Verificar el token
      let userId: string;
      try {
        const decoded = authService.verifyToken(token);
        userId = decoded.userId;
      } catch (error) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        }, { status: 401 });
      }

      // Llamar al handler con el userId
      return await handler(request, userId);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred in authentication',
      }, { status: 500 });
    }
  };
}

/**
 * Middleware opcional de autenticación (no requiere auth pero la usa si está presente)
 */
export function withOptionalAuth(handler: (request: NextRequest, userId: string | null) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Obtener el token de autorización
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No hay token, llamar al handler con userId null
        return await handler(request, null);
      }

      const token = authHeader.substring(7);
      
      // Verificar el token
      let userId: string;
      try {
        const decoded = authService.verifyToken(token);
        userId = decoded.userId;
      } catch (error) {
        // Token inválido, llamar al handler con userId null
        return await handler(request, null);
      }

      // Llamar al handler con el userId
      return await handler(request, userId);

    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred in authentication',
      }, { status: 500 });
    }
  };
}