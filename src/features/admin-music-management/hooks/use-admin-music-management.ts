"use client"

import { useCallback, useEffect, useState } from "react"

import { adminMusicManagementService } from "@/features/admin-music-management/services/admin-music-management-service"
import type { AdminMusicListItem, AdminMusicQuery } from "@/features/admin-music-management/types/admin-music-management"
import type { PageResponse } from "@/types/home"

const PAGE_SIZE = 10

export function useAdminMusicManagement(query: AdminMusicQuery) {
  const [data, setData] = useState<PageResponse<AdminMusicListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadMusics = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await adminMusicManagementService.getMusics({
        page: query.page,
        size: PAGE_SIZE,
        keyword: query.keyword.trim() || undefined,
        status: query.status === "ALL" ? undefined : query.status,
      })

      setData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load admin musics")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [query.keyword, query.page, query.status])

  useEffect(() => {
    let isActive = true

    const run = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage(null)

      try {
        const response = await adminMusicManagementService.getMusics({
          page: query.page,
          size: PAGE_SIZE,
          keyword: query.keyword.trim() || undefined,
          status: query.status === "ALL" ? undefined : query.status,
        })

        if (!isActive) return
        setData(response)
      } catch (error) {
        if (!isActive) return
        setIsError(true)
        setErrorMessage(error instanceof Error ? error.message : "Could not load admin musics")
        setData(null)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void run()

    return () => {
      isActive = false
    }
  }, [query.keyword, query.page, query.status])

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: loadMusics,
  }
}