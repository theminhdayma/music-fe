import { axiosClient } from "@/lib/http/axios-client"
import type {
    ApiResponse,
    AuthError,
    AuthResponse,
    ForgotPasswordPayload,
    LoginPayload,
    RegisterPayload,
    ResetPasswordPayload,
    UpdateProfilePayload,
    UserProfile,
    VerificationResponse,
    VerifyOtpPayload,
} from "@/types/auth"
import { AxiosError } from "axios"

const unwrap = <T>(response: ApiResponse<T>): T => response.data

const mapError = (error: unknown): AuthError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const responseData = error.response?.data as
      | { message?: string; errors?: string[] }
      | undefined

    return {
      message: responseData?.message ?? error.message,
      status,
      errors: responseData?.errors ?? [],
    }
  }

  return {
    message: "Something went wrong. Please try again.",
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        payload
      )
      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },

  async register(payload: RegisterPayload): Promise<VerificationResponse> {
    try {
      const response = await axiosClient.post<ApiResponse<VerificationResponse>>(
        "/auth/register",
        payload
      )
      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },

  async verifyEmail(payload: VerifyOtpPayload): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<ApiResponse<AuthResponse>>(
        "/auth/verify-email",
        payload
      )
      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },

  async resendVerification(email: string): Promise<VerificationResponse> {
    try {
      const response = await axiosClient.post<ApiResponse<VerificationResponse>>(
        "/auth/resend-verification",
        { email }
      )
      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    try {
      await axiosClient.post<ApiResponse<null>>("/auth/forgot-password", payload)
    } catch (error) {
      throw mapError(error)
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    try {
      await axiosClient.post<ApiResponse<null>>("/auth/reset-password", payload)
    } catch (error) {
      throw mapError(error)
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosClient.post<ApiResponse<null>>("/auth/logout")
    } catch (error) {
      throw mapError(error)
    }
  },

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await axiosClient.get<ApiResponse<UserProfile>>(
        "/users/me"
      )
      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    try {
      const response = await axiosClient.put<ApiResponse<UserProfile>>(
        "/users/me",
        payload
      )
      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },

  async uploadProfileAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axiosClient.post<ApiResponse<string>>(
        "/users/me/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      return unwrap(response.data)
    } catch (error) {
      throw mapError(error)
    }
  },
}
