import { api } from "@/api/api"
import type { ApiResponse } from "@/types/home"

import type {
    SellerDashboardData,
    SellerDashboardStats,
    SellerRecentSale,
    SellerRevenueStats,
    SellerTopSellingMusic,
} from "@/features/seller-dashboard/types/seller-dashboard"

const unwrap = <T>(response: ApiResponse<T>): T => response.data

export const sellerDashboardService = {
  async getStatistics(): Promise<SellerDashboardStats> {
    const response = await api.get<ApiResponse<SellerDashboardStats>>("/seller/dashboard")
    return unwrap(response.data)
  },

  async getRevenue(): Promise<SellerRevenueStats> {
    const response = await api.get<ApiResponse<SellerRevenueStats>>("/seller/revenue")
    return unwrap(response.data)
  },

  async getTopSelling(): Promise<SellerTopSellingMusic[]> {
    const response = await api.get<ApiResponse<SellerTopSellingMusic[]>>("/seller/top-musics")
    return unwrap(response.data)
  },

  async getRecentSales(): Promise<SellerRecentSale[]> {
    const response = await api.get<ApiResponse<SellerRecentSale[]>>("/seller/dashboard/recent-sales")
    return unwrap(response.data)
  },

  async getDashboardData(): Promise<SellerDashboardData> {
    const [stats, revenue, topSelling, recentSales] = await Promise.all([
      this.getStatistics(),
      this.getRevenue(),
      this.getTopSelling(),
      this.getRecentSales(),
    ])

    return { stats, revenue, topSelling, recentSales }
  },
}
