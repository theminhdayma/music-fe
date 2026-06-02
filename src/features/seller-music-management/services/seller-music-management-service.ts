import { api } from "@/api/api"
import type { ApiResponse, PageResponse } from "@/types/home"

import type {
    SellerMusicDetail,
    SellerMusicListItem,
    SellerMusicUpdatePayload,
    SellerMusicsQueryParams,
} from "@/features/seller-music-management/types/seller-music-management"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

export const sellerMusicManagementService = {
  async getMusics(params: SellerMusicsQueryParams): Promise<PageResponse<SellerMusicListItem>> {
    return unwrap(
      api.get<ApiResponse<PageResponse<SellerMusicListItem>>>("/seller/musics/me", {
        params: {
          page: params.page,
          size: params.size,
          keyword: params.keyword || undefined,
          status: params.status || undefined,
        },
      })
    )
  },

  async getMusic(id: number): Promise<SellerMusicDetail> {
    return unwrap(api.get<ApiResponse<SellerMusicDetail>>(`/seller/musics/${id}`))
  },

  async deleteMusic(id: number): Promise<void> {
    await unwrap(api.delete<ApiResponse<null>>(`/seller/musics/${id}`))
  },

  async updateMusic(id: number, payload: SellerMusicUpdatePayload): Promise<SellerMusicDetail> {
    const formData = new FormData()
    formData.append("title", payload.title)
    formData.append("artistName", payload.artistName)
    formData.append("genreId", String(payload.genreId))
    formData.append("status", payload.status)

    if (payload.description) {
      formData.append("description", payload.description)
    }

    if (payload.price) {
      formData.append("price", payload.price)
    }

    if (payload.durationSeconds !== undefined) {
      formData.append("durationSeconds", String(payload.durationSeconds))
    }

    if (payload.thumbnailFile) {
      formData.append("thumbnailFile", payload.thumbnailFile)
    }

    if (payload.audioFile) {
      formData.append("audioFile", payload.audioFile)
    }

    return unwrap(
      api.put<ApiResponse<SellerMusicDetail>>(`/seller/musics/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    )
  },
}