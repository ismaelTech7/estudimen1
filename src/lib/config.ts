export const CONFIG = {
  // Configuración de JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  
  // Configuración de cifrado
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
  
  // Límites de la aplicación
  MAX_API_KEYS_PER_USER: 5,
  MAX_STUDY_PLANS_PER_USER: 10,
  AI_RATE_LIMIT_PER_MINUTE: 10,
  
  // Configuración de Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Configuración de IA
  GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  OPENAI_API_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
  
  // Configuración de progreso
  MINIMUM_STUDY_TIME_MINUTES: 25, // Pomodoro mínimo
  STREAK_RESET_HOURS: 24,
  
  // Configuración de notificaciones
  NOTIFICATION_BATCH_SIZE: 10,
  MAX_NOTIFICATIONS_PER_USER: 100,
  
  // Configuración de seguridad
  BCRYPT_ROUNDS: 12,
  API_KEY_PREFIX_LENGTH: 8,
  
  // Configuración de almacenamiento
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: ['pdf', 'txt', 'doc', 'docx'],
} as const;

// Validación de variables de entorno requeridas
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Helper para obtener configuración con valores por defecto
export function getConfig() {
  return {
    ...CONFIG,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    JWT_SECRET: process.env.JWT_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
  };
}

// Helper para obtener la clave secreta JWT
export function getJwtSecretKey() {
  return process.env.JWT_SECRET || CONFIG.JWT_SECRET;
}