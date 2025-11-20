import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { dbService } from '@/lib/db/service';
import { z } from 'zod';

const reviewFlashcardSchema = z.object({
  correct: z.boolean(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
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
    const validation = reviewFlashcardSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 });
    }

    const { correct, difficulty } = validation.data;

    // Get current flashcard data
    const { data: currentFlashcard, error: fetchError } = await dbService.supabase
      .from('flashcards')
      .select(`
        *,
        resources!inner(user_id)
      `)
      .eq('id', id)
      .eq('resources.user_id', user.id)
      .single();

    if (fetchError || !currentFlashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    const cf = currentFlashcard as any;
    const newReviewCount = cf.review_count + 1;
    const newCorrectCount = cf.correct_count + (correct ? 1 : 0);
    const newDifficulty = difficulty;

    const { data: updatedFlashcard, error: updateError } = await dbService.supabase
      .from('flashcards')
      .update({
        review_count: newReviewCount,
        correct_count: newCorrectCount,
        difficulty: newDifficulty,
        last_reviewed: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating flashcard review:', updateError);
      return NextResponse.json({ error: 'Failed to update flashcard review' }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedFlashcard.id,
      resourceId: updatedFlashcard.resource_id,
      question: updatedFlashcard.question,
      answer: updatedFlashcard.answer,
      difficulty: updatedFlashcard.difficulty,
      lastReviewed: updatedFlashcard.last_reviewed,
      reviewCount: updatedFlashcard.review_count,
      correctCount: updatedFlashcard.correct_count,
      createdAt: updatedFlashcard.created_at,
      updatedAt: updatedFlashcard.updated_at,
    });
  } catch (error) {
    console.error('Error in POST /api/study/flashcards/[id]/review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}