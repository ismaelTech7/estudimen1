'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Flashcard } from '@/types';

interface FlashcardStudyPageProps {
  params: Promise<{ id: string; resourceId: string }>;
}

export default async function FlashcardStudyPage({ params }: FlashcardStudyPageProps) {
  const { id, resourceId } = await params;
  const router = useRouter();
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(`/api/study/resources/${resourceId}/flashcards`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }

        const data = await response.json();
        setFlashcards(data);
        setStats({
          correct: data.filter((card: Flashcard) => card.correctCount > 0).length,
          incorrect: data.filter((card: Flashcard) => card.reviewCount > card.correctCount).length,
          total: data.length,
        });
        setLoading(false);
      } catch (error) {
        setError('Failed to load flashcards');
        setLoading(false);
      }
    };

    if (user) {
      fetchFlashcards();
    }
  }, [resourceId, user]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleAnswer = async (correct: boolean) => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    try {
      const response = await fetch(`/api/study/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          correct,
          difficulty: correct ? 'easy' : 'hard',
        }),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[currentIndex] = updatedCard;
        setFlashcards(updatedFlashcards);

        // Update stats
        setStats(prev => ({
          correct: prev.correct + (correct ? 1 : 0),
          incorrect: prev.incorrect + (correct ? 0 : 1),
          total: prev.total,
        }));

        // Auto advance to next card after a short delay
        setTimeout(() => {
          if (currentIndex < flashcards.length - 1) {
            handleNext();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating flashcard review:', error);
    }
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tarjetas...</p>
        </div>
      </div>
    );
  }

  if (error || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay tarjetas disponibles</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Este recurso no tiene tarjetas de memoria creadas.'}
            </p>
            <Button onClick={() => router.push(`/study-plans/${id}`)}>
              Volver al Plan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/study-plans/${id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Tarjetas de Memoria</h1>
            <Button
              variant="outline"
              onClick={resetProgress}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-sm text-gray-600">Correctas</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
              <div className="text-sm text-gray-600">Incorrectas</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Precisión</div>
            </Card>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{currentIndex + 1} / {flashcards.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Flashcard */}
        <div className="max-w-2xl mx-auto">
          <div className="relative h-96 mb-8">
            <Card
              className={`absolute inset-0 cursor-pointer transition-transform duration-500 transform-gpu preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={handleFlip}
            >
              {/* Front of card */}
              <div className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-4">
                    Pregunta
                  </Badge>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {currentCard.question}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Haz clic para ver la respuesta
                  </p>
                </div>
              </div>

              {/* Back of card */}
              <div className={`absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-8 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="text-center">
                  <Badge variant="default" className="mb-4">
                    Respuesta
                  </Badge>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {currentCard.answer}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Haz clic para volver a la pregunta
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Difficulty indicator */}
          <div className="text-center mb-6">
            <Badge
              variant={
                currentCard.difficulty === 'easy'
                  ? 'success'
                  : currentCard.difficulty === 'medium'
                  ? 'warning'
                  : 'destructive'
              }
            >
              Dificultad: {currentCard.difficulty}
            </Badge>
            {currentCard.reviewCount > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Revisado {currentCard.reviewCount} veces •{' '}
                {Math.round((currentCard.correctCount / currentCard.reviewCount) * 100)}% aciertos
              </p>
            )}
          </div>

          {/* Navigation and answer buttons */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex space-x-2">
              {isFlipped && (
                <>
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrecto
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Correcto
                  </Button>
                </>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              variant="outline"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}