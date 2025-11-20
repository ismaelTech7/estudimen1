import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { encryptionService } from '@/lib/encryption/service';
import { aiService } from '@/lib/ai/service';
import { dbService } from '@/lib/db/service';
import { getConfig } from '@/lib/config';
import { z } from 'zod';
import type { ApiResponse, ApiKeyRequest } from '@/types';

// Esquema de validación
const apiKeySchema = z.object({
  provider: z.enum(['gemini', 'openai']),
  api_key: z.string().min(10, 'API key must be at least 10 characters'),
});

/**
 * POST /api/user/keys
 * Agrega una nueva API key para el usuario
 */
export async function POST(request: NextRequest) {
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
    } catch {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Validar el cuerpo de la petición
    const validationResult = apiKeySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const { provider, api_key }: ApiKeyRequest = validationResult.data;

    // Validar el formato de la API key
    if (!encryptionService.validateApiKey(api_key, provider)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid API key format',
        message: `The provided API key is not valid for ${provider}`,
      }, { status: 400 });
    }

    // Verificar límites de API keys por usuario
    const config = getConfig();
    const { count: existingKeysCount, error: countError } = await dbService.getClient()
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (countError) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Database error',
        message: 'Failed to check API key limits',
      }, { status: 500 });
    }

    if ((existingKeysCount || 0) >= config.MAX_API_KEYS_PER_USER) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Limit exceeded',
        message: `Maximum ${config.MAX_API_KEYS_PER_USER} API keys allowed per user`,
      }, { status: 400 });
    }

    // Verificar que no exista una API key activa para este proveedor
    const { data: existingProviderKey } = await dbService.getClient()
      .from('api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (existingProviderKey) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Provider already configured',
        message: `You already have an active ${provider} API key`,
      }, { status: 400 });
    }

    // Validar la API key con el proveedor
    const isValid = await aiService.validateApiKey(api_key, provider);
    if (!isValid) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid API key',
        message: `The provided ${provider} API key is not valid or expired`,
      }, { status: 400 });
    }

    // Cifrar la API key
    const encryptedData = encryptionService.encryptApiKeyForStorage(api_key);
    const keyPrefix = api_key.substring(0, config.API_KEY_PREFIX_LENGTH);

    // Guardar la API key en la base de datos
    const { data: savedKey, error } = await dbService.supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        provider,
        encrypted_key: encryptedData,
        key_prefix: keyPrefix,
        is_active: true,
      })
      .select()
      .single();

    if (error || !savedKey) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Database error',
        message: 'Failed to save API key',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: {
        id: (savedKey as any).id,
        provider: (savedKey as any).provider,
        key_prefix: (savedKey as any).key_prefix,
        is_active: (savedKey as any).is_active,
        created_at: (savedKey as any).created_at,
      },
      message: 'API key added successfully',
    });

  } catch (error) {
    console.error('Add API key error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while adding API key',
    }, { status: 500 });
  }
}

/**
 * GET /api/user/keys
 * Obtiene las API keys del usuario
 */
export async function GET(request: NextRequest) {
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
    } catch {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Obtener las API keys del usuario
    const { data: apiKeys, error } = await dbService.getClient()
      .from('api_keys')
      .select('id, provider, key_prefix, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch API keys',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: apiKeys || [],
      message: 'API keys retrieved successfully',
    });

  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching API keys',
    }, { status: 500 });
  }
}

/**
 * Manejador para otros métodos HTTP
 */
export async function PUT() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET and POST requests are allowed',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET and POST requests are allowed',
  }, { status: 405 });
}