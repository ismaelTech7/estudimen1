import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { z } from 'zod';

const submitQuizSchema = z.object({
  answers: z.record(z.number()),
  score: z.number().min(0).max(100),
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
    const validation = submitQuizSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 });
    }

    const { answers, score } = validation.data;

    // Get current quiz data
    const { data: currentQuiz, error: fetchError } = await dbService.supabase
      .from('quizzes')
      .select(`
        *,
        resources!inner(user_id)
      `)
      .eq('id', id)
      .eq('resources.user_id', user.id)
      .single();

    if (fetchError || !currentQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const completedAt = new Date().toISOString();

    const { data: updatedQuiz, error: updateError } = await dbService.supabase
      .from('quizzes')
      .update({
        score,
        max_score: 100,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error submitting quiz:', updateError);
      return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Quiz submitted successfully',
      quiz: {
        id: updatedQuiz.id,
        score: updatedQuiz.score,
        maxScore: updatedQuiz.max_score,
        completedAt: updatedQuiz.completed_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/study/quiz/[id]/submit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}