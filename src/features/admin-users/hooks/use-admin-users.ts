"use client"

import { useCallback, useEffect, useState } from "react"

import { adminUsersService } from "@/features/admin-users/services/admin-users-service"
import type { AdminUserListItem, AdminUsersQuery } from "@/features/admin-users/types/admin-users"
import type { PageResponse } from "@/types/home"

const PAGE_SIZE = 10

export function useAdminUsers(query: AdminUsersQuery) {
  const [data, setData] = useState<PageResponse<AdminUserListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await adminUsersService.getUsers({
        page: query.page,
        size: PAGE_SIZE,
        keyword: query.keyword.trim() || undefined,
        role: query.role === "ALL" ? undefined : query.role,
        status: query.status === "ALL" ? undefined : query.status,
      })

      setData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load admin users")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [query.keyword, query.page, query.role, query.status])

  useEffect(() => {
    let isActive = true

    const run = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage(null)

      try {
        const response = await adminUsersService.getUsers({
          page: query.page,
          size: PAGE_SIZE,
          keyword: query.keyword.trim() || undefined,
          role: query.role === "ALL" ? undefined : query.role,
          status: query.status === "ALL" ? undefined : query.status,
        })

        if (!isActive) return
        setData(response)
      } catch (error) {
        if (!isActive) return
        setIsError(true)
        setErrorMessage(error instanceof Error ? error.message : "Could not load admin users")
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
  }, [query.keyword, query.page, query.role, query.status])

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: loadUsers,
  }
}