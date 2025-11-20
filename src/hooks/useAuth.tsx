'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import type { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personalizado para autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Proveedor de autenticación
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        
        if (accessToken && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const accessToken = localStorage.getItem('access_token');
    
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el token expiró, intentar refrescarlo
    if (response.status === 401) {
      try {
        await refreshToken();
        
        // Reintentar la petición con el nuevo token
        const newAccessToken = localStorage.getItem('access_token');
        const newHeaders = {
          ...options.headers,
          'Content-Type': 'application/json',
          ...(newAccessToken && { 'Authorization': `Bearer ${newAccessToken}` }),
        };

        return fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } catch (refreshError) {
        // Si falla el refresco, hacer logout
        await logout();
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  }, []);

  // Función de login
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Login failed');
    }

    // Guardar tokens y usuario
    localStorage.setItem('access_token', result.data.access_token);
    localStorage.setItem('refresh_token', result.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    
    setUser(result.data.user);
  };

  // Función de registro
  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    // Guardar tokens y usuario
    localStorage.setItem('access_token', result.data.access_token);
    localStorage.setItem('refresh_token', result.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    
    setUser(result.data.user);
  };

  // Función de logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar almacenamiento local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      setUser(null);
    }
  };

  // Función de refresco de token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Token refresh failed');
    }

    // Actualizar tokens
    localStorage.setItem('access_token', result.data.access_token);
    localStorage.setItem('refresh_token', result.data.refresh_token);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}