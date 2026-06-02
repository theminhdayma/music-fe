import { api } from "@/api/api"
import type { ApiResponse, PageResponse } from "@/types/home"

import type {
    AdminUserDetail,
    AdminUserListItem,
    AdminUserStatusUpdatePayload,
    AdminUsersQueryParams,
} from "@/features/admin-users/types/admin-users"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

export const adminUsersService = {
  async getUsers(params: AdminUsersQueryParams): Promise<PageResponse<AdminUserListItem>> {
    return unwrap(
      api.get<ApiResponse<PageResponse<AdminUserListItem>>>("/admin/users", {
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword || undefined,
          role: params.role || undefined,
          status: params.status || undefined,
        },
      })
    )
  },

  async getUser(id: number): Promise<AdminUserDetail> {
    return unwrap(api.get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`))
  },

  async updateUserStatus(id: number, payload: AdminUserStatusUpdatePayload): Promise<AdminUserDetail> {
    return unwrap(api.patch<ApiResponse<AdminUserDetail>>(`/admin/users/${id}/status`, payload))
  },
}