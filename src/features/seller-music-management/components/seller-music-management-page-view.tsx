"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Navbar } from "@/features/home/components/navbar"
import { sellerMusicManagementService } from "@/features/seller-music-management/services/seller-music-management-service"
import type { SellerMusicDetail, SellerMusicListItem, SellerMusicStatus } from "@/features/seller-music-management/types/seller-music-management"
import { formatTimestamp } from "@/lib/date-format"
import { useAuthStore } from "@/store/auth-store"
import type { PageResponse } from "@/types/home"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePenLine,
  Loader2,
  Music2,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 5
const STATUS_FILTERS: Array<{ label: string; value: SellerMusicStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Hidden", value: "HIDDEN" },
]

type PaginationItem = number | "ellipsis"

export function SellerMusicManagementPageView() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [pageData, setPageData] = useState<PageResponse<SellerMusicListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [keywordInput, setKeywordInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<SellerMusicStatus | "ALL">("ALL")
  const [page, setPage] = useState(0)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewMusic, setViewMusic] = useState<SellerMusicDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [selectedDeleteMusic, setSelectedDeleteMusic] = useState<SellerMusicListItem | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const fetchMusics = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    try {
      const response = await sellerMusicManagementService.getMusics({
        page,
        size: PAGE_SIZE,
        keyword: keyword.trim() || undefined,
        status: status === "ALL" ? undefined : status,
      })
      setPageData(response)
    } catch (error) {
      setIsError(true)
      setErrorMessage(error instanceof Error ? error.message : "Could not load seller musics")
      setPageData(null)
    } finally {
      setIsLoading(false)
    }
  }, [keyword, page, status])

  useEffect(() => {
    if (!isHydrated || !user || user.role !== "SELLER") return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMusics()
  }, [fetchMusics, isHydrated, user])

  useEffect(() => {
    if (!viewOpen || !viewMusic?.id) return

    let isActive = true

    const loadDetail = async () => {
      setViewLoading(true)
      setViewError(null)

      try {
        const detail = await sellerMusicManagementService.getMusic(viewMusic.id)
        if (!isActive) return
        setViewMusic((previous) => {
          if (!previous) return detail
          return {
            ...previous,
            ...detail,
            id: Number.isFinite(detail.id) ? detail.id : previous.id,
          }
        })
      } catch (error) {
        if (!isActive) return
        setViewError(error instanceof Error ? error.message : "Could not load music detail")
      } finally {
        if (isActive) setViewLoading(false)
      }
    }

    void loadDetail()

    return () => {
      isActive = false
    }
  }, [viewMusic?.id, viewOpen])

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setPage(0)
      setKeyword(keywordInput)
    },
    [keywordInput]
  )

  const handleStatusChange = useCallback((nextStatus: SellerMusicStatus | "ALL") => {
    setPage(0)
    setStatus(nextStatus)
  }, [])

  const handleOpenView = useCallback((music: SellerMusicListItem) => {
    setViewMusic(music)
    setViewError(null)
    setViewOpen(true)
  }, [])

  const handleOpenDelete = useCallback((music: SellerMusicListItem) => {
    setSelectedDeleteMusic(music)
    setIsDeleteOpen(true)
  }, [])

  const handleEdit = useCallback(
    (music: SellerMusicListItem | SellerMusicDetail) => {
      if (!Number.isFinite(music.id) || music.id <= 0) {
        toast.error("Invalid music id")
        return
      }
      router.push(`/seller/musics/${music.id}/edit`)
    },
    [router]
  )

  const handleDelete = async () => {
    if (!selectedDeleteMusic) return

    setIsDeleting(true)

    try {
      await sellerMusicManagementService.deleteMusic(selectedDeleteMusic.id)
      toast.success("Music deleted successfully")
      setIsDeleteOpen(false)
      setSelectedDeleteMusic(null)
      if (viewMusic?.id === selectedDeleteMusic.id) {
        setViewOpen(false)
        setViewMusic(null)
      }
      await fetchMusics()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete music")
    } finally {
      setIsDeleting(false)
    }
  }

  const paginationItems = useMemo(() => buildPaginationItems(pageData?.pageNumber ?? page, pageData?.totalPages ?? 0), [page, pageData?.pageNumber, pageData?.totalPages])

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Music Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Review your catalog, search by keyword, filter by status, and keep every release under control.
              </p>
            </div>
            <Button asChild className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white transition duration-300 hover:brightness-110">
              <Link href="/seller/musics/create">
                <Plus className="mr-2 size-4" />
                Create Music
              </Link>
            </Button>
          </div>
        </motion.section>

        <section className="mb-6 grid gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md lg:grid-cols-[1fr_auto] lg:items-center lg:p-5">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Search your catalog by title or artist"
                className="h-11 rounded-xl border-white/10 bg-black/25 pl-10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
              />
            </div>
            <Button type="submit" className="h-11 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleStatusChange(item.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium tracking-[0.18em] transition ${
                  status === item.value
                    ? "border-fuchsia-400/35 bg-fuchsia-500/14 text-fuchsia-100"
                    : "border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState errorMessage={errorMessage} onRetry={() => void fetchMusics()} />
        ) : pageData && pageData.content.length > 0 ? (
          <div className="space-y-5">
            <DesktopTable items={pageData.content} onView={handleOpenView} onEdit={handleEdit} onDelete={handleOpenDelete} />
            <MobileCards items={pageData.content} onView={handleOpenView} onEdit={handleEdit} onDelete={handleOpenDelete} />

            <PaginationBar
              currentPage={pageData.pageNumber}
              totalPages={pageData.totalPages}
              totalElements={pageData.totalElements}
              pageSize={pageData.pageSize}
              paginationItems={paginationItems}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <EmptyState keyword={keyword} status={status} />
        )}
      </main>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="w-full border-white/10 bg-[#09070f] text-white sm:max-w-xl">
          <SheetHeader className="border-b border-white/10 pb-4">
            <SheetTitle className="text-xl text-white">Music Preview</SheetTitle>
            <SheetDescription className="text-zinc-400">Inspect the release metadata before taking action.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-1 py-2">
            {viewLoading ? (
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="h-52 animate-pulse rounded-2xl bg-white/8" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/8" />
              </div>
            ) : null}

            {viewError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{viewError}</p> : null}

            {viewMusic ? <MusicDetailsCard music={viewMusic} onEdit={handleEdit} /> : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-white/10 bg-[#09070f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this music?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will soft delete <span className="font-medium text-zinc-100">{selectedDeleteMusic?.title ?? "this release"}</span> and remove it from the management list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/10 bg-transparent px-0 pb-0 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="rounded-xl bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-60"
            >
              {isDeleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DesktopTable({
  items,
  onView,
  onEdit,
  onDelete,
}: {
  items: SellerMusicListItem[]
  onView: (music: SellerMusicListItem) => void
  onEdit: (music: SellerMusicListItem) => void
  onDelete: (music: SellerMusicListItem) => void
}) {
  return (
    <Card className="hidden overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <tr>
                <th className="px-5 py-4">Track</th>
                <th className="px-5 py-4">Genre</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((music, index) => (
                <motion.tr
                  key={music.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        {music.thumbnailUrl ? (
                          <Image src={music.thumbnailUrl} alt={music.title} fill unoptimized className="object-cover" sizes="56px" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-fuchsia-200/70">
                            <Music2 className="size-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="max-w-[18rem] truncate text-sm font-semibold text-white">{music.title}</p>
                        <p className="mt-1 text-xs text-zinc-400">{music.artistName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{music.genreName ?? "-"}</td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{formatPrice(music.price)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={music.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{formatTimestamp(music.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onView(music)}
                        className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
                      >
                        <Eye className="mr-2 size-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => onEdit(music)}
                        className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
                      >
                        <FilePenLine className="mr-2 size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDelete(music)}
                        className="rounded-xl border-rose-400/20 bg-rose-500/10 text-rose-100 hover:border-rose-400/35 hover:bg-rose-500/20"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function MobileCards({
  items,
  onView,
  onEdit,
  onDelete,
}: {
  items: SellerMusicListItem[]
  onView: (music: SellerMusicListItem) => void
  onEdit: (music: SellerMusicListItem) => void
  onDelete: (music: SellerMusicListItem) => void
}) {
  return (
    <section className="grid gap-4 lg:hidden">
      {items.map((music, index) => (
        <motion.article
          key={music.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md"
        >
          <div className="relative h-48 overflow-hidden bg-black/30">
            {music.thumbnailUrl ? (
              <Image src={music.thumbnailUrl} alt={music.title} fill unoptimized sizes="100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.45),transparent_28%),linear-gradient(160deg,#1b1028,#09060d_70%)]">
                <Music2 className="size-12 text-fuchsia-200/80" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute left-3 top-3">
              <StatusBadge status={music.status} />
            </div>
          </div>

          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="space-y-4 p-4">
              <div>
                <h3 className="line-clamp-1 text-lg font-semibold text-white">{music.title}</h3>
                <p className="text-sm text-zinc-400">{music.artistName}</p>
              </div>

              <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                <InfoChip label="Genre" value={music.genreName ?? "-"} />
                <InfoChip label="Price" value={formatPrice(music.price)} />
                <InfoChip label="Created" value={formatTimestamp(music.createdAt)} />
                <InfoChip label="Status" value={music.status} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button type="button" onClick={() => onView(music)} className="h-10 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
                  <Eye className="mr-2 size-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onEdit(music)}
                  className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
                >
                  <FilePenLine className="mr-2 size-4" />
                  Edit
                </Button>
                <Button type="button" onClick={() => onDelete(music)} className="h-10 rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:border-rose-400/35 hover:bg-rose-500/20">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.article>
      ))}
    </section>
  )
}

function PaginationBar({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  paginationItems,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  paginationItems: PaginationItem[]
  onPageChange: (page: number) => void
}) {
  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1
  const end = totalElements === 0 ? 0 : Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-400">
          Showing {start}-{end} of {totalElements}
        </p>

        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
            disabled={currentPage <= 0}
            className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06] disabled:opacity-40"
          >
            <ChevronLeft className="mr-2 size-4" />
            Prev
          </Button>

          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-zinc-500">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition ${
                  item === currentPage
                    ? "border-fuchsia-400/35 bg-fuchsia-500/14 text-fuchsia-100"
                    : "border-white/10 bg-black/20 text-zinc-300 hover:border-fuchsia-400/25 hover:text-white"
                }`}
              >
                {item + 1}
              </button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(Math.min(currentPage + 1, Math.max(totalPages - 1, 0)))}
            disabled={currentPage >= totalPages - 1}
            className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06] disabled:opacity-40"
          >
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <section className="space-y-4">
      <div className="hidden overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] lg:block">
        <div className="animate-pulse">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.9fr_1fr] gap-4 border-b border-white/10 px-5 py-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-4 rounded-full bg-white/8" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.9fr_1fr] gap-4 px-5 py-4">
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-10 rounded-2xl bg-white/8" />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-48 rounded-2xl bg-white/8" />
              <div className="h-5 w-2/3 rounded-full bg-white/8" />
              <div className="h-4 w-1/3 rounded-full bg-white/8" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                {Array.from({ length: 4 }).map((__, cellIndex) => (
                  <div key={cellIndex} className="h-10 rounded-xl bg-white/8" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ErrorState({ errorMessage, onRetry }: { errorMessage: string | null; onRetry: () => void }) {
  return (
    <section className="rounded-[1.8rem] border border-rose-400/20 bg-rose-500/8 p-8 text-center backdrop-blur-xl">
      <AlertTriangle className="mx-auto size-6 text-rose-300" />
      <h2 className="mt-3 text-xl font-semibold text-rose-100">Could not load seller musics</h2>
      <p className="mt-2 text-sm text-rose-200/90">{errorMessage ?? "Please try again."}</p>
      <Button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-400">
        Retry
      </Button>
    </section>
  )
}

function EmptyState({ keyword, status }: { keyword: string; status: SellerMusicStatus | "ALL" }) {
  return (
    <Card className="border-dashed border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 text-fuchsia-200">
          <Music2 className="size-9" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No music found</h2>
        <p className="max-w-md text-sm leading-7 text-zinc-400">
          {keyword || status !== "ALL"
            ? "Try a different keyword or status filter to surface more releases."
            : "Upload your first release and it will appear here for catalog management."}
        </p>
        <Button asChild className="h-11 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
          <Link href="/seller/musics/create">
            <Plus className="mr-2 size-4" />
            Create Music
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function MusicDetailsCard({ music, onEdit }: { music: SellerMusicDetail; onEdit: (music: SellerMusicDetail) => void }) {
  return (
    <div className="space-y-5 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30">
        {music.thumbnailUrl ? (
          <Image src={music.thumbnailUrl} alt={music.title} fill unoptimized sizes="(max-width: 640px) 100vw, 480px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.45),transparent_28%),linear-gradient(160deg,#1b1028,#09060d_70%)]">
            <Music2 className="size-12 text-fuchsia-200/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold text-white">{music.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{music.artistName}</p>
          </div>
          <StatusBadge status={music.status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoChip label="Genre" value={music.genreName ?? "-"} />
          <InfoChip label="Price" value={formatPrice(music.price)} />
          <InfoChip label="Created" value={formatTimestamp(music.createdAt)} />
          <InfoChip label="Updated" value={formatTimestamp(music.updatedAt)} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
          {music.description || "No description provided for this release."}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={() => onEdit(music)} className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white hover:brightness-110">
            <ArrowRight className="mr-2 size-4" />
            Edit Music
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]">
            <Link href="/seller/musics">
              <ArrowLeft className="mr-2 size-4" />
              Back to Management
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: SellerMusicStatus }) {
  const variant =
    status === "PUBLISHED"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : status === "HIDDEN"
        ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
        : "border-amber-400/25 bg-amber-500/10 text-amber-100"

  return <Badge className={`border px-3 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-transparent ${variant}`}>{status}</Badge>
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  )
}

function formatPrice(price?: number | string | null) {
  if (price === null || price === undefined || price === "") return "-"

  const numeric = typeof price === "number" ? price : Number(price)
  if (Number.isNaN(numeric)) return String(price)

  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric)
}

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 0) return []
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index)

  const items: PaginationItem[] = [0]
  const start = Math.max(1, currentPage - 1)
  const end = Math.min(totalPages - 2, currentPage + 1)

  if (start > 1) {
    items.push("ellipsis")
  }

  for (let index = start; index <= end; index += 1) {
    items.push(index)
  }

  if (end < totalPages - 2) {
    items.push("ellipsis")
  }

  items.push(totalPages - 1)
  return items
}