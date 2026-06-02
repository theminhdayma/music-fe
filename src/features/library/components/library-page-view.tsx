"use client"

import { api } from "@/api/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/features/home/components/navbar"
import { downloadSignedTrack } from "@/features/player/utils/download-track"
import { useAuthStore } from "@/store/auth-store"
import type { ApiResponse, PageResponse } from "@/types/home"
import type { LibraryItem } from "@/types/library"
import { motion } from "framer-motion"
import { Calendar, Download, Loader2, Music2, Search, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const FILTERS = ["ALL", "RECENT"] as const

type FilterType = (typeof FILTERS)[number]

export function LibraryPageView() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [items, setItems] = useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloadingId, setIsDownloadingId] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("ALL")

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get<ApiResponse<PageResponse<LibraryItem>>>("/buyer/library")
      const content = response.data?.data?.content ?? []
      setItems(content)
    } catch (error) {
      console.error(error)
      toast.error("Could not load your library")
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role !== "BUYER") {
      router.replace("/")
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLibrary()
  }, [isHydrated, user, user?.id, user?.role, router, fetchLibrary])

  const filteredItems = useMemo(() => {
    let result = [...items]

    if (filter === "RECENT") {
      result = result
        .sort((a, b) => {
          const aTime = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0
          const bTime = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0
          return bTime - aTime
        })
        .slice(0, 12)
    }

    const q = query.trim().toLowerCase()
    if (!q) return result

    return result.filter((item) => {
      return [item.title, item.artistName].some((value) => (value ?? "").toLowerCase().includes(q))
    })
  }, [items, filter, query])

  const handleDownload = async (musicId: number) => {
    setIsDownloadingId(musicId)
    try {
      await downloadSignedTrack(musicId, `${musicId}.mp3`)
    } finally {
      setIsDownloadingId(null)
    }
  }

  const isEmpty = !isLoading && filteredItems.length === 0

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 space-y-4"
        >
          <Badge className="border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-fuchsia-200 hover:bg-fuchsia-500/10">
            Purchased Library
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Your licensed music vault</h1>
          <p className="max-w-3xl text-zinc-400">
            Find purchased tracks instantly, filter your collection, and download signed files securely when you need them.
          </p>
        </motion.section>

        <section className="mb-6 grid gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:grid-cols-[1fr_auto] sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or artist"
              className="h-11 rounded-xl border-white/10 bg-black/25 pl-10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
            />
          </div>

          <div className="flex items-center gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium tracking-[0.18em] transition ${
                  filter === item
                    ? "border-fuchsia-400/35 bg-fuchsia-500/14 text-fuchsia-100"
                    : "border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <LoadingGrid />
        ) : isEmpty ? (
          <EmptyLibrary query={query} />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <LibraryCard
                key={item.musicId}
                item={item}
                index={index}
                isDownloading={isDownloadingId === item.musicId}
                onDownload={() => void handleDownload(item.musicId)}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

function LibraryCard({
  item,
  index,
  isDownloading,
  onDownload,
}: {
  item: LibraryItem
  index: number
  isDownloading: boolean
  onDownload: () => void
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md"
    >
      <div className="relative h-44 overflow-hidden bg-black/30">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition duration-500 hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.45),transparent_28%),linear-gradient(160deg,#1b1028,#09060d_70%)]">
            <Music2 className="size-12 text-fuchsia-200/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        <Badge className="absolute left-3 top-3 border border-fuchsia-400/25 bg-fuchsia-500/15 text-[10px] tracking-[0.2em] text-fuchsia-100 hover:bg-fuchsia-500/15">
          OWNED
        </Badge>
      </div>

      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold text-white">{item.title}</h3>
            <p className="line-clamp-1 text-sm text-zinc-400">{item.artistName}</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-400">
            <Calendar className="size-3.5 text-fuchsia-300" />
            Purchased {formatPurchasedDate(item.purchasedAt)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="h-10 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white transition duration-300 hover:brightness-110 disabled:opacity-60"
            >
              {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="mr-2 size-4" />} Download
            </Button>
            <div className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs uppercase tracking-[0.18em] text-zinc-300">
              License owned
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  )
}

function LoadingGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-[290px] animate-pulse rounded-[1.6rem] border border-white/10 bg-white/[0.04]" />
      ))}
    </section>
  )
}

function EmptyLibrary({ query }: { query: string }) {
  return (
    <Card className="border-dashed border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 text-fuchsia-200">
          <Sparkles className="size-9" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No purchased tracks yet</h2>
        <p className="max-w-md text-sm leading-7 text-zinc-400">
          {query ? `No results for "${query}" in your library.` : "Purchase tracks from the marketplace and they will appear here instantly."}
        </p>
        <Button asChild className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.32)] transition duration-300 hover:brightness-110">
          <Link href="/">Explore Music</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function formatPurchasedDate(value?: string | null) {
  if (!value) return "recently"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "recently"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
