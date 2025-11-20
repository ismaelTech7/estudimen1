import { dbService } from '@/lib/db/service';

// Re-exportar el cliente de Supabase desde nuestro servicio
export const supabase = dbService.getClient();