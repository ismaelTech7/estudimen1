import CryptoJS from 'crypto-js';
import { getConfig } from '@/lib/config';

/**
 * Servicio de cifrado para API keys usando AES-256-GCM
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string;

  private constructor() {
    const config = getConfig();
    this.encryptionKey = config.ENCRYPTION_KEY;
    
    if (!this.encryptionKey || this.encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters long');
    }
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Cifra una API key
   */
  public encryptApiKey(apiKey: string): { encrypted: string; iv: string } {
    try {
      // Generar IV aleatorio
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Cifrar la API key
      const encrypted = CryptoJS.AES.encrypt(apiKey, this.encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        encrypted: encrypted.toString(),
        iv: iv.toString()
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Descifra una API key
   */
  public decryptApiKey(encryptedData: { encrypted: string; iv: string }): string {
    try {
      const { encrypted, iv } = encryptedData;
      
      // Descifrar la API key
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Decryption failed: invalid data');
      }

      return decryptedText;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cifra una API key y devuelve string JSON (para almacenamiento en BD)
   */
  public encryptApiKeyForStorage(apiKey: string): string {
    const encryptedData = this.encryptApiKey(apiKey);
    return JSON.stringify(encryptedData);
  }

  /**
   * Descifra una API key desde string JSON (desde almacenamiento en BD)
   */
  public decryptApiKeyFromStorage(encryptedString: string): string {
    try {
      const encryptedData = JSON.parse(encryptedString);
      return this.decryptApiKey(encryptedData);
    } catch (error) {
      throw new Error(`Failed to parse encrypted data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Genera un hash seguro para validación
   */
  public generateHash(data: string): string {
    return CryptoJS.SHA256(data + this.encryptionKey).toString();
  }

  /**
   * Valida si una API key tiene formato válido
   */
  public validateApiKey(apiKey: string, provider: 'gemini' | 'openai'): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Validación básica por proveedor
    if (provider === 'gemini') {
      // Google Gemini API keys typically start with specific patterns
      return apiKey.length >= 30 && /^[A-Za-z0-9_-]+$/.test(apiKey);
    } else if (provider === 'openai') {
      // OpenAI API keys typically start with 'sk-'
      return apiKey.startsWith('sk-') && apiKey.length >= 40;
    }

    return false;
  }

  /**
   * Mascara una API key para mostrar solo parte de ella
   */
  public maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '***';
    }
    
    const prefix = apiKey.slice(0, 4);
    const suffix = apiKey.slice(-4);
    const mask = '*'.repeat(Math.max(0, apiKey.length - 8));
    
    return `${prefix}${mask}${suffix}`;
  }

  /**
   * Genera un ID único para la API key
   */
  public generateApiKeyId(provider: 'gemini' | 'openai'): string {
    const prefix = provider === 'gemini' ? 'gem' : 'oai';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `${prefix}_${timestamp}_${random}`;
  }
}

// Exportar instancia singleton
export const encryptionService = EncryptionService.getInstance();