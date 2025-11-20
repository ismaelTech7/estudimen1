import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Estudimen</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Última actualización: 20 de noviembre de 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Información que Recopilamos</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Recopilamos información que proporcionas directamente cuando te registras en Estudimen, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Nivel educativo</li>
                <li>Información de progreso en estudios</li>
                <li>Contenido que creas (flashcards, notas, etc.)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Cómo Usamos tu Información</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Utilizamos tu información personal para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Proporcionar y mejorar nuestros servicios educativos</li>
                <li>Personalizar tu experiencia de aprendizaje</li>
                <li>Enviar actualizaciones importantes sobre tu cuenta</li>
                <li>Proporcionar soporte al cliente</li>
                <li>Analizar tendencias y mejorar nuestra plataforma</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Protección de Datos</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Implementamos medidas de seguridad de última generación para proteger tu información:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Autenticación segura con tokens</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo constante de seguridad</li>
                <li>Copias de seguridad regulares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Compartir Información</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales. Solo compartimos información cuando:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Es necesario para proporcionar nuestros servicios</li>
                <li>Tenemos tu consentimiento explícito</li>
                <li>Es requerido por ley o para proteger nuestros derechos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Tus Derechos</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tienes derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Acceder a tu información personal</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Exportar tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Utilizamos cookies para mejorar tu experiencia en nuestra plataforma. Las cookies nos ayudan a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Mejorar nuestros servicios</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Retención de Datos</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Conservamos tu información personal mientras mantengas una cuenta activa con nosotros. Cuando elimines tu cuenta, 
                procederemos a borrar tus datos personales en un plazo máximo de 30 días, salvo que sea necesario conservarlos 
                por obligaciones legales o para resolver disputas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Cambios a esta Política</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos 
                mediante un aviso en la plataforma o por correo electrónico. Te recomendamos revisar esta página periódicamente 
                para estar informado sobre cómo protegemos tu información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contacto</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Si tienes preguntas sobre esta política de privacidad o sobre el manejo de tus datos personales, 
                puedes contactarnos a través de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Email: <a href="mailto:privacy@estudimen.com" className="text-blue-600 hover:underline">privacy@estudimen.com</a></li>
                <li>Dirección: Estudimen S.L., Calle Educativa 123, 28001 Madrid, España</li>
                <li>Teléfono: <a href="tel:+34900123456" className="text-blue-600 hover:underline">+34 900 123 456</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Ley Aplicable</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Esta política de privacidad se rige por la ley española y el Reglamento General de Protección de Datos (GDPR) 
                de la Unión Europea. Tienes derecho a presentar una queja ante la autoridad de protección de datos de tu país 
                si consideras que hemos infringido la legislación de protección de datos.
              </p>
            </section>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}