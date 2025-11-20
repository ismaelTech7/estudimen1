import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { Quiz } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: quiz, error } = await dbService.supabase
      .from('quizzes')
      .select(`
        *,
        resources!inner(user_id)
      `)
      .eq('resource_id', resourceId)
      .eq('resources.user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching quiz:', error);
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const formattedQuiz: Quiz = {
      id: quiz.id,
      resourceId: quiz.resource_id,
      title: quiz.title,
      questions: quiz.questions,
      score: quiz.score,
      maxScore: quiz.max_score,
      completedAt: quiz.completed_at,
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
    };

    return NextResponse.json(formattedQuiz);
  } catch (error) {
    console.error('Error in GET /api/study/resources/[resourceId]/quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}