'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Square, CheckCircle, AlertCircle, Clock, BookOpen, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StudySession, StudySessionStatus } from '@/types';

interface StudySessionPageProps {
  params: Promise<{ id: string; sessionId: string }>;
}

export default async function StudySessionPage({ params }: StudySessionPageProps) {
  const { id, sessionId } = await params;
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState<StudySession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<StudySessionStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer functionality
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentStatus('in_progress');
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    setIsActive(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(async () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentStatus('completed');
    
    // Update session status
    try {
      const response = await fetch(`/api/study/sessions/${session?.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          actualDuration: session!.duration * 60 - timeRemaining,
          status: 'completed' as StudySessionStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [session, timeRemaining]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            setCurrentStatus('completed');
            stopTimer();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && timeRemaining !== 0) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, stopTimer]);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/study/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const sessionData = await response.json();
        setSession(sessionData);
        setTimeRemaining(sessionData.duration * 60); // Convert minutes to seconds
        setCurrentStatus(sessionData.status);
        setLoading(false);
      } catch (error) {
        setError('Failed to load study session');
        setLoading(false);
      }
    };

    if (user) {
      fetchSession();
    }
  }, [sessionId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sesión de estudio...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la sesión'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = session ? ((session.duration * 60 - timeRemaining) / (session.duration * 60)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sesión de Estudio</h1>
              <p className="text-gray-600">Plan: {session.studyPlan.title}</p>
            </div>
            <Badge variant={currentStatus === 'completed' ? 'success' : currentStatus === 'in_progress' ? 'default' : 'secondary'}>
              {currentStatus === 'pending' && 'Pendiente'}
              {currentStatus === 'in_progress' && 'En Progreso'}
              {currentStatus === 'completed' && 'Completado'}
              {currentStatus === 'cancelled' && 'Cancelado'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Asignatura</p>
                  <p className="font-semibold">{session.subject}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Objetivo</p>
                  <p className="font-semibold">{session.objective}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-semibold">{session.duration} minutos</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Timer Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl font-mono font-bold text-indigo-600 mb-4">
                {formatTime(timeRemaining)}
              </div>
              <Progress value={progress} className="h-2 mb-4" />
              <p className="text-sm text-gray-600">
                {Math.round(progress)}% completado
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!isActive && !isPaused && currentStatus !== 'completed' && (
                <Button onClick={startTimer} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar
                </Button>
              )}
              
              {isActive && (
                <Button onClick={pauseTimer} size="lg" variant="outline" className="px-8">
                  <Pause className="h-5 w-5 mr-2" />
                  Pausar
                </Button>
              )}
              
              {isPaused && (
                <Button onClick={resumeTimer} size="lg" className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Reanudar
                </Button>
              )}
              
              {(isActive || isPaused) && (
                <Button onClick={stopTimer} size="lg" variant="destructive" className="px-8">
                  <Square className="h-5 w-5 mr-2" />
                  Finalizar
                </Button>
              )}
            </div>

            {currentStatus === 'completed' && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">¡Sesión Completada!</h3>
                <p className="text-green-700">Has completado tu sesión de estudio exitosamente.</p>
                <Button 
                  onClick={() => router.push(`/study-plans/${id}`)} 
                  className="mt-4"
                >
                  Volver al Plan
                </Button>
              </div>
            )}
          </Card>

          {/* Session Notes */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Notas de la Sesión</h3>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Añade tus notas, reflexiones o puntos importantes de esta sesión..."
              defaultValue={session.notes || ''}
              onBlur={async (e) => {
                try {
                  await fetch(`/api/study/sessions/${session.id}/notes`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                    body: JSON.stringify({ notes: e.target.value }),
                  });
                } catch (error) {
                  console.error('Error saving notes:', error);
                }
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}