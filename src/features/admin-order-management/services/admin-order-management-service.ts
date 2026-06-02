import { api } from "@/api/api"
import type { ApiResponse, PageResponse } from "@/types/home"

import type {
    AdminOrderDetail,
    AdminOrderListItem,
    AdminOrderQueryParams,
} from "@/features/admin-order-management/types/admin-order-management"

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  return response.data.data
}

export const adminOrderManagementService = {
  async getOrders(params: AdminOrderQueryParams): Promise<PageResponse<AdminOrderListItem>> {
    return unwrap(
      api.get<ApiResponse<PageResponse<AdminOrderListItem>>>("/admin/orders", {
        params: {
          page: params.page,
          size: params.size,
        },
      })
    )
  },

  async getOrder(id: number): Promise<AdminOrderDetail> {
    return unwrap(api.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}`))
  },
}
