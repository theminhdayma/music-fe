import { AdminGenreManagementPageView } from "@/features/admin-genre-management/components/admin-genre-management-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Genre Management",
  description: "Create and organize music genres.",
}

interface AdminGenrePageProps {
  searchParams?: Promise<{
    page?: string
    keyword?: string
  }>
}

function parseQuery(searchParams?: { page?: string; keyword?: string }) {
  const page = Number(searchParams?.page ?? 0)
  const keyword = searchParams?.keyword?.trim() ?? ""

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    keyword,
  }
}

export default async function Page({ searchParams }: AdminGenrePageProps) {
  const params = await searchParams
  const initialQuery = parseQuery(params)

  return <AdminGenreManagementPageView initialQuery={initialQuery} />
}