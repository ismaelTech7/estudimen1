'use client'

import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/hooks/useAuth"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}