# Estudimen - Asistente de Estudio con IA

Una plataforma educativa moderna que utiliza inteligencia artificial para ayudar a estudiantes a mejorar su rendimiento académico.

## 🚀 Características

- **Autenticación completa** con Supabase
- **Dashboard interactivo** con estadísticas de estudio
- **Sistema de quizzes** con retroalimentación en tiempo real
- **Seguimiento de progreso** personalizado
- **Recomendaciones de IA** basadas en el rendimiento
- **Diseño responsive** y moderno
- **Interfaz intuitiva** con Tailwind CSS

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (Base de datos + Autenticación)
- **Base de datos**: PostgreSQL
- **Despliegue**: Vercel-ready

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ismaelTech7/Estudimen.git
   cd Estudimen/nuevo
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Ejecutar migraciones de base de datos**
   Sube el archivo SQL en `supabase/migrations/` a tu proyecto de Supabase.

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
Estudimen/nuevo/
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── api/            # Rutas API
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── dashboard/      # Dashboard principal
│   │   └── page.tsx        # Landing page
│   ├── components/         # Componentes reutilizables
│   └── lib/               # Utilidades y configuraciones
├── supabase/
│   └── migrations/        # Migraciones de base de datos
└── public/                # Archivos estáticos
```

## 🔑 Características de Autenticación

- **Registro de usuarios** con validación de contraseña
- **Inicio de sesión** tradicional
- **Recuperación de contraseña** por correo electrónico
- **Gestión de sesiones** segura
- **Protección de rutas** basada en autenticación

## 📊 Dashboard y Estadísticas

- **Estadísticas generales** de estudio
- **Actividad reciente** con detalles de sesiones
- **Recomendaciones personalizadas** de IA
- **Accesos rápidos** a funciones principales
- **Diseño responsive** para móviles y desktop

## 🧠 Sistema de Estudio

- **Sesiones de estudio** con seguimiento de tiempo
- **Quizzes personalizados** por materia
- **Progreso por materia** con estadísticas detalladas
- **Recomendaciones de IA** basadas en el rendimiento
- **Historial completo** de actividades

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conectar repositorio** en Vercel
2. **Configurar variables de entorno**
3. **Desplegar**

### Otros proveedores

El proyecto está configurado para ser compatible con cualquier proveedor que soporte Next.js 14.

## 🔧 Configuración de Supabase

1. **Crear proyecto** en Supabase
2. **Configurar autenticación** por correo electrónico
3. **Ejecutar migraciones** desde `supabase/migrations/`
4. **Configurar políticas RLS** (ya incluidas en las migraciones)

## 📱 Responsive Design

El proyecto incluye diseño completamente responsive:

- **Móviles**: 320px - 768px
- **Tablets**: 768px - 1024px  
- **Desktop**: 1024px+

## 🎨 Sistema de Diseño

- **Colores principales**: Gradiente púrpura a azul
- **Tipografía**: Sistema de fuentes moderno
- **Componentes**: Botones, tarjetas, formularios
- **Animaciones**: Transiciones suaves
- **Iconos**: SVG personalizados

## 🔒 Seguridad

- **Autenticación segura** con Supabase
- **Protección de rutas** en frontend y API
- **Validación de formularios** en cliente y servidor
- **Políticas RLS** en base de datos
- **Encriptación de contraseñas**

## 📈 Optimización

- **Código optimizado** para producción
- **Imágenes optimizadas** con Next.js Image
- **Carga lazy** de componentes
- **Caché de API** donde corresponde
- **Bundle optimizado** con Tree Shaking

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crea** tu feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la branch (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte, por favor contacta a:
- 📧 Email: soporte@estudimen.com
- 💬 Discord: [Unirse al servidor]
- 📚 Documentación: [Ver documentación]

## 🙏 Agradecimientos

- Equipo de desarrollo de Estudimen
- Comunidad de Next.js
- Comunidad de Supabase
- Contribuidores del proyecto

---

**Desarrollado con ❤️ por el equipo de Estudimen**