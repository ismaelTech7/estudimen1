import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { z } from 'zod';

const completeSessionSchema = z.object({
  actualDuration: z.number().min(0),
  status: z.enum(['completed', 'cancelled']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = completeSessionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 });
    }

    const { actualDuration, status } = validation.data;
    const completedAt = status === 'completed' ? new Date().toISOString() : null;

    const { data: session, error } = await dbService.supabase
      .from('study_sessions')
      .update({
        status,
        actual_duration: actualDuration,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error completing study session:', error);
      return NextResponse.json({ error: 'Failed to complete study session' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 });
    }

    // Update study plan progress
    const { error: progressError } = await dbService.supabase
      .rpc('update_study_plan_progress', {
        p_study_plan_id: session.study_plan_id,
      });

    if (progressError) {
      console.error('Error updating study plan progress:', progressError);
      // Continue even if progress update fails
    }

    return NextResponse.json({
      message: 'Study session completed successfully',
      session: {
        id: session.id,
        status: session.status,
        actualDuration: session.actual_duration,
        completedAt: session.completed_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/study/sessions/[id]/complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}