"use client"

import { authService } from "@/features/auth/services/auth-service"
import { tokenManager } from "@/lib/auth/token-manager"
import { setUnauthorizedHandler } from "@/lib/http/axios-client"
import { useAuthStore } from "@/store/auth-store"
import { ReactNode, useEffect } from "react"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const clearSession = useAuthStore((state) => state.clearSession)
  const setHydrated = useAuthStore((state) => state.setHydrated)
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    const handleUnauthorized = () => {
      tokenManager.clearToken()
      clearSession()
    }

    setUnauthorizedHandler(handleUnauthorized)

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [clearSession])

  useEffect(() => {
    const hydrate = async () => {
      const token = tokenManager.getToken()

      if (!token) {
        clearSession()
        setHydrated(true)
        return
      }

      try {
        const user = await authService.getProfile()
        setSession(user)
      } catch {
        tokenManager.clearToken()
        clearSession()
      } finally {
        setHydrated(true)
      }
    }

    void hydrate()
  }, [clearSession, setHydrated, setSession])

  return children
}
