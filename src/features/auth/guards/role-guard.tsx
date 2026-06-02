"use client"

import { useAuthStore } from "@/store/auth-store"
import type { UserRole } from "@/types/auth"
import { ReactNode } from "react"

interface RoleGuardProps {
  allowedRoles: UserRole[]
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGuard({ allowedRoles, fallback = null, children }: RoleGuardProps) {
  const userRole = useAuthStore((state) => state.user?.role)

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
