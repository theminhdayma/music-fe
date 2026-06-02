export type SellerMusicStatus = "DRAFT" | "PUBLISHED" | "HIDDEN"

export interface SellerMusicListItem {
  id: number
  slug: string
  title: string
  artistName: string
  description?: string | null
  thumbnailUrl?: string | null
  audioUrl?: string | null
  durationSeconds?: number | null
  price?: number | string | null
  status: SellerMusicStatus
  sellerId?: number | null
  sellerName?: string | null
  genreId?: number | null
  genreName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  deletedAt?: string | null
}

export type SellerMusicDetail = SellerMusicListItem

export interface SellerMusicsQueryParams {
  page: number
  size: number
  keyword?: string
  status?: SellerMusicStatus
}

export interface SellerMusicUpdatePayload {
  title: string
  artistName: string
  genreId: number
  description?: string
  price?: string
  status: SellerMusicStatus
  durationSeconds?: number
  thumbnailFile?: File | null
  audioFile?: File | null
}