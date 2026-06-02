"use client"

import { AUTH_ROUTES } from "@/constants/auth"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useProtectedRoute() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (!isAuthenticated) {
      router.replace(AUTH_ROUTES.login)
    }
  }, [isAuthenticated, isHydrated, router])

  return {
    isHydrated,
    isAuthenticated,
  }
}
