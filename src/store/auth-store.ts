import type { UserProfile } from "@/types/auth"
import { create } from "zustand"

interface AuthState {
  isAuthenticated: boolean
  isHydrated: boolean
  user: UserProfile | null
  setSession: (user: UserProfile) => void
  clearSession: () => void
  setHydrated: (value: boolean) => void
  updateUser: (user: UserProfile) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  setSession: (user) =>
    set({
      isAuthenticated: true,
      user,
    }),
  clearSession: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
  setHydrated: (value) => set({ isHydrated: value }),
  updateUser: (user) => set({ user }),
}))
