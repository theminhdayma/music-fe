import { AdminUsersPageView } from "@/features/admin-users/components/admin-users-page-view"
import type { AdminUsersQuery } from "@/features/admin-users/types/admin-users"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Users",
  description: "Search, review, and manage user accounts across the platform.",
}

interface AdminUsersPageProps {
  searchParams?: Promise<{
    page?: string
    keyword?: string
    role?: string
    status?: string
  }>
}

function parseQuery(searchParams?: {
  page?: string
  keyword?: string
  role?: string
  status?: string
}): AdminUsersQuery {
  const page = Number(searchParams?.page ?? 0)
  const keyword = searchParams?.keyword?.trim() ?? ""

  const role = searchParams?.role
  const normalizedRole = role === "BUYER" || role === "SELLER" || role === "ADMIN" ? role : "ALL"

  const status = searchParams?.status
  const normalizedStatus = status === "ACTIVE" || status === "INACTIVE" ? status : "ALL"

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    keyword,
    role: normalizedRole,
    status: normalizedStatus,
  }
}

export default async function Page({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams
  const initialQuery = parseQuery(params)

  return <AdminUsersPageView initialQuery={initialQuery} />
}