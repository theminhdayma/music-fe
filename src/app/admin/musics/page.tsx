import { AdminMusicManagementPageView } from "@/features/admin-music-management/components/admin-music-management-page-view"
import type { AdminMusicQuery } from "@/features/admin-music-management/types/admin-music-management"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Music Management",
  description: "Moderate seller uploaded music.",
}

interface AdminMusicPageProps {
  searchParams?: Promise<{
    page?: string
    keyword?: string
    status?: string
  }>
}

function parseQuery(searchParams?: { page?: string; keyword?: string; status?: string }): AdminMusicQuery {
  const page = Number(searchParams?.page ?? 0)
  const keyword = searchParams?.keyword?.trim() ?? ""
  const status = searchParams?.status
  const normalizedStatus = status === "PUBLISHED" || status === "DRAFT" || status === "HIDDEN" ? status : "ALL"

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    keyword,
    status: normalizedStatus,
  }
}

export default async function Page({ searchParams }: AdminMusicPageProps) {
  const params = await searchParams
  const initialQuery = parseQuery(params)

  return <AdminMusicManagementPageView initialQuery={initialQuery} />
}