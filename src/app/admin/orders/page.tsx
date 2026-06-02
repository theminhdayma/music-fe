import { AdminOrderManagementPageView } from "@/features/admin-order-management/components/admin-order-management-page-view"
import type { AdminOrderQuery } from "@/features/admin-order-management/types/admin-order-management"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Order Management",
  description: "Monitor platform orders.",
}

interface AdminOrderPageProps {
  searchParams?: Promise<{
    page?: string
  }>
}

function parseQuery(searchParams?: { page?: string }): AdminOrderQuery {
  const page = Number(searchParams?.page ?? 0)

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
  }
}

export default async function Page({ searchParams }: AdminOrderPageProps) {
  const params = await searchParams
  const initialQuery = parseQuery(params)

  return <AdminOrderManagementPageView initialQuery={initialQuery} />
}