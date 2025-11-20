import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { StudySession } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session, error } = await dbService.supabase
      .from('study_sessions')
      .select(`
        *,
        study_plans!inner(title)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching study session:', error);
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 });
    }

    const formattedSession: StudySession = {
      id: session.id,
      userId: session.user_id,
      studyPlanId: session.study_plan_id,
      subject: session.subject,
      objective: session.objective,
      duration: session.duration,
      status: session.status,
      scheduledDate: session.scheduled_date,
      completedAt: session.completed_at,
      notes: session.notes,
      studyPlan: {
        title: session.study_plans.title,
      },
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error('Error in GET /api/study/sessions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}