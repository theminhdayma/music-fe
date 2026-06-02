import type { ApiResponse, HomeGenre, HomeMusic, HomePageData, PageResponse } from "@/types/home"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""
const FEATURED_PAGE_SIZE = 6
const HOMEPAGE_PAGE_SIZE = 12

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function fetchApiData<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T | null> {
  try {
    const response = await fetch(buildUrl(path, params), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as ApiResponse<T> | T
    const data = payload && typeof payload === "object" && "data" in payload ? payload.data : payload
    return data ?? null
  } catch {
    return null
  }
}

async function fetchMusicPage(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<PageResponse<HomeMusic> | null> {
  return fetchApiData<PageResponse<HomeMusic>>(path, params)
}

function extractMusicItems(payload: PageResponse<HomeMusic> | HomeMusic[] | null): HomeMusic[] {
  if (!payload) {
    return []
  }

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.content ?? []
}

function groupCreators(musics: HomeMusic[]): HomePageData["creators"] {
  const grouped = new Map<number, HomePageData["creators"][number]>()

  musics.forEach((music) => {
    if (!music.sellerId || !music.sellerName) {
      return
    }

    const existing = grouped.get(music.sellerId)

    if (existing) {
      existing.musicCount += 1
      return
    }

    grouped.set(music.sellerId, {
      sellerId: music.sellerId,
      sellerName: music.sellerName,
      musicCount: 1,
      featuredTrack: music.title,
      thumbnailUrl: music.thumbnailUrl ?? null,
    })
  })

  return Array.from(grouped.values()).slice(0, 4)
}

export async function getHomepageData({
  query,
  genreId,
  page = 0,
}: {
  query: string
  genreId?: number
  page?: number
}): Promise<HomePageData> {
  const [musicData, featuredPageData, genreData] = await Promise.all([
    fetchMusicPage(query ? "/api/v1/public/musics/search" : "/api/v1/public/musics", {
      query: query || undefined,
      genreId,
      size: HOMEPAGE_PAGE_SIZE,
      sort: "createdAt,desc",
    }),
    fetchMusicPage(query ? "/api/v1/public/musics/search" : "/api/v1/public/musics", {
      query: query || undefined,
      genreId,
      page,
      size: FEATURED_PAGE_SIZE,
      sort: "createdAt,desc",
    }),
    fetchApiData<HomeGenre[]>("/api/v1/genres/public"),
  ])

  const musics = extractMusicItems(musicData)
  const featuredMusics = musics.slice(0, 6)
  const trendingMusics = musics.slice(0, 8)
  const latestMusics = musics.slice(0, 4)
  const creators = groupCreators(musics)

  return {
    query,
    selectedGenreId: genreId ?? null,
    featuredMusics,
    featuredPageData,
    trendingMusics,
    latestMusics,
    genres: genreData ?? [],
    creators,
    heroTrack: featuredMusics[0] ?? musics[0] ?? null,
    totalMusics: musicData && !Array.isArray(musicData) ? musicData.totalElements : musics.length,
  }
}

export async function getMusicBySlug(slug: string): Promise<HomeMusic | null> {
  return fetchApiData<HomeMusic>(`/api/v1/public/musics/${slug}`)
}
