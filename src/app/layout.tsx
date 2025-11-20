import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://estudimen.vercel.app'),
  title: 'Estudimen - Tu Asistente de Estudio con IA',
  description: 'Estudimen es tu asistente de estudio inteligente con IA. Aprende más rápido y eficientemente con herramientas personalizadas, flashcards, quizzes y tutoría inteligente.',
  keywords: 'estudio, IA, aprendizaje, flashcards, quiz, tutoría, educación',
  authors: [{ name: 'Estudimen Team' }],
  openGraph: {
    title: 'Estudimen - Tu Asistente de Estudio con IA',
    description: 'Aprende más rápido y eficientemente con herramientas personalizadas de IA',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estudimen - Tu Asistente de Estudio con IA',
    description: 'Aprende más rápido y eficientemente con herramientas personalizadas de IA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}