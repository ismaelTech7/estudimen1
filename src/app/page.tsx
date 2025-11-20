import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, Clock, Trophy, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: 'Tutoría con IA',
      description: 'Recibe ayuda personalizada de nuestro asistente inteligente que se adapta a tu estilo de aprendizaje.'
    },
    {
      icon: BookOpen,
      title: 'Materiales Interactivos',
      description: 'Accede a contenido educativo dinámico que hace el aprendizaje más engaging y efectivo.'
    },
    {
      icon: Zap,
      title: 'Flashcards Inteligentes',
      description: 'Estudia con tarjetas que utilizan repetición espaciada para maximizar la retención.'
    },
    {
      icon: Trophy,
      title: 'Gamificación',
      description: 'Mantén la motivación con rachas, logros y desafíos mensuales.'
    },
    {
      icon: Users,
      title: 'Grupos de Estudio',
      description: 'Colabora con otros estudiantes y aprende juntos en comunidades virtuales.'
    },
    {
      icon: Clock,
      title: 'Seguimiento de Progreso',
      description: 'Visualiza tu avance con análisis detallados y metas personalizadas.'
    }
  ]

  const testimonials = [
    {
      name: "María García",
      role: "Estudiante de Medicina",
      content: "Estudimen ha revolucionado mi forma de estudiar. El tutor de IA me ayuda a entender conceptos complejos y las flashcards me han mejorado la memoria significativamente."
    },
    {
      name: "Carlos Rodríguez",
      role: "Estudiante de Ingeniería",
      content: "Los grupos de estudio y la gamificación me mantienen motivado. He mejorado mi rendimiento académico en un 40% desde que uso Estudimen."
    },
    {
      name: "Ana Martínez",
      role: "Estudiante de Derecho",
      content: "La repetición espaciada y los materiales interactivos hacen que estudiar sea mucho más efectivo y menos aburrido. ¡Lo recomiendo totalmente!"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold gradient-text">Estudimen</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              Características
            </Link>
            <Link href="#testimonials" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              Testimonios
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              Precios
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aprende Más Rápido con
              <br />
              Inteligencia Artificial
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Estudimen es tu asistente de estudio inteligente que se adapta a tu estilo de aprendizaje, 
              ayudándote a retener más información en menos tiempo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver Precios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Características Potenciadas por IA</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Herramientas inteligentes diseñadas para maximizar tu potencial de aprendizaje
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Estudiantes Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Tasa de Retención</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-blue-100">Flashcards Creadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-blue-100">Calificación Promedio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Lo que Dicen Nuestros Estudiantes</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Más de 50,000 estudiantes han mejorado su aprendizaje con Estudimen
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 gradient-text">
              ¿Listo para Revolucionar tu Aprendizaje?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Únete a miles de estudiantes que ya están aprendiendo más rápido y eficientemente con Estudimen.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Estudimen</span>
              </div>
              <p className="text-slate-400">
                Tu asistente de estudio inteligente con IA para un aprendizaje más efectivo.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carreras</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Ayuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Estudimen. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}