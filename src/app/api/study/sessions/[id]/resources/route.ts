import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { Resource, ResourceType } from '@/types';

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

    const { data: resources, error } = await dbService.supabase
      .from('resources')
      .select(`
        *,
        flashcards(
          id,
          question,
          answer,
          difficulty,
          last_reviewed,
          review_count,
          correct_count
        ),
        quizzes(
          id,
          title,
          questions,
          score,
          max_score,
          completed_at
        )
      `)
      .eq('session_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching session resources:', error);
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }

    const formattedResources: Resource[] = resources.map(resource => ({
      id: resource.id,
      userId: resource.user_id,
      sessionId: resource.session_id,
      type: resource.type as ResourceType,
      title: resource.title,
      content: resource.content,
      metadata: resource.metadata,
      flashcards: resource.flashcards?.map((flashcard: any) => ({
        id: flashcard.id,
        resourceId: resource.id,
        question: flashcard.question,
        answer: flashcard.answer,
        difficulty: flashcard.difficulty,
        lastReviewed: flashcard.last_reviewed,
        reviewCount: flashcard.review_count,
        correctCount: flashcard.correct_count,
      })),
      quizzes: resource.quizzes?.map((quiz: any) => ({
        id: quiz.id,
        resourceId: resource.id,
        title: quiz.title,
        questions: quiz.questions,
        score: quiz.score,
        maxScore: quiz.max_score,
        completedAt: quiz.completed_at,
      })),
      createdAt: resource.created_at,
      updatedAt: resource.updated_at,
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error('Error in GET /api/study/sessions/[id]/resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}