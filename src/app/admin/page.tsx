import { AdminDashboardPageView } from "@/features/admin-dashboard/components/admin-dashboard-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Monitor platform-wide statistics and order revenue.",
}

export default function Page() {
  return <AdminDashboardPageView />
}