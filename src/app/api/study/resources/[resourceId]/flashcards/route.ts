import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { Flashcard } from '@/types';

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

    const { data: flashcards, error } = await dbService.supabase
      .from('flashcards')
      .select(`
        *,
        resources!inner(user_id)
      `)
      .eq('resource_id', resourceId)
      .eq('resources.user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching flashcards:', error);
      return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
    }

    const formattedFlashcards: Flashcard[] = flashcards.map(flashcard => ({
      id: flashcard.id,
      resourceId: flashcard.resource_id,
      question: flashcard.question,
      answer: flashcard.answer,
      difficulty: flashcard.difficulty,
      lastReviewed: flashcard.last_reviewed,
      reviewCount: flashcard.review_count,
      correctCount: flashcard.correct_count,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
    }));

    return NextResponse.json(formattedFlashcards);
  } catch (error) {
    console.error('Error in GET /api/study/resources/[resourceId]/flashcards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}