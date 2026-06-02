"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/features/home/components/navbar"
import { useAuthStore } from "@/store/auth-store"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AdminModulePlaceholderPageViewProps {
  title: string
  description: string
  badgeLabel: string
}

export function AdminModulePlaceholderPageView({ title, description, badgeLabel }: AdminModulePlaceholderPageViewProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

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

      <main className="mx-auto flex w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.2),transparent_45%),rgba(255,255,255,0.03)] p-8 backdrop-blur-xl sm:p-10"
        >
          <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/20 blur-3xl" />

          <Badge className="mb-4 border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-fuchsia-100 hover:bg-fuchsia-500/10">
            <Sparkles className="mr-1 size-3" />
            {badgeLabel}
          </Badge>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">{description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.32)] transition duration-300 hover:brightness-110">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.08]">
              <Link href="/admin/users">
                <ArrowLeft className="mr-2 size-4" />
                Open Users
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  )
}