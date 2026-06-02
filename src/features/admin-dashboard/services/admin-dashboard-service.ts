import { api } from "@/api/api"
import type { ApiResponse } from "@/types/home"

import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard"

const unwrap = <T>(response: ApiResponse<T>): T => response.data

export const adminDashboardService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard")
    return unwrap(response.data)
  },
}