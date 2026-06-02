export type AdminMusicStatus = "PUBLISHED" | "DRAFT" | "HIDDEN"

export interface AdminMusicListItem {
  id: number
  slug: string
  title: string
  artistName: string
  description?: string | null
  thumbnailUrl?: string | null
  audioUrl?: string | null
  durationSeconds?: number | null
  price?: number | string | null
  status: AdminMusicStatus
  sellerId?: number | null
  sellerName?: string | null
  genreId?: number | null
  genreName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  deletedAt?: string | null
}

export type AdminMusicDetail = AdminMusicListItem

export interface AdminMusicQuery {
  page: number
  keyword: string
  status: AdminMusicStatus | "ALL"
}

export interface AdminMusicQueryParams {
  page: number
  size: number
  keyword?: string
  status?: AdminMusicStatus
}