"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/features/home/components/navbar"
import { useMusicPlayerStore } from "@/store/music-player-store"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function CheckoutSuccessPageView() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get("orderCode")
  const refreshOwnedTrackIds = useMusicPlayerStore((state) => state.refreshOwnedTrackIds)

  useEffect(() => {
    void refreshOwnedTrackIds()
  }, [refreshOwnedTrackIds])

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="relative mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl items-center justify-center overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10"
        >
          <Badge className="mb-4 border border-emerald-400/25 bg-emerald-500/12 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-emerald-200 hover:bg-emerald-500/12">
            Purchase complete
          </Badge>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/25 via-fuchsia-400/20 to-indigo-400/25"
          >
            <CheckCircle2 className="size-12 text-emerald-300" />
          </motion.div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your order is ready</h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Payment was processed successfully. Your purchased tracks are now available in your library with signed download access.
          </p>

          {orderCode && (
            <p className="mx-auto mt-3 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-zinc-300">
              Order {orderCode}
            </p>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.32)] transition duration-300 hover:brightness-110">
              <Link href="/library">
                Go to Library
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.08]">
              <Link href="/">Continue Browsing</Link>
            </Button>
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-xs text-fuchsia-200">
            <Sparkles className="size-3.5" />
            Premium license secured for this order
          </div>
        </motion.section>
      </main>
    </div>
  )
}
