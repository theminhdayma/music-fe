import { SellerDashboardPageView } from "@/features/seller-dashboard/components/seller-dashboard-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Monitor sales performance, top tracks, and recent purchases.",
}

export default function Page() {
  return <SellerDashboardPageView />
}
