import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretKey } from '@/lib/config';
import { dbService } from '@/lib/db/service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const keyId = id;

    // Verificar que la clave pertenece al usuario
    const { data: apiKeyData, error: fetchError } = await dbService.supabase
      .from('api_keys')
      .select('id')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !apiKeyData) {
      return NextResponse.json(
        { error: 'Clave API no encontrada o no tienes permisos para eliminarla' },
        { status: 404 }
      );
    }

    // Eliminar la clave API
    const { error: deleteError } = await dbService.supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting API key:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar la clave API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Clave API eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error in delete API key endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}