# 🧠 Estudimen - Planificador de Estudios con IA

Una aplicación web inteligente que ayuda a estudiantes a planificar sus estudios usando inteligencia artificial. Los usuarios proporcionan sus propias claves API de Gemini u OpenAI para generar planes personalizados sin costos adicionales.

## 🌟 Características Principales

- **Planificación Inteligente**: Genera planes de estudio personalizados basados en tus materias, fechas de examen y horas disponibles
- **Gestión de API Keys**: Los usuarios usan sus propias claves de Gemini/OpenAI (modelo de negocio sin costos de IA)
- **Seguimiento de Progreso**: Visualiza tu avance con estadísticas detalladas y gráficos interactivos
- **Generación de Recursos**: Crea resúmenes, flashcards y quizzes con IA
- **Seguridad Avanzada**: Cifrado AES-256-GCM para API keys y autenticación JWT
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS y componentes UI elegantes

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 15.0.3, React 18.3.1, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT con refresh tokens
- **Cifrado**: AES-256-GCM para datos sensibles
- **IA**: Google Gemini API, OpenAI GPT
- **UI Components**: shadcn/ui, Lucide React
- **Notificaciones**: Sonner (toast notifications)

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta en Supabase
- Clave API de Google Gemini u OpenAI

## 🔧 Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/estudimen.git
cd estudimen
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
Crea un archivo `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# JWT
JWT_SECRET_KEY=tu_secreto_jwt_seguro

# Cifrado
ENCRYPTION_KEY=tu_clave_de_cifrado_de_32_caracteres

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Ejecuta las migraciones de Supabase**
```bash
# Las migraciones están en supabase/migrations/
# Aplica las migraciones en tu dashboard de Supabase
```

5. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

## 🗂️ Estructura del Proyecto

```
estudimen/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── study/         # Planes de estudio
│   │   │   └── user/          # Gestión de usuarios
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── api-keys/          # Gestión de API keys
│   │   └── study-plans/       # Planes de estudio
│   ├── components/            # Componentes UI
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades y servicios
│   │   ├── ai/               # Servicio de IA
│   │   ├── auth/             # Servicio de autenticación
│   │   ├── db/               # Servicio de base de datos
│   │   ├── encryption/       # Servicio de cifrado
│   │   └── study/            # Servicio de planificación
│   └── types/                # Definiciones TypeScript
├── supabase/                  # Configuración Supabase
└── public/                    # Assets estáticos
```

## 🔐 Modelo de Negocio Innovador

Estudimen utiliza un modelo único donde:
- **Los usuarios proporcionan sus propias claves API** de Gemini u OpenAI
- **Sin costos de IA para el desarrollador**
- **Escalabilidad ilimitada** sin preocuparse por límites de API
- **Transparencia total** - los usuarios controlan sus propias claves

## 🎯 Funcionalidades Detalladas

### 📚 Planificación de Estudios
- Creación de planes personalizados con múltiples asignaturas
- Establecimiento de fechas de examen y prioridades
- Cálculo automático de horas de estudio necesarias
- Generación de sesiones diarias con IA

### 🔑 Gestión de API Keys
- Soporte para Google Gemini y OpenAI
- Validación automática de claves
- Cifrado seguro de almacenamiento
- Pruebas de funcionamiento en tiempo real

### 📊 Seguimiento y Analytics
- Visualización de progreso por asignatura
- Estadísticas de tiempo de estudio
- Gráficos de rendimiento
- Historial de sesiones completadas

### 🧠 Generación de Recursos
- **Resúmenes**: Compendios inteligentes de materiales de estudio
- **Flashcards**: Tarjetas de memoria personalizadas
- **Quizzes**: Exámenes de práctica adaptativos
- **Sugerencias**: Recomendaciones de estudio basadas en IA

## 🛡️ Seguridad

- **Cifrado AES-256-GCM** para API keys
- **JWT con refresh tokens** para autenticación
- **Validación de entrada** con Zod
- **Protección de rutas** en frontend y backend
- **Row Level Security** en Supabase

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker
```dockerfile
# Dockerfile incluido en el repositorio
docker build -t estudimen .
docker run -p 3000:3000 --env-file .env.local estudimen
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Desarrollado por el equipo de Estudimen - innovando en educación con inteligencia artificial.

## 📞 Soporte

- 📧 Email: soporte@estudimen.com
- 💬 Discord: [Unirse al servidor](https://discord.gg/estudimen)
- 📚 Documentación: [docs.estudimen.com](https://docs.estudimen.com)

---

**⭐ Si te gusta este proyecto, por favor dale una estrella en GitHub!**