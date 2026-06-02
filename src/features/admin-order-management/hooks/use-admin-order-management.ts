"use client"

import { useCallback, useEffect, useState } from "react"

import { adminOrderManagementService } from "@/features/admin-order-management/services/admin-order-management-service"
import type { AdminOrderListItem, AdminOrderQuery } from "@/features/admin-order-management/types/admin-order-management"
import type { PageResponse } from "@/types/home"

const PAGE_SIZE = 5

export function useAdminOrderManagement(query: AdminOrderQuery) {
  const [data, setData] = useState<PageResponse<AdminOrderListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await adminOrderManagementService.getOrders({
        page: query.page,
        size: PAGE_SIZE,
      })

      setData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load orders")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [query.page])

  useEffect(() => {
    let isActive = true

    const run = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage(null)

      try {
        const response = await adminOrderManagementService.getOrders({
          page: query.page,
          size: PAGE_SIZE,
        })

        if (!isActive) return
        setData(response)
      } catch (error) {
        if (!isActive) return
        setIsError(true)
        setErrorMessage(error instanceof Error ? error.message : "Could not load orders")
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
  }, [query.page])

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: loadOrders,
  }
}
