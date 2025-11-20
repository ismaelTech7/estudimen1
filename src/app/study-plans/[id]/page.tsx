'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  FileText, 
  Brain,
  ArrowLeft,
  Plus,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subjects: Array<{
    id: string;
    name: string;
    examDate: string;
    priority: 'low' | 'medium' | 'high';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedHours: number;
  }>;
  dailyHours: number;
  startDate: string;
  endDate?: string;
  totalSessions: number;
  completedSessions: number;
  isActive: boolean;
  createdAt: string;
  sessions: StudySession[];
  resources: Resource[];
}

interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  scheduledDate: string;
  duration: number;
  type: 'study' | 'review' | 'practice';
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string;
  notes?: string;
}

interface Resource {
  id: string;
  type: 'summary' | 'flashcard' | 'quiz';
  title: string;
  subjectId: string;
  subjectName: string;
  content: any;
  createdAt: string;
}

export default function StudyPlanDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchStudyPlan();
  }, [user, router, planId]);

  const fetchStudyPlan = async () => {
    try {
      const response = await fetch(`/api/study/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
      } else {
        toast.error(data.error || 'Error al cargar el plan de estudio');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching study plan:', error);
      toast.error('Error al conectar con el servidor');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!plan || plan.totalSessions === 0) return 0;
    return Math.round((plan.completedSessions / plan.totalSessions) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'easy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              <p className="text-gray-600">{plan.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/study-plans/${planId}/study`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Comenzar Estudio
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
              <Progress value={getProgressPercentage()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plan.completedSessions}</div>
              <p className="text-xs text-muted-foreground">de {plan.totalSessions} sesiones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Diarias</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plan.dailyHours}h</div>
              <p className="text-xs text-muted-foreground">tiempo estimado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plan.subjects.length}</div>
              <p className="text-xs text-muted-foreground">materias a estudiar</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle>Asignaturas</CardTitle>
                  <CardDescription>
                    Lista de materias incluidas en tu plan de estudio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-lg">{subject.name}</h3>
                          <p className="text-sm text-gray-600">
                            Examen: {formatDate(subject.examDate)} • {subject.estimatedHours}h estimadas
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(subject.priority)}>
                            Prioridad: {subject.priority}
                          </Badge>
                          <Badge className={getDifficultyColor(subject.difficulty)}>
                            Dificultad: {subject.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Plan</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Fechas Importantes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inicio del plan:</span>
                        <span className="font-medium">{formatDate(plan.startDate)}</span>
                      </div>
                      {plan.endDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fin del plan:</span>
                          <span className="font-medium">{formatDate(plan.endDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Estadísticas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sesiones totales:</span>
                        <span className="font-medium">{plan.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sesiones completadas:</span>
                        <span className="font-medium">{plan.completedSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sesiones pendientes:</span>
                        <span className="font-medium">{plan.totalSessions - plan.completedSessions}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Sesiones de Estudio</CardTitle>
                <CardDescription>
                  Programa y gestiona tus sesiones de estudio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plan.sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No hay sesiones programadas aún</p>
                    <Button onClick={() => router.push(`/study-plans/${planId}/generate-sessions`)}>
                      Generar Sesiones
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plan.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{session.subjectName}</h4>
                            <Badge className={getSessionStatusColor(session.status)}>
                              {session.status === 'pending' ? 'Pendiente' : 
                               session.status === 'completed' ? 'Completada' : 'Omitida'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.scheduledDate)} • {formatTime(session.scheduledDate)} • {session.duration} minutos
                          </p>
                          {session.notes && (
                            <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {session.status === 'pending' && (
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recursos de Estudio</h3>
                <Button onClick={() => router.push(`/study-plans/${planId}/generate-resources`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Recursos
                </Button>
              </div>

              {plan.resources.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay recursos aún</h3>
                    <p className="text-gray-600 mb-4">
                      Genera resúmenes, flashcards y quizzes con inteligencia artificial
                    </p>
                    <Button onClick={() => router.push(`/study-plans/${planId}/generate-resources`)}>
                      Generar Primeros Recursos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plan.resources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                          <Badge variant="secondary">
                            {resource.type === 'summary' ? 'Resumen' :
                             resource.type === 'flashcard' ? 'Flashcard' : 'Quiz'}
                          </Badge>
                        </div>
                        <CardDescription>{resource.subjectName}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Creado el {new Date(resource.createdAt).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}