export interface PlayerTrack {
  musicId: number
  slug: string
  title: string
  artistName: string
  sellerId?: number | null
  sellerName?: string | null
  thumbnailUrl?: string | null
  audioUrl?: string | null
  durationSeconds?: number | null
  price?: number | string | null
  owned?: boolean
  previewLimitSeconds?: number | null
}