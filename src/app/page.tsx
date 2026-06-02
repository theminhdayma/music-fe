import { getHomepageData } from "@/features/home/api/home-api"
import { HomePage } from "@/features/home/components/home-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ecommerce Music | Premium Beat Marketplace",
  description:
    "Discover premium beats, cinematic tracks, and curated music from independent producers.",
}

interface HomePageProps {
  searchParams?: Promise<{
    q?: string
    genreId?: string
    page?: string
  }>
}

export default async function Page({ searchParams }: HomePageProps) {
  const params = await searchParams
  const query = params?.q?.trim() ?? ""
  const genreId = params?.genreId ? Number(params.genreId) : undefined
  const page = params?.page ? Number(params.page) : 0

  const data = await getHomepageData({
    query,
    genreId: Number.isFinite(genreId) ? genreId : undefined,
    page: Number.isFinite(page) && page >= 0 ? page : 0,
  })

  return <HomePage data={data} />
}