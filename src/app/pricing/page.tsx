import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      id: 'free',
      name: 'Gratis',
      price: '$0',
      period: '/mes',
      description: 'Perfecto para empezar',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        '5 quizzes mensuales',
        'Acceso básico a flashcards',
        'Estadísticas limitadas',
        'Comunidad de estudiantes',
        'Soporte por email'
      ],
      cta: 'Comenzar Gratis',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: '/mes',
      description: 'Para estudiantes serios',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Quizzes ilimitados',
        'Flashcards inteligentes con IA',
        'Análisis detallado de progreso',
        'Tutoría personalizada con IA',
        'Soporte prioritario',
        'Sin anuncios',
        'Exportar materiales',
        'Modo offline'
      ],
      cta: 'Comenzar Pro',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      period: '/mes',
      description: 'Para máximo rendimiento',
      icon: Crown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Todo lo de Pro',
        'IA avanzada personalizada',
        'Planes de estudio adaptativos',
        'Sesiones 1-a-1 con expertos',
        'Acceso anticipado a nuevas funciones',
        'Almacenamiento ilimitado',
        'API para desarrolladores',
        'Soporte 24/7 por chat'
      ],
      cta: 'Comenzar Premium',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Estudimen</span>
          </Link>
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Precios Simples y Transparentes
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades de estudio. 
              Puedes cambiar de plan en cualquier momento.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <div className="bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg">
                <div className="flex items-center space-x-1">
                  <button className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">
                    Mensual
                  </button>
                  <button className="px-6 py-2 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Anual (Ahorra 20%)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card key={plan.id} className={`relative border-2 ${plan.popular ? 'border-purple-600 shadow-xl scale-105' : 'border-slate-200'} hover:shadow-lg transition-all duration-300`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Más Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <div className={`w-16 h-16 ${plan.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300 mt-2">{plan.description}</CardDescription>
                    
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-slate-600 dark:text-slate-300">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className={`w-5 h-5 ${plan.color} mr-3 mt-0.5 flex-shrink-0`} />
                          <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/register" className="block">
                      <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-slate-900 hover:bg-slate-800'} text-white py-3`}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Preguntas Frecuentes</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-slate-600 dark:text-slate-300">Sí, puedes cambiar de plan cuando quieras. Los cambios se aplicarán inmediatamente y se ajustará el cargo proporcionalmente.</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Hay un período de prueba?</h3>
              <p className="text-slate-600 dark:text-slate-300">¡Sí! Todos los planes premium incluyen una prueba gratuita de 7 días para que pruebes todas las funciones sin compromiso.</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Puedo cancelar mi suscripción?</h3>
              <p className="text-slate-600 dark:text-slate-300">Por supuesto. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control. Tu acceso continuará hasta el final del período de facturación.</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-slate-600 dark:text-slate-300">Aceptamos todas las principales tarjetas de crédito y débito, así como PayPal. El pago es seguro y procesado por Stripe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para Mejorar tu Aprendizaje?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Comienza gratis hoy y actualiza cuando necesites funciones premium
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8">
                Comenzar Ahora
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
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold">Estudimen</span>
              </div>
              <p className="text-slate-400">
                Tu asistente de estudio inteligente con IA para un aprendizaje más efectivo.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Características</Link></li>
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
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
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