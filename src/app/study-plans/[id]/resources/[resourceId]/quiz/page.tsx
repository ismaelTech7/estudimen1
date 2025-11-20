'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle, Brain, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Quiz, QuizQuestion } from '@/types';

interface QuizStudyPageProps {
  params: Promise<{ id: string; resourceId: string }>;
}

export default async function QuizStudyPage({ params }: QuizStudyPageProps) {
  const { id, resourceId } = await params;
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/study/resources/${resourceId}/quiz`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }

        const data = await response.json();
        setQuiz(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load quiz');
        setLoading(false);
      }
    };

    if (user) {
      fetchQuiz();
    }
  }, [resourceId, user]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Submit results to server
    try {
      await fetch(`/api/study/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          answers: selectedAnswers,
          score: finalScore,
        }),
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const allQuestionsAnswered = quiz && Object.keys(selectedAnswers).length === quiz.questions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Brain className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay cuestionario disponible</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Este recurso no tiene un cuestionario creado.'}
            </p>
            <Button onClick={() => router.push(`/study-plans/${id}`)}>
              Volver al Plan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Cuestionario Completado!</h1>
              <div className="text-6xl font-bold text-green-600 mb-2">{score}%</div>
              <p className="text-gray-600 mb-6">
                Has respondido correctamente {Object.values(selectedAnswers).filter((answer, index) => 
                  answer === quiz.questions[index]?.correctAnswer
                ).length} de {quiz.questions.length} preguntas.
              </p>
              
              <div className="space-y-4 mb-8">
                {quiz.questions.map((question, index) => {
                  const selectedAnswer = selectedAnswers[index];
                  const isCorrect = selectedAnswer === question.correctAnswer;
                  return (
                    <div key={index} className="text-left p-4 rounded-lg bg-white border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <p className="text-sm text-gray-600">
                            Tu respuesta: {question.options[selectedAnswer] || 'No respondida'}
                          </p>
                          <p className="text-sm text-green-600">
                            Respuesta correcta: {question.options[question.correctAnswer]}
                          </p>
                        </div>
                        <Badge variant={isCorrect ? 'success' : 'destructive'}>
                          {isCorrect ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button onClick={() => router.push(`/study-plans/${id}`)} size="lg">
                Volver al Plan
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/study-plans/${params.id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Cuestionario</h1>
            <div className="text-right">
              <Badge variant="secondary">Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}</Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{currentQuestionIndex + 1} / {quiz.questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 mb-6">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4">
                Pregunta {currentQuestionIndex + 1}
              </Badge>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion?.question}
              </h2>
            </div>

            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]?.toString()}
              onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
              variant="outline"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              size="lg"
              className="px-8"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Enviar Cuestionario
            </Button>
            {!allQuestionsAnswered && (
              <p className="text-sm text-gray-600 mt-2">
                Responde todas las preguntas para enviar el cuestionario.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}