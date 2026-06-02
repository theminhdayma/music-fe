"use client"

import { useCallback, useEffect, useState } from "react"

import { adminGenreManagementService } from "@/features/admin-genre-management/services/admin-genre-management-service"
import type { AdminGenreListItem, AdminGenreQuery } from "@/features/admin-genre-management/types/admin-genre-management"
import type { PageResponse } from "@/types/home"

const PAGE_SIZE = 5

export function useAdminGenreManagement(query: AdminGenreQuery) {
  const [data, setData] = useState<PageResponse<AdminGenreListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadGenres = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await adminGenreManagementService.getGenres({
        page: query.page,
        size: PAGE_SIZE,
        keyword: query.keyword.trim() || undefined,
      })

      setData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load genres")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [query.keyword, query.page])

  useEffect(() => {
    let isActive = true

    const run = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage(null)

      try {
        const response = await adminGenreManagementService.getGenres({
          page: query.page,
          size: PAGE_SIZE,
          keyword: query.keyword.trim() || undefined,
        })

        if (!isActive) return
        setData(response)
      } catch (error) {
        if (!isActive) return
        setIsError(true)
        setErrorMessage(error instanceof Error ? error.message : "Could not load genres")
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
  }, [query.keyword, query.page])

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: loadGenres,
  }
}
