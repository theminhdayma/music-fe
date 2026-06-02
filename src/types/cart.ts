export interface CartItem {
  cartItemId: number
  musicId: number
  title: string
  slug: string
  artistName: string
  thumbnailUrl?: string | null
  price?: number | string | null
  sellerId?: number | null
  sellerName?: string | null
}

export interface CartResponse {
  items: CartItem[]
  totalItems: number
  totalPrice: number | string | null
}

export interface CartApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: string[] | null
  timestamp?: string
}
