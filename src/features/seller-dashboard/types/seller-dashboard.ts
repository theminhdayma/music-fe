export interface SellerDashboardStats {
  totalMusics: number
  publishedMusics: number
  draftMusics: number
  hiddenMusics?: number
}

export interface SellerRevenueStats {
  totalSales: number
  totalRevenue: number | string
  averageSalePrice: number | string
}

export interface SellerTopSellingMusic {
  musicId: number
  title: string
  thumbnailUrl?: string | null
  sales: number
  revenue: number | string
}

export interface SellerRecentSale {
  orderCode: string
  musicId: number
  musicTitle: string
  buyerName: string
  thumbnailUrl?: string | null
  amount: number | string
  purchasedAt: string
}

export interface SellerDashboardData {
  stats: SellerDashboardStats
  revenue: SellerRevenueStats
  topSelling: SellerTopSellingMusic[]
  recentSales: SellerRecentSale[]
}
