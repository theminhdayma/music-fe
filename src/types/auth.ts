export type UserRole = "BUYER" | "SELLER" | "ADMIN"

export type AccountStatus = "ACTIVE" | "INACTIVE"

export interface UserProfile {
  id: number
  email: string
  fullName: string
  avatarUrl?: string | null
  phoneNumber?: string | null
  address?: string | null
  bio?: string | null
  dateOfBirth?: string | null
  role: UserRole
  status: AccountStatus
  emailVerified: boolean
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserProfile
}

export interface VerificationResponse {
  email: string
  expiresInMinutes: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: string[] | null
  timestamp: string
}

export interface AuthError {
  message: string
  status?: number
  errors?: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  fullName: string
  password: string
  role: Extract<UserRole, "BUYER" | "SELLER">
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
}

export interface UpdateProfilePayload {
  fullName: string
  avatarUrl?: string
  phoneNumber?: string
  address?: string
  bio?: string
  dateOfBirth?: string
}
