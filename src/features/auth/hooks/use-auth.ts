"use client"

import { AUTH_ROUTES } from "@/constants/auth"
import { authService } from "@/features/auth/services/auth-service"
import { tokenManager } from "@/lib/auth/token-manager"
import { useAuthStore } from "@/store/auth-store"
import type {
    AuthError,
    ForgotPasswordPayload,
    LoginPayload,
    RegisterPayload,
    ResetPasswordPayload,
    UpdateProfilePayload,
    VerificationResponse,
    VerifyOtpPayload,
} from "@/types/auth"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const updateUser = useAuthStore((state) => state.updateUser)

  const login = async (payload: LoginPayload) => {
    const data = await authService.login(payload)
    tokenManager.setToken(data.accessToken)
    setSession(data.user)
    router.replace("/")
    return data
  }

  const register = async (payload: RegisterPayload): Promise<VerificationResponse> => {
    return authService.register(payload)
  }

  const verifyEmail = async (payload: VerifyOtpPayload) => {
    const data = await authService.verifyEmail(payload)
    tokenManager.setToken(data.accessToken)
    setSession(data.user)
    router.replace("/")
    return data
  }

  const resendVerification = async (email: string) => {
    return authService.resendVerification(email)
  }

  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    await authService.forgotPassword(payload)
  }

  const resetPassword = async (payload: ResetPasswordPayload) => {
    await authService.resetPassword(payload)
    router.replace(AUTH_ROUTES.login)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      tokenManager.clearToken()
      clearSession()
      router.replace(AUTH_ROUTES.login)
    }
  }

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile()
    setSession(profile)
    return profile
  }, [setSession])

  const saveProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const profile = await authService.updateProfile(payload)
    updateUser(profile)
    return profile
  }, [updateUser])

  const uploadProfileAvatar = useCallback(async (file: File) => {
    return authService.uploadProfileAvatar(file)
  }, [])

  const updateProfileAvatar = useCallback((avatarUrl: string) => {
    if (!user) {
      return
    }

    updateUser({
      ...user,
      avatarUrl,
    })
  }, [updateUser, user])

  const toErrorMessage = useCallback((error: unknown): string => {
    if (typeof error === "object" && error !== null && "message" in error) {
      return String((error as AuthError).message)
    }
    return "Something went wrong. Please try again."
  }, [])
  return {
    user,
    isAuthenticated,
    isHydrated,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    refreshProfile,
    saveProfile,
    uploadProfileAvatar,
    updateProfileAvatar,
    toErrorMessage,
  }
}