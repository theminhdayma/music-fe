"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminDashboardSkeleton } from "@/features/admin-dashboard/components/admin-dashboard-skeleton"
import { AdminDashboardStatsCards } from "@/features/admin-dashboard/components/admin-dashboard-stats-cards"
import { useAdminDashboard } from "@/features/admin-dashboard/hooks/use-admin-dashboard"
import { Navbar } from "@/features/home/components/navbar"
import { useAuthStore } from "@/store/auth-store"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowRight, Music2, ReceiptText, Sparkles, Tags, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AdminDashboardPageView() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const { data, isLoading, isError, errorMessage, refetch } = useAdminDashboard()

  useEffect(() => {
    if (!isHydrated) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role !== "ADMIN") {
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
            Admin Control Tower
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
            Monitor platform-wide users, catalog size, and successful paid order revenue from one place.
          </p>
        </motion.section>

        {isLoading ? <AdminDashboardSkeleton /> : null}

        {!isLoading && isError ? (
          <section className="rounded-3xl border border-red-400/20 bg-red-500/8 p-8 text-center backdrop-blur-xl">
            <AlertTriangle className="mx-auto size-6 text-red-300" />
            <h2 className="mt-3 text-xl font-semibold text-red-100">Could not load admin dashboard</h2>
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
          <div className="space-y-6">
            <AdminDashboardStatsCards stats={data} />
            <ManagementModulesSection />
          </div>
        ) : null}
      </main>
    </div>
  )
}

function ManagementModulesSection() {
  const modules = [
    {
      title: "User Management",
      description: "Manage platform users and permissions.",
      action: "View Users",
      href: "/admin/users",
      icon: <Users className="size-5" />,
      accent: "from-fuchsia-500/18 via-violet-500/12 to-indigo-500/12",
      iconTone: "border-fuchsia-300/25 bg-fuchsia-500/15 text-fuchsia-100",
    },
    {
      title: "Music Management",
      description: "Moderate seller uploaded music.",
      action: "View Musics",
      href: "/admin/musics",
      icon: <Music2 className="size-5" />,
      accent: "from-sky-500/18 via-blue-500/12 to-indigo-500/12",
      iconTone: "border-sky-300/25 bg-sky-500/15 text-sky-100",
    },
    {
      title: "Genre Management",
      description: "Create and organize music genres.",
      action: "View Genres",
      href: "/admin/genres",
      icon: <Tags className="size-5" />,
      accent: "from-emerald-500/18 via-teal-500/12 to-cyan-500/12",
      iconTone: "border-emerald-300/25 bg-emerald-500/15 text-emerald-100",
    },
    {
      title: "Order Management",
      description: "Monitor platform orders.",
      action: "View Orders",
      href: "/admin/orders",
      icon: <ReceiptText className="size-5" />,
      accent: "from-amber-500/18 via-orange-500/12 to-rose-500/12",
      iconTone: "border-amber-300/25 bg-amber-500/15 text-amber-100",
    },
  ]

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Badge className="border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-200 hover:bg-white/[0.05]">
            Management Modules
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Management Modules</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
            Jump into the operational tools that keep the marketplace organized and healthy.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
          >
            <Link
              href={module.href}
              className={`group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br ${module.accent} p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_72px_rgba(0,0,0,0.32)]`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition duration-300 group-hover:scale-110" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-black/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${module.iconTone} shadow-[0_12px_32px_rgba(0,0,0,0.18)]`}>
                    {module.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">{module.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-zinc-300">{module.description}</p>
                </div>
              </div>

              <div className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition group-hover:text-white">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 transition group-hover:border-white/20 group-hover:bg-white/[0.1]">
                  {module.action}
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition group-hover:translate-x-1 group-hover:border-white/20 group-hover:bg-white/[0.1]">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}