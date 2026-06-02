export type AdminOrderStatus = "PENDING" | "PAID"
export type AdminPaymentStatus = "PENDING" | "SUCCESS" | "FAILED"
export type AdminPaymentMethod = "SANDBOX" | string

export interface AdminOrderListItem {
  id: number
  orderCode: string
  buyerId: number
  buyerName: string
  totalAmount: number | string
  orderStatus: AdminOrderStatus
  paymentStatus: AdminPaymentStatus
  createdAt?: string | null
}

export interface AdminOrderDetailItem {
  id: number
  musicId: number
  musicTitleAtPurchase: string
  artistNameAtPurchase: string
  thumbnailUrlAtPurchase?: string | null
  priceAtPurchase: number | string
}

export interface AdminOrderDetail extends AdminOrderListItem {
  paymentMethod: AdminPaymentMethod
  items: AdminOrderDetailItem[]
}

export interface AdminOrderQuery {
  page: number
}

export interface AdminOrderQueryParams {
  page: number
  size: number
}
