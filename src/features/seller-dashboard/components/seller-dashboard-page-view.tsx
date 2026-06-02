"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/features/home/components/navbar"
import { DashboardSkeleton } from "@/features/seller-dashboard/components/dashboard-skeleton"
import { QuickActions } from "@/features/seller-dashboard/components/quick-actions"
import { RecentSalesTable } from "@/features/seller-dashboard/components/recent-sales-table"
import { StatsCards } from "@/features/seller-dashboard/components/stats-cards"
import { TopSellingList } from "@/features/seller-dashboard/components/top-selling-list"
import { useSellerDashboard } from "@/features/seller-dashboard/hooks/use-seller-dashboard"
import { useAuthStore } from "@/store/auth-store"
import { motion } from "framer-motion"
import { AlertTriangle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function SellerDashboardPageView() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const { data, isLoading, isError, errorMessage, refetch } = useSellerDashboard()

  useEffect(() => {
    if (!isHydrated) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role !== "SELLER") {
      router.replace("/")
    }
  }, [isHydrated, router, user])

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.2),transparent_45%),rgba(255,255,255,0.03)] p-6 backdrop-blur-xl"
        >
          <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/20 blur-3xl" />
          <Badge className="mb-3 border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-fuchsia-100 hover:bg-fuchsia-500/10">
            <Sparkles className="mr-1 size-3" />
            Seller Command Deck
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Revenue Pulse Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
            Track your catalog growth, monitor top tracks, and see incoming purchases in real time.
          </p>
        </motion.section>

        {isLoading ? <DashboardSkeleton /> : null}

        {!isLoading && isError ? (
          <section className="rounded-3xl border border-red-400/20 bg-red-500/8 p-8 text-center backdrop-blur-xl">
            <AlertTriangle className="mx-auto size-6 text-red-300" />
            <h2 className="mt-3 text-xl font-semibold text-red-100">Could not load seller dashboard</h2>
            <p className="mt-2 text-sm text-red-200/90">{errorMessage ?? "Please try again."}</p>
            <Button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-red-500/80 text-white hover:bg-red-400"
            >
              Retry
            </Button>
          </section>
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="space-y-5">
            <StatsCards stats={data.stats} revenue={data.revenue} />

            <QuickActions />

            <section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
              <TopSellingList items={data.topSelling} />
              <RecentSalesTable items={data.recentSales} />
            </section>

          </div>
        ) : null}
      </main>
    </div>
  )
}
