import { AUTH_TOKEN_COOKIE_KEY, AUTH_TOKEN_STORAGE_KEY } from "@/constants/auth"

const isBrowser = () => typeof window !== "undefined"

const syncCookie = (token?: string) => {
  if (!isBrowser()) {
    return
  }

  if (!token) {
    document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=; Max-Age=0; path=/; SameSite=Lax`
    return
  }

  document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`
}

export const tokenManager = {
  getToken(): string | null {
    if (!isBrowser()) {
      return null
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  },

  setToken(token: string): void {
    if (!isBrowser()) {
      return
    }

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    syncCookie(token)
  },

  clearToken(): void {
    if (!isBrowser()) {
      return
    }

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    syncCookie()
  },
}
