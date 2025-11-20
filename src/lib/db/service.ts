import { createClient } from '@supabase/supabase-js';
import { getConfig } from '@/lib/config';

/**
 * Servicio de base de datos usando Supabase
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private client: ReturnType<typeof createClient>;

  private constructor() {
    const config = getConfig();
    
    this.client = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'x-application-name': 'estudimen',
          },
        },
        db: {
          schema: 'public',
        },
      }
    );
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient() {
    return this.client;
  }

  /**
   * Obtiene el cliente de autenticación
   */
  public getAuth() {
    return this.client.auth;
  }

  /**
   * Obtiene el cliente de base de datos
   */
  public getDb() {
    return this.client.from;
  }

  /**
   * Ejecuta una consulta SQL cruda
   */
  public async executeQuery(query: string, params?: any[]) {
    try {
      const { data, error } = await this.client.rpc('exec_sql', { query, params });
      
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Inicia una transacción
   */
  public async beginTransaction() {
    await this.executeQuery('BEGIN');
  }

  /**
   * Confirma una transacción
   */
  public async commitTransaction() {
    await this.executeQuery('COMMIT');
  }

  /**
   * Revierte una transacción
   */
  public async rollbackTransaction() {
    await this.executeQuery('ROLLBACK');
  }

  /**
   * Ejecuta una operación dentro de una transacción
   */
  public async transaction<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.beginTransaction();
      const result = await operation();
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Verifica la conexión a la base de datos
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('users').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const dbService = DatabaseService.getInstance();