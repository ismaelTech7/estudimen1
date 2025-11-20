import { getConfig } from '@/lib/config';
import { encryptionService } from '@/lib/encryption/service';
import { dbService } from '@/lib/db/service';
import type { AISummary, AIFlashcard, AIQuiz, AIStudyPlan } from '@/types';

/**
 * Servicio de integración con Google Gemini API
 */
export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Obtiene la API key del usuario para el proveedor especificado
   */
  private async getUserApiKey(userId: string, provider: 'gemini' | 'openai'): Promise<string | null> {
    try {
      const { data: apiKey, error } = await dbService.getClient()
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('is_active', true)
        .single();

      if (error || !apiKey) {
        return null;
      }

      // Descifrar la API key
      return encryptionService.decryptApiKeyFromStorage(apiKey.encrypted_key);
    } catch (error) {
      console.error('Error getting user API key:', error);
      return null;
    }
  }

  /**
   * Llama a la API de Gemini
   */
  private async callGeminiApi(prompt: string, apiKey: string): Promise<string> {
    const config = getConfig();
    
    const response = await fetch(`${config.GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Genera un plan de estudio con IA
   */
  public async generateStudyPlan(
    userId: string,
    subjects: string[],
    examDate: string,
    dailyHours: number
  ): Promise<AIStudyPlan | null> {
    try {
      const apiKey = await this.getUserApiKey(userId, 'gemini');
      if (!apiKey) {
        throw new Error('No Gemini API key found for user');
      }

      const daysUntilExam = Math.ceil(
        (new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const prompt = `Eres un asistente de planificación de estudios. Crea un plan de estudio detallado para los siguientes requisitos:

**Materias:** ${subjects.join(', ')}
**Fecha del examen:** ${examDate} (${daysUntilExam} días desde hoy)
**Horas diarias disponibles:** ${dailyHours} horas

Por favor, proporciona un plan de estudio que incluya:
1. Distribución óptima del tiempo entre materias
2. Sesiones de estudio diarias con títulos y descripciones
3. Consideración del tiempo disponible hasta el examen
4. Priorización de materias según dificultad y tiempo

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "sessions": [
    {
      "title": "Título de la sesión",
      "description": "Descripción detallada",
      "subject": "Nombre de la materia",
      "duration_minutes": 60,
      "scheduled_date": "YYYY-MM-DD",
      "priority": "high|medium|low"
    }
  ],
  "total_hours": número total de horas,
  "subjects_distribution": {
    "nombre_materia": porcentaje_tiempo
  }
}

Asegúrate de que el JSON sea válido y completo.`;

      const response = await this.callGeminiApi(prompt, apiKey);
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const studyPlan = JSON.parse(jsonMatch[0]) as AIStudyPlan;
      
      // Validar la respuesta
      if (!studyPlan.sessions || !Array.isArray(studyPlan.sessions)) {
        throw new Error('Invalid study plan format');
      }

      return studyPlan;
    } catch (error) {
      console.error('Error generating study plan:', error);
      return null;
    }
  }

  /**
   * Genera un resumen con IA
   */
  public async generateSummary(
    userId: string,
    subject: string,
    content: string
  ): Promise<AISummary | null> {
    try {
      const apiKey = await this.getUserApiKey(userId, 'gemini');
      if (!apiKey) {
        throw new Error('No Gemini API key found for user');
      }

      const prompt = `Eres un asistente de estudio. Crea un resumen educativo claro y conciso para esta materia.

**Materia:** ${subject}
**Contenido:** ${content}

Por favor, proporciona:
1. Un resumen bien estructurado y fácil de entender
2. Puntos clave importantes
3. Tiempo estimado de lectura

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "title": "Título del resumen",
  "content": "Contenido del resumen en formato markdown",
  "key_points": ["punto1", "punto2", "punto3"],
  "estimated_reading_time": minutos
}

Asegúrate de que el JSON sea válido y el contenido sea educativo.`;

      const response = await this.callGeminiApi(prompt, apiKey);
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const summary = JSON.parse(jsonMatch[0]) as AISummary;
      
      // Validar la respuesta
      if (!summary.title || !summary.content) {
        throw new Error('Invalid summary format');
      }

      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return null;
    }
  }

  /**
   * Genera flashcards con IA
   */
  public async generateFlashcards(
    userId: string,
    subject: string,
    content: string,
    count: number = 5
  ): Promise<AIFlashcard[] | null> {
    try {
      const apiKey = await this.getUserApiKey(userId, 'gemini');
      if (!apiKey) {
        throw new Error('No Gemini API key found for user');
      }

      const prompt = `Eres un asistente de estudio. Crea ${count} tarjetas de memoria (flashcards) educativas para esta materia.

**Materia:** ${subject}
**Contenido:** ${content}

Por favor, crea flashcards que:
1. Tengan preguntas claras en el frente
2. Tengan respuestas completas en el reverso
3. Tengan diferentes niveles de dificultad (easy, medium, hard)
4. Sean educativas y relevantes

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "flashcards": [
    {
      "front": "Pregunta o concepto",
      "back": "Respuesta o explicación",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Asegúrate de que el JSON sea válido y contenga exactamente ${count} flashcards.`;

      const response = await this.callGeminiApi(prompt, apiKey);
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const result = JSON.parse(jsonMatch[0]) as { flashcards: AIFlashcard[] };
      
      // Validar la respuesta
      if (!result.flashcards || !Array.isArray(result.flashcards)) {
        throw new Error('Invalid flashcards format');
      }

      return result.flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return null;
    }
  }

  /**
   * Genera un quiz con IA
   */
  public async generateQuiz(
    userId: string,
    subject: string,
    content: string,
    questionCount: number = 5
  ): Promise<AIQuiz | null> {
    try {
      const apiKey = await this.getUserApiKey(userId, 'gemini');
      if (!apiKey) {
        throw new Error('No Gemini API key found for user');
      }

      const prompt = `Eres un asistente de estudio. Crea un cuestionario educativo de ${questionCount} preguntas para esta materia.

**Materia:** ${subject}
**Contenido:** ${content}

Por favor, crea un quiz que:
1. Tenga preguntas de opción múltiple (4 opciones)
2. Tenga solo una respuesta correcta por pregunta
3. Incluya explicaciones para cada respuesta
4. Tenga un nivel de dificultad apropiado
5. Sea educativo y relevante

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "title": "Título del cuestionario",
  "questions": [
    {
      "id": "q1",
      "question": "Pregunta aquí",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct_answer": 0,
      "explanation": "Explicación de la respuesta correcta"
    }
  ],
  "time_limit_minutes": tiempo_estimado,
  "difficulty": "easy|medium|hard"
}

Asegúrate de que el JSON sea válido y contenga exactamente ${questionCount} preguntas.`;

      const response = await this.callGeminiApi(prompt, apiKey);
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const quiz = JSON.parse(jsonMatch[0]) as AIQuiz;
      
      // Validar la respuesta
      if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format');
      }

      // Calcular puntuación máxima
      quiz.max_score = quiz.questions.length * 10;

      return quiz;
    } catch (error) {
      console.error('Error generating quiz:', error);
      return null;
    }
  }

  /**
   * Valida si una API key es válida
   */
  public async validateApiKey(apiKey: string, provider: 'gemini' | 'openai'): Promise<boolean> {
    try {
      if (provider === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Hello' }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1,
            }
          }),
        });

        return response.ok;
      }

      // Para OpenAI, se puede implementar validación similar
      if (provider === 'openai') {
        // Implementar validación de OpenAI API key
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Prueba una clave de Gemini para verificar si funciona
   */
  public async testGeminiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Hello, please respond with "Test successful"' }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        return { 
          success: false, 
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}` 
        };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Prueba una clave de OpenAI para verificar si funciona
   */
  public async testOpenAIKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello, please respond with "Test successful"' }],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        return { 
          success: false, 
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}` 
        };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
}

// Exportar instancia singleton
export const aiService = AIService.getInstance();