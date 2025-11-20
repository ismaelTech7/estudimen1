import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretKey } from '@/lib/config';
import { dbService } from '@/lib/db/service';
import { encryptionService } from '@/lib/encryption/service';
import { aiService } from '@/lib/ai/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(
        token,
        getJwtSecretKey()
      );
      payload = verifiedPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;
    const keyId = params.id;

    // Obtener la clave API del usuario
    const { data: apiKeyData, error: fetchError } = await dbService.supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !apiKeyData) {
      return NextResponse.json(
        { error: 'Clave API no encontrada' },
        { status: 404 }
      );
    }

    // Desencriptar la clave API
    let decryptedKey: string;
    try {
      decryptedKey = encryptionService.decryptApiKey(apiKeyData.encrypted_key);
    } catch (error) {
      console.error('Error decrypting API key:', error);
      return NextResponse.json(
        { error: 'Error al desencriptar la clave API' },
        { status: 500 }
      );
    }

    // Probar la clave según el proveedor
    let testResult: { success: boolean; error?: string };
    
    try {
      if (apiKeyData.provider === 'gemini') {
        // Probar con una llamada simple a Gemini
        testResult = await aiService.testGeminiKey(decryptedKey);
      } else if (apiKeyData.provider === 'openai') {
        // Probar con una llamada simple a OpenAI
        testResult = await aiService.testOpenAIKey(decryptedKey);
      } else {
        return NextResponse.json(
          { error: 'Proveedor de IA no soportado' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      return NextResponse.json(
        { error: 'Error al probar la clave API' },
        { status: 500 }
      );
    }

    if (!testResult.success) {
      return NextResponse.json(
        { error: testResult.error || 'La clave API no es válida o ha expirado' },
        { status: 400 }
      );
    }

    // Actualizar el estado de la clave a activa si la prueba fue exitosa
    const { error: updateError } = await dbService.supabase
      .from('api_keys')
      .update({ 
        is_active: true,
        last_tested_at: new Date().toISOString()
      })
      .eq('id', keyId);

    if (updateError) {
      console.error('Error updating API key status:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Clave API funcionando correctamente',
      provider: apiKeyData.provider
    });

  } catch (error) {
    console.error('Error in test API key endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}