import { api } from "@/api/api"
import type { ApiResponse, PageResponse } from "@/types/home"

import type {
    AdminGenreFormValues,
    AdminGenreListItem,
    AdminGenreQueryParams,
} from "@/features/admin-genre-management/types/admin-genre-management"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

export const adminGenreManagementService = {
  async getGenres(params: AdminGenreQueryParams): Promise<PageResponse<AdminGenreListItem>> {
    return unwrap(
      api.get<ApiResponse<PageResponse<AdminGenreListItem>>>("/admin/genres", {
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword || undefined,
        },
      })
    )
  },

  async createGenre(payload: AdminGenreFormValues): Promise<AdminGenreListItem> {
    return unwrap(
      api.post<ApiResponse<AdminGenreListItem>>("/admin/genres", {
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        description: payload.description.trim() || undefined,
        isActive: payload.isActive,
      })
    )
  },

  async updateGenre(id: number, payload: AdminGenreFormValues): Promise<AdminGenreListItem> {
    return unwrap(
      api.put<ApiResponse<AdminGenreListItem>>(`/admin/genres/${id}`, {
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        description: payload.description.trim() || undefined,
        isActive: payload.isActive,
      })
    )
  },

  async deleteGenre(id: number): Promise<void> {
    await unwrap(api.delete<ApiResponse<null>>(`/admin/genres/${id}`))
  },
}
