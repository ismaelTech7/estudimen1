import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretKey } from '@/lib/config';
import { dbService } from '@/lib/db/service';
import { studyService } from '@/lib/study/service';

export async function POST(
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
    const planId = id;

    // Verificar que el plan existe y pertenece al usuario
    const { data: plan, error: planError } = await dbService.supabase
      .from('study_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan de estudio no encontrado' },
        { status: 404 }
      );
    }

    // Obtener las asignaturas del plan
    const { data: subjects, error: subjectsError } = await dbService.supabase
      .from('study_plan_subjects')
      .select('*')
      .eq('study_plan_id', planId);

    if (subjectsError || !subjects) {
      return NextResponse.json(
        { error: 'Error al obtener asignaturas del plan' },
        { status: 500 }
      );
    }

    // Generar las sesiones de estudio usando IA
    let sessions;
    try {
      sessions = await studyService.generateStudySessions(plan, subjects);
    } catch (error) {
      console.error('Error generating study sessions:', error);
      return NextResponse.json(
        { error: 'Error al generar las sesiones de estudio' },
        { status: 500 }
      );
    }

    // Guardar las sesiones en la base de datos
    const { error: insertError } = await dbService.supabase
      .from('study_sessions')
      .insert(sessions);

    if (insertError) {
      console.error('Error saving study sessions:', insertError);
      return NextResponse.json(
        { error: 'Error al guardar las sesiones de estudio' },
        { status: 500 }
      );
    }

    // Actualizar el número total de sesiones del plan
    const { error: updateError } = await dbService.supabase
      .from('study_plans')
      .update({ 
        total_sessions: sessions.length,
        is_active: true
      })
      .eq('id', planId);

    if (updateError) {
      console.error('Error updating plan:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: `Se generaron ${sessions.length} sesiones de estudio exitosamente`,
      sessions: sessions
    });

  } catch (error) {
    console.error('Error in generate sessions endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}