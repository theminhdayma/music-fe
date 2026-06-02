export const AUTH_TOKEN_STORAGE_KEY = "auth.accessToken"
export const AUTH_USER_STORAGE_KEY = "auth.user"
export const AUTH_TOKEN_COOKIE_KEY = "auth_access_token"

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  verifyOtp: "/verify-otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const

export const PROTECTED_ROUTES = {
  profile: "/profile",
} as const

export const PUBLIC_ONLY_ROUTES: readonly string[] = Object.values(AUTH_ROUTES)
export const PRIVATE_ROUTES: readonly string[] = [PROTECTED_ROUTES.profile]

export const OTP_LENGTH = 6

export const ROLE_PROTECTED_PREFIXES: Record<string, readonly string[]> = {
  BUYER: ["/buyer"],
  SELLER: ["/seller"],
  ADMIN: ["/admin"],
}
