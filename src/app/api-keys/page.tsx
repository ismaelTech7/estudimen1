'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Shield, CheckCircle, AlertTriangle, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  provider: 'gemini' | 'openai';
  name: string;
  keyMask: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState({
    provider: 'gemini' as 'gemini' | 'openai',
    name: '',
    key: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener las claves API');
      }

      const data = await response.json();
      setApiKeys(data.keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Error al cargar las claves API');
    } finally {
      setLoading(false);
    }
  };

  const addApiKey = async () => {
    if (!newKey.name.trim() || !newKey.key.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar formato de clave según el proveedor
    if (newKey.provider === 'gemini' && !newKey.key.startsWith('AIza')) {
      toast.error('La clave de Gemini debe comenzar con "AIza"');
      return;
    }

    if (newKey.provider === 'openai' && !newKey.key.startsWith('sk-')) {
      toast.error('La clave de OpenAI debe comenzar con "sk-"');
      return;
    }

    try {
      const response = await fetch('/api/user/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          provider: newKey.provider,
          name: newKey.name,
          key: newKey.key,
          expiresAt: newKey.expiresAt || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al añadir la clave API');
      }

      toast.success('¡Clave API añadida exitosamente!');
      setNewKey({ provider: 'gemini', name: '', key: '', expiresAt: '' });
      fetchApiKeys();
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error(error instanceof Error ? error.message : 'Error al añadir la clave API');
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clave API?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la clave API');
      }

      toast.success('Clave API eliminada exitosamente');
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Error al eliminar la clave API');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(showKey === keyId ? null : keyId);
  };

  const testApiKey = async (keyId: string, provider: string) => {
    try {
      const response = await fetch(`/api/user/keys/${keyId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`¡Clave ${provider} funcionando correctamente!`);
      } else {
        toast.error(`Error: ${data.error || 'La clave no es válida o ha expirado'}`);
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      toast.error('Error al probar la clave API');
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return {
          name: 'Google Gemini',
          color: 'bg-blue-100 text-blue-800',
          icon: '🔷',
          description: 'Modelo de lenguaje de Google'
        };
      case 'openai':
        return {
          name: 'OpenAI GPT',
          color: 'bg-green-100 text-green-800',
          icon: '🤖',
          description: 'Modelo GPT de OpenAI'
        };
      default:
        return {
          name: provider,
          color: 'bg-gray-100 text-gray-800',
          icon: '🔑',
          description: 'Proveedor de IA'
        };
    }
  };

  const isKeyExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Claves API</h1>
          <p className="text-gray-600">
            Configura tus claves de API para acceder a los servicios de inteligencia artificial
          </p>
        </div>

        {/* Información de seguridad */}
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Tus claves API se almacenan de forma segura usando cifrado AES-256-GCM. Nunca se comparten con terceros y solo se utilizan para generar tus planes de estudio personalizados.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Mis Claves API</TabsTrigger>
            <TabsTrigger value="add">Añadir Nueva Clave</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Claves API Configuradas
                </CardTitle>
                <CardDescription>
                  Administra tus claves API existentes. Puedes probarlas, verificar su estado o eliminarlas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No tienes claves API configuradas</p>
                    <Button onClick={() => document.querySelector('[data-state="add"]')?.click()}>
                      Añadir Primera Clave
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => {
                      const provider = getProviderInfo(apiKey.provider);
                      const expired = isKeyExpired(apiKey.expiresAt);
                      
                      return (
                        <div key={apiKey.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{provider.icon}</span>
                                <h3 className="font-medium">{apiKey.name}</h3>
                                <Badge className={provider.color}>{provider.name}</Badge>
                                {apiKey.isActive && <Badge variant="outline" className="bg-green-50 text-green-700">Activa</Badge>}
                                {expired && <Badge variant="destructive">Expirada</Badge>}
                              </div>
                              
                              <div className="text-sm text-gray-600 mb-2">
                                {provider.description}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Key className="h-3 w-3" />
                                <span>Clave: {showKey === apiKey.id ? apiKey.keyMask : '••••••••••••'}</span>
                                <button
                                  onClick={() => toggleKeyVisibility(apiKey.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {showKey === apiKey.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                              </div>

                              <div className="text-xs text-gray-500">
                                <div>Creada: {new Date(apiKey.createdAt).toLocaleDateString()}</div>
                                {apiKey.expiresAt && (
                                  <div className={expired ? 'text-red-600' : ''}>
                                    Expira: {new Date(apiKey.expiresAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testApiKey(apiKey.id, apiKey.provider)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Probar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteApiKey(apiKey.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Añadir Nueva Clave API
                </CardTitle>
                <CardDescription>
                  Ingresa los detalles de tu clave API. Asegúrate de tener una clave válida de Gemini o OpenAI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider">Proveedor de IA</Label>
                  <select
                    id="provider"
                    value={newKey.provider}
                    onChange={(e) => setNewKey({ ...newKey, provider: e.target.value as 'gemini' | 'openai' })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI GPT</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="name">Nombre de la Clave</Label>
                  <Input
                    id="name"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    placeholder="Ej: Mi Clave Gemini Pro"
                  />
                </div>

                <div>
                  <Label htmlFor="key">Clave API</Label>
                  <Input
                    id="key"
                    type="password"
                    value={newKey.key}
                    onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                    placeholder={newKey.provider === 'gemini' ? 'AIza...' : 'sk-...'}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {newKey.provider === 'gemini' 
                      ? 'Tu clave de Gemini debe comenzar con "AIza"' 
                      : 'Tu clave de OpenAI debe comenzar con "sk-"'
                    }
                  </p>
                </div>

                <div>
                  <Label htmlFor="expiresAt">Fecha de Expiración (Opcional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newKey.expiresAt}
                    onChange={(e) => setNewKey({ ...newKey, expiresAt: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Puedes establecer una fecha de expiración para recordarte renovar tu clave
                  </p>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Mantén tu clave API segura y nunca la compartas. 
                    Las claves gratuitas tienen límites de uso, considera obtener una clave de pago para uso intensivo.
                  </AlertDescription>
                </Alert>

                <Button onClick={addApiKey} className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Añadir Clave API
                </Button>

                {/* Guías rápidas */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">¿Cómo obtener tu clave API?</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>
                      <strong>Google Gemini:</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                        <li>Ve a <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                        <li>Inicia sesión con tu cuenta de Google</li>
                        <li>Haz clic en "Create API Key"</li>
                        <li>Copia tu clave y pégala aquí</li>
                      </ol>
                    </div>
                    <div>
                      <strong>OpenAI:</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                        <li>Ve a <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></li>
                        <li>Inicia sesión con tu cuenta</li>
                        <li>Haz clic en "Create new secret key"</li>
                        <li>Copia tu clave y pégala aquí</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}