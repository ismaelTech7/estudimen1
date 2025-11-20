import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretKey } from '@/lib/config';
import { dbService } from '@/lib/db/service';

export async function GET(
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

    // Obtener el plan de estudio con todas sus relaciones
    const { data: planData, error: planError } = await dbService.supabase
      .from('study_plans')
      .select(`
        *,
        subjects:study_plan_subjects(*),
        sessions:study_sessions(*),
        resources:resources(*)
      `)
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (planError || !planData) {
      return NextResponse.json(
        { error: 'Plan de estudio no encontrado' },
        { status: 404 }
      );
    }

    // Formatear la respuesta
    const formattedPlan = {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      dailyHours: planData.daily_hours,
      startDate: planData.start_date,
      endDate: planData.end_date,
      totalSessions: planData.total_sessions,
      completedSessions: planData.completed_sessions,
      isActive: planData.is_active,
      createdAt: planData.created_at,
      subjects: planData.subjects?.map((subject: any) => ({
        id: subject.id,
        name: subject.name,
        examDate: subject.exam_date,
        priority: subject.priority,
        difficulty: subject.difficulty,
        estimatedHours: subject.estimated_hours
      })) || [],
      sessions: planData.sessions?.map((session: any) => ({
        id: session.id,
        subjectId: session.subject_id,
        subjectName: session.subject_name,
        scheduledDate: session.scheduled_date,
        duration: session.duration,
        type: session.type,
        status: session.status,
        completedAt: session.completed_at,
        notes: session.notes
      })) || [],
      resources: planData.resources?.map((resource: any) => ({
        id: resource.id,
        type: resource.type,
        title: resource.title,
        subjectId: resource.subject_id,
        subjectName: resource.subject_name,
        content: resource.content,
        createdAt: resource.created_at
      })) || []
    };

    return NextResponse.json({
      success: true,
      plan: formattedPlan
    });

  } catch (error) {
    console.error('Error in get study plan endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}