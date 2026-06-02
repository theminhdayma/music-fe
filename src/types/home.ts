export interface HomeMusic {
  id: number
  slug: string
  title: string
  artistName: string
  description?: string | null
  thumbnailUrl?: string | null
  audioUrl?: string | null
  durationSeconds?: number | null
  price?: number | string | null
  sellerId?: number | null
  sellerName?: string | null
  genreId?: number | null
  genreName?: string | null
  createdAt?: string
}

export interface HomeGenre {
  id: number
  name: string
  slug: string
  description?: string | null
  active?: boolean
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: string[] | null
  timestamp?: string
}

export interface HomeCreator {
  sellerId: number
  sellerName: string
  musicCount: number
  featuredTrack: string
  thumbnailUrl?: string | null
}

export interface HomePageData {
  query: string
  selectedGenreId: number | null
  featuredMusics: HomeMusic[]
  featuredPageData: PageResponse<HomeMusic> | null
  trendingMusics: HomeMusic[]
  latestMusics: HomeMusic[]
  genres: HomeGenre[]
  creators: HomeCreator[]
  heroTrack: HomeMusic | null
  totalMusics: number
}
