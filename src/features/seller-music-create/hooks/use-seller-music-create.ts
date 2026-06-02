"use client"

import { sellerMusicCreateService } from "@/features/seller-music-create/services/seller-music-create-service"
import type { HomeGenre } from "@/types/home"
import { useCallback, useEffect, useState } from "react"

interface UseSellerMusicCreateResult {
  genres: HomeGenre[]
  isLoadingGenres: boolean
  genresError: string | null
  refetchGenres: () => Promise<void>
}

export function useSellerMusicCreate(): UseSellerMusicCreateResult {
  const [genres, setGenres] = useState<HomeGenre[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)
  const [genresError, setGenresError] = useState<string | null>(null)

  const loadGenres = useCallback(async () => {
    setIsLoadingGenres(true)
    setGenresError(null)

    try {
      const response = await sellerMusicCreateService.getGenres()
      setGenres(response)
    } catch (error) {
      setGenres([])
      setGenresError(error instanceof Error ? error.message : "Could not load genres")
    } finally {
      setIsLoadingGenres(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGenres()
  }, [loadGenres])

  return {
    genres,
    isLoadingGenres,
    genresError,
    refetchGenres: loadGenres,
  }
}
