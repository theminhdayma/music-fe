"use client"

import { adminDashboardService } from "@/features/admin-dashboard/services/admin-dashboard-service"
import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard"
import { useCallback, useEffect, useState } from "react"

interface UseAdminDashboardResult {
  data: AdminDashboardStats | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function useAdminDashboard(): UseAdminDashboardResult {
  const [data, setData] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await adminDashboardService.getDashboardStats()
      setData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load admin dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchData,
  }
}