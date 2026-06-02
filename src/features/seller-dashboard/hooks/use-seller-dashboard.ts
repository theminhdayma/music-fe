"use client"

import { sellerDashboardService } from "@/features/seller-dashboard/services/seller-dashboard-service"
import type { SellerDashboardData } from "@/features/seller-dashboard/types/seller-dashboard"
import { useCallback, useEffect, useState } from "react"

interface UseSellerDashboardResult {
  data: SellerDashboardData | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function useSellerDashboard(): UseSellerDashboardResult {
  const [data, setData] = useState<SellerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await sellerDashboardService.getDashboardData()
      setData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load seller dashboard")
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
