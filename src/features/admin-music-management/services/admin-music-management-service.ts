import { api } from "@/api/api"
import type { ApiResponse, PageResponse } from "@/types/home"

import type {
    AdminMusicDetail,
    AdminMusicListItem,
    AdminMusicQueryParams,
} from "@/features/admin-music-management/types/admin-music-management"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

export const adminMusicManagementService = {
  async getMusics(params: AdminMusicQueryParams): Promise<PageResponse<AdminMusicListItem>> {
    return unwrap(
      api.get<ApiResponse<PageResponse<AdminMusicListItem>>>("/admin/musics", {
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword || undefined,
          status: params.status || undefined,
        },
      })
    )
  },

  async getMusic(id: number): Promise<AdminMusicDetail> {
    return unwrap(api.get<ApiResponse<AdminMusicDetail>>(`/admin/musics/${id}`))
  },

  async hideMusic(id: number): Promise<AdminMusicDetail> {
    return unwrap(api.patch<ApiResponse<AdminMusicDetail>>(`/admin/musics/${id}/hide`))
  },

  async deleteMusic(id: number): Promise<void> {
    await unwrap(api.delete<ApiResponse<null>>(`/admin/musics/${id}`))
  },
}