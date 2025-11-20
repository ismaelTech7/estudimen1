'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BookOpen, Calendar, Target, TrendingUp, Plus, Settings, LogOut, Key, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  exam_date: string;
  daily_hours: number;
  total_sessions: number;
  completed_sessions: number;
  is_active: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchStudyPlans();
  }, [isAuthenticated, router]);

  const fetchStudyPlans = async () => {
    try {
      const response = await fetch('/api/study/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setStudyPlans(result.data);
      } else {
        toast.error('Error al cargar planes de estudio');
      }
    } catch (error) {
      console.error('Error fetching study plans:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
      router.push('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null; // El router redirigirá
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold gradient-text">Estudimen</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/api-keys">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Claves API
                </Button>
              </Link>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Bienvenido, {user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyPlans.length}</div>
              <p className="text-xs text-muted-foreground">
                {studyPlans.filter(p => p.is_active).length} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studyPlans.reduce((acc, plan) => acc + plan.completed_sessions, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de sesiones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Examen</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studyPlans.length > 0 
                  ? formatDate(studyPlans[0].exam_date)
                  : 'No hay exámenes'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Fecha del examen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studyPlans.length > 0
                  ? Math.round(studyPlans.reduce((acc, plan) => 
                      acc + getProgressPercentage(plan.completed_sessions, plan.total_sessions), 0) / studyPlans.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Progreso general
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tus Planes de Estudio
          </h2>
          <Link href="/study-plans/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </Link>
        </div>

        {/* Study Plans */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Cargando planes de estudio...</p>
          </div>
        ) : studyPlans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No tienes planes de estudio aún
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Crea tu primer plan de estudio y comienza a aprender con IA
              </p>
              <Link href="/study-plans/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-1">
                        <span>Progreso</span>
                        <span>{plan.completed_sessions}/{plan.total_sessions} sesiones</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(plan.completed_sessions, plan.total_sessions)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {plan.subjects.slice(0, 3).map((subject, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                      {plan.subjects.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                          +{plan.subjects.length - 3} más
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-300">
                        Examen: {formatDate(plan.exam_date)}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {plan.daily_hours}h/día
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/study-plans/${plan.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/study-plans/${plan.id}/study`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Estudiar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}