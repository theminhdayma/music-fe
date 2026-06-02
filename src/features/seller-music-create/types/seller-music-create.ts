import type { HomeGenre } from "@/types/home"

export type SellerMusicStatus = "DRAFT" | "PUBLISHED"

export interface SellerMusicFormValues {
  title: string
  artistName: string
  genreId: string
  description: string
  price: string
  status: SellerMusicStatus
}

export interface SellerMusicCreatePayload {
  title: string
  artistName: string
  genreId: number
  description?: string
  price?: string
  status: SellerMusicStatus
  thumbnailFile: File
  audioFile: File
  durationSeconds: number
}

export interface SellerMusicCreateResult {
  id: number
  title: string
  slug?: string
}

export interface SellerMusicCreateFormState {
  genres: HomeGenre[]
  isLoadingGenres: boolean
  isSubmitting: boolean
  isError: boolean
  errorMessage: string | null
}
