import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { z } from 'zod';

const updateNotesSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export async function PUT(
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
    const validation = updateNotesSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 });
    }

    const { notes } = validation.data;

    const { data: session, error } = await dbService.supabase
      .from('study_sessions')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session notes:', error);
      return NextResponse.json({ error: 'Failed to update session notes' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Session notes updated successfully',
      notes: session.notes,
    });
  } catch (error) {
    console.error('Error in PUT /api/study/sessions/[id]/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}