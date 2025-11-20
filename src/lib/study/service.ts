import { dbService } from '@/lib/db/service';
import { aiService } from '@/lib/ai/service';
import type { 
  StudyPlan, 
  StudySession, 
  AIStudyPlan, 
  CreateStudyPlanRequest,
  Resource,
  AISummary,
  AIFlashcard,
  AIQuiz 
} from '@/types';

/**
 * Servicio de planificación y gestión de estudios
 */
export class StudyService {
  private static instance: StudyService;

  private constructor() {}

  public static getInstance(): StudyService {
    if (!StudyService.instance) {
      StudyService.instance = new StudyService();
    }
    return StudyService.instance;
  }

  /**
   * Crea un nuevo plan de estudio
   */
  public async createStudyPlan(userId: string, request: CreateStudyPlanRequest): Promise<StudyPlan> {
    try {
      // Generar plan con IA
      const aiPlan = await aiService.generateStudyPlan(
        userId,
        request.subjects,
        request.exam_date,
        request.daily_hours
      );

      if (!aiPlan) {
        throw new Error('Failed to generate study plan with AI');
      }

      // Crear el plan de estudio en la base de datos
      const { data: studyPlan, error: planError } = await dbService.getClient()
        .from('study_plans')
        .insert({
          user_id: userId,
          title: request.title,
          description: request.description,
          subjects: request.subjects,
          exam_date: request.exam_date,
          daily_hours: request.daily_hours,
          total_sessions: aiPlan.sessions.length,
          completed_sessions: 0,
          is_active: true,
        })
        .select()
        .single();

      if (planError || !studyPlan) {
        throw new Error(`Failed to create study plan: ${planError?.message}`);
      }

      // Crear las sesiones de estudio
      const sessions = aiPlan.sessions.map(session => ({
        user_id: userId,
        study_plan_id: studyPlan.id,
        title: session.title,
        description: session.description,
        subject: session.subject,
        duration_minutes: session.duration_minutes,
        scheduled_date: session.scheduled_date,
        completed_at: null,
        score: null,
        notes: null,
      }));

      const { error: sessionsError } = await dbService.getClient()
        .from('study_sessions')
        .insert(sessions);

      if (sessionsError) {
        // Si falla la creación de sesiones, eliminar el plan
        await dbService.getClient()
          .from('study_plans')
          .delete()
          .eq('id', studyPlan.id);
        
        throw new Error(`Failed to create study sessions: ${sessionsError.message}`);
      }

      return studyPlan as StudyPlan;
    } catch (error) {
      throw new Error(`Failed to create study plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene los planes de estudio de un usuario
   */
  public async getUserStudyPlans(userId: string): Promise<StudyPlan[]> {
    try {
      const { data, error } = await dbService.getClient()
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch study plans: ${error.message}`);
      }

      return (data || []) as StudyPlan[];
    } catch (error) {
      throw new Error(`Failed to get study plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene un plan de estudio específico
   */
  public async getStudyPlan(userId: string, planId: string): Promise<StudyPlan | null> {
    try {
      const { data, error } = await dbService.getClient()
        .from('study_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as StudyPlan;
    } catch (error) {
      throw new Error(`Failed to get study plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene las sesiones de un plan de estudio
   */
  public async getStudySessions(planId: string): Promise<StudySession[]> {
    try {
      const { data, error } = await dbService.getClient()
        .from('study_sessions')
        .select('*')
        .eq('study_plan_id', planId)
        .order('scheduled_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch study sessions: ${error.message}`);
      }

      return (data || []) as StudySession[];
    } catch (error) {
      throw new Error(`Failed to get study sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Completa una sesión de estudio
   */
  public async completeStudySession(
    userId: string,
    sessionId: string,
    score?: number,
    notes?: string
  ): Promise<StudySession> {
    try {
      // Verificar que la sesión pertenece al usuario
      const { data: session, error: sessionError } = await dbService.getClient()
        .from('study_sessions')
        .select('study_plan_id')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !session) {
        throw new Error('Study session not found or unauthorized');
      }

      // Actualizar la sesión
      const { data: updatedSession, error: updateError } = await dbService.getClient()
        .from('study_sessions')
        .update({
          completed_at: new Date().toISOString(),
          score: score || null,
          notes: notes || null,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError || !updatedSession) {
        throw new Error(`Failed to complete study session: ${updateError?.message}`);
      }

      // Actualizar el contador de sesiones completadas en el plan
      await this.updateCompletedSessionsCount(session.study_plan_id);

      return updatedSession as StudySession;
    } catch (error) {
      throw new Error(`Failed to complete study session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Genera un resumen para una materia
   */
  public async generateSummary(
    userId: string,
    studyPlanId: string,
    subject: string,
    content: string
  ): Promise<Resource> {
    try {
      // Generar resumen con IA
      const aiSummary = await aiService.generateSummary(userId, subject, content);
      
      if (!aiSummary) {
        throw new Error('Failed to generate summary with AI');
      }

      // Guardar el recurso en la base de datos
      const { data: resource, error } = await dbService.getClient()
        .from('resources')
        .insert({
          user_id: userId,
          study_plan_id: studyPlanId,
          type: 'summary',
          title: aiSummary.title,
          content: aiSummary.content,
          metadata: {
            key_points: aiSummary.key_points,
            estimated_reading_time: aiSummary.estimated_reading_time,
            subject,
          },
        })
        .select()
        .single();

      if (error || !resource) {
        throw new Error(`Failed to save summary: ${error?.message}`);
      }

      return resource as Resource;
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Genera flashcards para una materia
   */
  public async generateFlashcards(
    userId: string,
    studyPlanId: string,
    subject: string,
    content: string,
    count: number = 5
  ): Promise<void> {
    try {
      // Generar flashcards con IA
      const aiFlashcards = await aiService.generateFlashcards(userId, subject, content, count);
      
      if (!aiFlashcards) {
        throw new Error('Failed to generate flashcards with AI');
      }

      // Guardar las flashcards en la base de datos
      const flashcards = aiFlashcards.map(flashcard => ({
        user_id: userId,
        study_plan_id: studyPlanId,
        front: flashcard.front,
        back: flashcard.back,
        difficulty: flashcard.difficulty,
        last_reviewed: null,
        review_count: 0,
        correct_count: 0,
      }));

      const { error } = await dbService.getClient()
        .from('flashcards')
        .insert(flashcards);

      if (error) {
        throw new Error(`Failed to save flashcards: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Genera un quiz para una materia
   */
  public async generateQuiz(
    userId: string,
    studyPlanId: string,
    subject: string,
    content: string,
    questionCount: number = 5
  ): Promise<Resource> {
    try {
      // Generar quiz con IA
      const aiQuiz = await aiService.generateQuiz(userId, subject, content, questionCount);
      
      if (!aiQuiz) {
        throw new Error('Failed to generate quiz with AI');
      }

      // Guardar el recurso en la base de datos
      const { data: resource, error } = await dbService.getClient()
        .from('resources')
        .insert({
          user_id: userId,
          study_plan_id: studyPlanId,
          type: 'quiz',
          title: aiQuiz.title,
          content: JSON.stringify(aiQuiz.questions),
          metadata: {
            time_limit_minutes: aiQuiz.time_limit_minutes,
            difficulty: aiQuiz.difficulty,
            max_score: aiQuiz.max_score,
            subject,
          },
        })
        .select()
        .single();

      if (error || !resource) {
        throw new Error(`Failed to save quiz: ${error?.message}`);
      }

      return resource as Resource;
    } catch (error) {
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene los recursos de un plan de estudio
   */
  public async getStudyPlanResources(studyPlanId: string): Promise<Resource[]> {
    try {
      const { data, error } = await dbService.getClient()
        .from('resources')
        .select('*')
        .eq('study_plan_id', studyPlanId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch resources: ${error.message}`);
      }

      return (data || []) as Resource[];
    } catch (error) {
      throw new Error(`Failed to get resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene las flashcards de un plan de estudio
   */
  public async getStudyPlanFlashcards(studyPlanId: string): Promise<any[]> {
    try {
      const { data, error } = await dbService.getClient()
        .from('flashcards')
        .select('*')
        .eq('study_plan_id', studyPlanId)
        .order('difficulty', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch flashcards: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to get flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza el contador de sesiones completadas
   */
  private async updateCompletedSessionsCount(planId: string): Promise<void> {
    try {
      // Contar sesiones completadas
      const { count, error: countError } = await dbService.getClient()
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('study_plan_id', planId)
        .not('completed_at', 'is', null);

      if (countError) {
        throw new Error(`Failed to count completed sessions: ${countError.message}`);
      }

      // Actualizar el plan
      const { error: updateError } = await dbService.getClient()
        .from('study_plans')
        .update({
          completed_sessions: count || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      if (updateError) {
        throw new Error(`Failed to update completed sessions count: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Error updating completed sessions count:', error);
    }
  }

  /**
   * Elimina un plan de estudio
   */
  public async deleteStudyPlan(userId: string, planId: string): Promise<void> {
    try {
      // Verificar que el plan pertenece al usuario
      const plan = await this.getStudyPlan(userId, planId);
      if (!plan) {
        throw new Error('Study plan not found or unauthorized');
      }

      // Eliminar en orden: primero las dependencias
      await dbService.getClient().transaction(async () => {
        // Eliminar flashcards
        await dbService.getClient()
          .from('flashcards')
          .delete()
          .eq('study_plan_id', planId);

        // Eliminar recursos
        await dbService.getClient()
          .from('resources')
          .delete()
          .eq('study_plan_id', planId);

        // Eliminar sesiones
        await dbService.getClient()
          .from('study_sessions')
          .delete()
          .eq('study_plan_id', planId);

        // Eliminar el plan
        await dbService.getClient()
          .from('study_plans')
          .delete()
          .eq('id', planId);
      });
    } catch (error) {
      throw new Error(`Failed to delete study plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Exportar instancia singleton
export const studyService = StudyService.getInstance();