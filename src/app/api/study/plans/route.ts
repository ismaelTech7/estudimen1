import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/service';
import { studyService } from '@/lib/study/service';
import { z } from 'zod';
import type { ApiResponse, CreateStudyPlanRequest } from '@/types';

// Esquema de validación
const createStudyPlanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  subjects: z.array(z.string().min(1, 'Subject cannot be empty')).min(1, 'At least one subject is required').max(10, 'Maximum 10 subjects allowed'),
  exam_date: z.string().refine((date) => {
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examDate > today;
  }, 'Exam date must be in the future'),
  daily_hours: z.number().min(0.5, 'Daily hours must be at least 0.5').max(12, 'Daily hours cannot exceed 12'),
});

/**
 * POST /api/study/plans
 * Crea un nuevo plan de estudio
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener el token de autorización
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verificar el token
    let userId: string;
    try {
      const decoded = authService.verifyToken(token);
      userId = decoded.userId;
    } catch {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Validar el cuerpo de la petición
    const validationResult = createStudyPlanSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0].message,
      }, { status: 400 });
    }

    const studyPlanData: CreateStudyPlanRequest = validationResult.data;

    // Crear el plan de estudio
    const studyPlan = await studyService.createStudyPlan(userId, studyPlanData);

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: studyPlan,
      message: 'Study plan created successfully',
    });

  } catch (error) {
    console.error('Create study plan error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No Gemini API key found')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'No API key configured',
          message: 'Please configure your Gemini API key first',
        }, { status: 400 });
      }
      
      if (error.message.includes('Failed to generate study plan with AI')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'AI generation failed',
          message: 'Failed to generate study plan. Please check your API key and try again.',
        }, { status: 500 });
      }
    }

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the study plan',
    }, { status: 500 });
  }
}

/**
 * GET /api/study/plans
 * Obtiene los planes de estudio del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verificar el token
    let userId: string;
    try {
      const decoded = authService.verifyToken(token);
      userId = decoded.userId;
    } catch {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Obtener los planes de estudio del usuario
    const studyPlans = await studyService.getUserStudyPlans(userId);

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: studyPlans,
      message: 'Study plans retrieved successfully',
    });

  } catch (error) {
    console.error('Get study plans error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching study plans',
    }, { status: 500 });
  }
}

/**
 * Manejador para otros métodos HTTP
 */
export async function PUT() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET and POST requests are allowed',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET and POST requests are allowed',
  }, { status: 405 });
}