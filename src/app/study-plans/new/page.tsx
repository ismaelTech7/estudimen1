'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Calendar, Clock, BookOpen, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  examDate: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
}

export default function NewStudyPlanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dailyHours: 2,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    subjects: [] as Subject[]
  });
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    examDate: '',
    priority: 'medium',
    difficulty: 'medium',
    estimatedHours: 10
  });

  const addSubject = () => {
    if (!newSubject.name || !newSubject.examDate) {
      toast.error('Por favor completa el nombre de la asignatura y la fecha del examen');
      return;
    }

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      examDate: newSubject.examDate,
      priority: newSubject.priority || 'medium',
      difficulty: newSubject.difficulty || 'medium',
      estimatedHours: newSubject.estimatedHours || 10
    };

    setSubjects([...subjects, subject]);
    setNewSubject({
      name: '',
      examDate: '',
      priority: 'medium',
      difficulty: 'medium',
      estimatedHours: 10
    });
    toast.success('Asignatura añadida');
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast.success('Asignatura eliminada');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Por favor ingresa un título para el plan de estudio');
      return;
    }

    if (subjects.length === 0) {
      toast.error('Por favor añade al menos una asignatura');
      return;
    }

    if (!user?.id) {
      toast.error('Debes estar autenticado para crear un plan de estudio');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/study/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          dailyHours: formData.dailyHours,
          startDate: formData.startDate,
          endDate: formData.endDate,
          subjects: subjects.map(s => ({
            name: s.name,
            examDate: s.examDate,
            priority: s.priority,
            difficulty: s.difficulty,
            estimatedHours: s.estimatedHours
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el plan de estudio');
      }

      toast.success('¡Plan de estudio creado exitosamente!');
      router.push(`/study-plans/${data.plan.id}`);
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el plan de estudio');
    } finally {
      setLoading(false);
    }
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

  const totalEstimatedHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
  const totalDays = Math.ceil(totalEstimatedHours / formData.dailyHours);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Plan de Estudio</h1>
          <p className="text-gray-600">Configura tu plan personalizado con ayuda de inteligencia artificial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Información General
              </CardTitle>
              <CardDescription>
                Define los parámetros básicos de tu plan de estudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Plan</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Preparación Exámenes Finales"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe los objetivos de tu plan de estudio..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dailyHours" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horas diarias
                  </Label>
                  <Input
                    id="dailyHours"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.dailyHours}
                    onChange={(e) => setFormData({ ...formData, dailyHours: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de inicio
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Fecha de fin (Opcional)
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asignaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Asignaturas</span>
                <Badge variant="secondary">{subjects.length} asignaturas</Badge>
              </CardTitle>
              <CardDescription>
                Añade las asignaturas que necesitas estudiar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para añadir asignatura */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Añadir Nueva Asignatura</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="subjectName">Nombre</Label>
                    <Input
                      id="subjectName"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="Ej: Matemáticas"
                    />
                  </div>

                  <div>
                    <Label htmlFor="examDate">Fecha del Examen</Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={newSubject.examDate}
                      onChange={(e) => setNewSubject({ ...newSubject, examDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select
                      value={newSubject.priority}
                      onValueChange={(value) => setNewSubject({ ...newSubject, priority: value as any })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Dificultad</Label>
                    <Select
                      value={newSubject.difficulty}
                      onValueChange={(value) => setNewSubject({ ...newSubject, difficulty: value as any })}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor="estimatedHours">Horas Estimadas de Estudio</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="1"
                    max="100"
                    value={newSubject.estimatedHours}
                    onChange={(e) => setNewSubject({ ...newSubject, estimatedHours: parseInt(e.target.value) })}
                  />
                </div>

                <Button
                  type="button"
                  onClick={addSubject}
                  className="mt-3"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Asignatura
                </Button>
              </div>

              {/* Lista de asignaturas */}
              {subjects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Asignaturas Añadidas</h4>
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-sm text-gray-600">
                            Examen: {new Date(subject.examDate).toLocaleDateString()} • {subject.estimatedHours}h estimadas
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getPriorityColor(subject.priority)}>
                              Prioridad: {subject.priority}
                            </Badge>
                            <Badge className={getDifficultyColor(subject.difficulty)}>
                              Dificultad: {subject.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubject(subject.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen */}
              {subjects.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Resumen del Plan</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Total de horas estimadas: <strong>{totalEstimatedHours}h</strong></div>
                    <div>Horas diarias planificadas: <strong>{formData.dailyHours}h</strong></div>
                    <div>Días estimados de estudio: <strong>{totalDays} días</strong></div>
                    <div>Asignaturas: <strong>{subjects.length}</strong></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || subjects.length === 0}
            >
              {loading ? 'Creando Plan...' : 'Crear Plan de Estudio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}