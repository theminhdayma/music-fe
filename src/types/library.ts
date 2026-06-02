import type { ApiResponse, PageResponse } from "@/types/home"

export interface LibraryItem {
  musicId: number
  title: string
  artistName: string
  thumbnailUrl?: string | null
  purchasedAt?: string | null
}

export interface DownloadUrlResponse {
  musicId: number
  downloadUrl: string
  expiresAt: string
}

export type LibraryApiResponse = ApiResponse<PageResponse<LibraryItem>>
