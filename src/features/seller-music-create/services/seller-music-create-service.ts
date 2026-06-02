import { api } from "@/api/api"
import type { ApiResponse, HomeGenre } from "@/types/home"

import type {
    SellerMusicCreatePayload,
    SellerMusicCreateResult,
} from "@/features/seller-music-create/types/seller-music-create"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

export const sellerMusicCreateService = {
  async getGenres(): Promise<HomeGenre[]> {
    return unwrap(api.get<ApiResponse<HomeGenre[]>>("/genres/public"))
  },

  async createMusic(payload: SellerMusicCreatePayload): Promise<SellerMusicCreateResult> {
    const formData = new FormData()
    formData.append("title", payload.title)
    formData.append("artistName", payload.artistName)
    formData.append("genreId", String(payload.genreId))
    formData.append("durationSeconds", String(payload.durationSeconds))
    formData.append("status", payload.status)
    formData.append("thumbnailFile", payload.thumbnailFile)
    formData.append("audioFile", payload.audioFile)

    if (payload.description) {
      formData.append("description", payload.description)
    }

    if (payload.price) {
      formData.append("price", payload.price)
    }

    return unwrap(
      api.post<ApiResponse<SellerMusicCreateResult>>("/seller/musics", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    )
  },
}
