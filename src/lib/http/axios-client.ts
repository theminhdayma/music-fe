import { tokenManager } from "@/lib/auth/token-manager"
import axios, { AxiosError } from "axios"

let unauthorizedHandler: (() => void) | null = null

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler
}

export const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: 15000,
})

axiosClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler()
    }

    return Promise.reject(error)
  }
)
