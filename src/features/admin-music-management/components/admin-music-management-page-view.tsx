"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAdminMusicManagement } from "@/features/admin-music-management/hooks/use-admin-music-management"
import { adminMusicManagementService } from "@/features/admin-music-management/services/admin-music-management-service"
import type {
  AdminMusicDetail,
  AdminMusicListItem,
  AdminMusicQuery,
  AdminMusicStatus,
} from "@/features/admin-music-management/types/admin-music-management"
import { Navbar } from "@/features/home/components/navbar"
import { formatTimestamp } from "@/lib/date-format"
import { useAuthStore } from "@/store/auth-store"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Music2,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10
const STATUS_FILTERS: Array<{ label: string; value: AdminMusicStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Hidden", value: "HIDDEN" },
]

type PaginationItem = number | "ellipsis"

export function AdminMusicManagementPageView({ initialQuery }: { initialQuery: AdminMusicQuery }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [keywordInput, setKeywordInput] = useState(initialQuery.keyword)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewMusic, setViewMusic] = useState<AdminMusicDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [selectedHideMusic, setSelectedHideMusic] = useState<AdminMusicListItem | null>(null)
  const [isHideOpen, setIsHideOpen] = useState(false)
  const [isHiding, setIsHiding] = useState(false)
  const [selectedDeleteMusic, setSelectedDeleteMusic] = useState<AdminMusicListItem | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const query = useMemo(
    () => ({
      page: initialQuery.page,
      keyword: initialQuery.keyword.trim(),
      status: initialQuery.status,
    }),
    [initialQuery.keyword, initialQuery.page, initialQuery.status]
  )

  const { data, isLoading, isError, errorMessage, refetch } = useAdminMusicManagement(query)

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKeywordInput(initialQuery.keyword)
  }, [initialQuery.keyword])

  useEffect(() => {
    if (!viewOpen || !viewMusic?.id) return

    let isActive = true

    const loadDetail = async () => {
      setViewLoading(true)
      setViewError(null)

      try {
        const detail = await adminMusicManagementService.getMusic(viewMusic.id)
        if (!isActive) return
        setViewMusic(detail)
      } catch (error) {
        if (!isActive) return
        setViewError(error instanceof Error ? error.message : "Could not load music detail")
      } finally {
        if (isActive) {
          setViewLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      isActive = false
    }
  }, [viewOpen, viewMusic?.id])

  const updateUrl = useCallback(
    (nextQuery: Partial<AdminMusicQuery>) => {
      const params = new URLSearchParams()

      const nextPage = nextQuery.page ?? query.page
      const nextKeyword = nextQuery.keyword ?? query.keyword
      const nextStatus = nextQuery.status ?? query.status

      if (nextPage > 0) {
        params.set("page", String(nextPage))
      }

      if (nextKeyword.trim()) {
        params.set("keyword", nextKeyword.trim())
      }

      if (nextStatus !== "ALL") {
        params.set("status", nextStatus)
      }

      const search = params.toString()
      router.push(search ? `${pathname}?${search}` : pathname)
    },
    [pathname, query.keyword, query.page, query.status, router]
  )

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      updateUrl({ page: 0, keyword: keywordInput })
    },
    [keywordInput, updateUrl]
  )

  const handleStatusChange = useCallback(
    (status: AdminMusicStatus | "ALL") => {
      updateUrl({ page: 0, status })
    },
    [updateUrl]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page })
    },
    [updateUrl]
  )

  const handleOpenView = useCallback((music: AdminMusicListItem) => {
    setViewMusic(music)
    setViewError(null)
    setViewOpen(true)
  }, [])

  const handleOpenHide = useCallback((music: AdminMusicListItem) => {
    setSelectedHideMusic(music)
    setIsHideOpen(true)
  }, [])

  const handleOpenDelete = useCallback((music: AdminMusicListItem) => {
    setSelectedDeleteMusic(music)
    setIsDeleteOpen(true)
  }, [])

  const handleHideMusic = async () => {
    if (!selectedHideMusic) return

    setIsHiding(true)

    try {
      const updated = await adminMusicManagementService.hideMusic(selectedHideMusic.id)
      toast.success("Music hidden successfully")
      setIsHideOpen(false)
      setSelectedHideMusic(null)
      setViewMusic((previous) => (previous?.id === updated.id ? updated : previous))
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not hide music")
    } finally {
      setIsHiding(false)
    }
  }

  const handleDeleteMusic = async () => {
    if (!selectedDeleteMusic) return

    setIsDeleting(true)

    try {
      await adminMusicManagementService.deleteMusic(selectedDeleteMusic.id)
      toast.success("Music deleted successfully")
      setIsDeleteOpen(false)
      setSelectedDeleteMusic(null)
      if (viewMusic?.id === selectedDeleteMusic.id) {
        setViewOpen(false)
        setViewMusic(null)
      }
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete music")
    } finally {
      setIsDeleting(false)
    }
  }

  const paginationItems = useMemo(
    () => buildPaginationItems(data?.pageNumber ?? query.page, data?.totalPages ?? 0),
    [data?.pageNumber, data?.totalPages, query.page]
  )

  const pageData = data?.content ?? []

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Music Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Search by title, inspect any release, and keep the catalog aligned with admin moderation rules.
              </p>
            </div>
            <Button asChild className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white transition duration-300 hover:brightness-110">
              <Link href="/admin">
                <ArrowLeft className="mr-2 size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </motion.section>

        <section className="mb-6 space-y-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md lg:p-5">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Search by music title"
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
                  query.status === item.value
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
          <ErrorState errorMessage={errorMessage} onRetry={() => void refetch()} />
        ) : pageData.length > 0 ? (
          <div className="space-y-5">
            <DesktopTable items={pageData} onView={handleOpenView} onHide={handleOpenHide} onDelete={handleOpenDelete} />
            <MobileCards items={pageData} onView={handleOpenView} onHide={handleOpenHide} onDelete={handleOpenDelete} />

            <PaginationBar
              currentPage={data?.pageNumber ?? query.page}
              totalPages={data?.totalPages ?? 0}
              totalElements={data?.totalElements ?? 0}
              pageSize={data?.pageSize ?? PAGE_SIZE}
              paginationItems={paginationItems}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <EmptyState keyword={query.keyword} status={query.status} />
        )}
      </main>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="w-full border-white/10 bg-[#09070f] text-white sm:max-w-2xl">
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

            {viewMusic ? <MusicDetailsCard music={viewMusic} onHide={handleOpenHide} onDelete={handleOpenDelete} /> : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isHideOpen} onOpenChange={setIsHideOpen}>
        <DialogContent className="border-white/10 bg-[#09070f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Hide this music?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will hide <span className="font-medium text-zinc-100">{selectedHideMusic?.title ?? "this release"}</span> from public visibility.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/10 bg-transparent px-0 pb-0 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
              onClick={() => setIsHideOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleHideMusic()}
              disabled={isHiding}
              className="rounded-xl bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-60"
            >
              {isHiding ? <Loader2 className="mr-2 size-4 animate-spin" /> : <EyeOff className="mr-2 size-4" />}
              Hide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-white/10 bg-[#09070f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this music?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will soft delete <span className="font-medium text-zinc-100">{selectedDeleteMusic?.title ?? "this release"}</span> from the platform.
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
              onClick={() => void handleDeleteMusic()}
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
  onHide,
  onDelete,
}: {
  items: AdminMusicListItem[]
  onView: (music: AdminMusicListItem) => void
  onHide: (music: AdminMusicListItem) => void
  onDelete: (music: AdminMusicListItem) => void
}) {
  return (
    <Card className="hidden overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <tr>
                <th className="px-5 py-4">Track</th>
                <th className="px-5 py-4">Seller</th>
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
                  <td className="px-5 py-4 text-sm text-zinc-300">{music.sellerName ?? "-"}</td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{music.genreName ?? "-"}</td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{formatPrice(music.price)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={music.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{formatTimestamp(music.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => onView(music)} className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]">
                        <Eye className="mr-2 size-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onHide(music)}
                        disabled={music.status === "HIDDEN"}
                        className="rounded-xl border-amber-400/20 bg-amber-500/10 text-amber-100 hover:border-amber-400/35 hover:bg-amber-500/20 disabled:opacity-40"
                      >
                        <EyeOff className="mr-2 size-4" />
                        {music.status === "HIDDEN" ? "Hidden" : "Hide"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => onDelete(music)} className="rounded-xl border-rose-400/20 bg-rose-500/10 text-rose-100 hover:border-rose-400/35 hover:bg-rose-500/20">
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
  onHide,
  onDelete,
}: {
  items: AdminMusicListItem[]
  onView: (music: AdminMusicListItem) => void
  onHide: (music: AdminMusicListItem) => void
  onDelete: (music: AdminMusicListItem) => void
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
                <InfoChip label="Seller" value={music.sellerName ?? "-"} />
                <InfoChip label="Genre" value={music.genreName ?? "-"} />
                <InfoChip label="Price" value={formatPrice(music.price)} />
                <InfoChip label="Created" value={formatTimestamp(music.createdAt)} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button type="button" onClick={() => onView(music)} className="h-10 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
                  <Eye className="mr-2 size-4" />
                  View
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onHide(music)}
                  disabled={music.status === "HIDDEN"}
                  className="h-10 rounded-xl border-amber-400/20 bg-amber-500/10 text-amber-100 hover:border-amber-400/35 hover:bg-amber-500/20 disabled:opacity-40"
                >
                  <EyeOff className="mr-2 size-4" />
                  {music.status === "HIDDEN" ? "Hidden" : "Hide"}
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
    <Card className="border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
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
          <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.7fr_0.7fr_0.8fr_1fr] gap-4 border-b border-white/10 px-5 py-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-4 rounded-full bg-white/8" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.5fr_1fr_0.8fr_0.7fr_0.7fr_0.8fr_1fr] gap-4 px-5 py-4">
              {Array.from({ length: 7 }).map((__, cellIndex) => (
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
      <h2 className="mt-3 text-xl font-semibold text-rose-100">Could not load admin musics</h2>
      <p className="mt-2 text-sm text-rose-200/90">{errorMessage ?? "Please try again."}</p>
      <Button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-400">
        Retry
      </Button>
    </section>
  )
}

function EmptyState({ keyword, status }: { keyword: string; status: AdminMusicStatus | "ALL" }) {
  const hasFilters = Boolean(keyword) || status !== "ALL"

  return (
    <Card className="border-dashed border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 text-fuchsia-200">
          <Music2 className="size-9" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No music found</h2>
        <p className="max-w-md text-sm leading-7 text-zinc-400">
          {hasFilters
            ? "Try another keyword or status filter to surface more releases."
            : "Music records will appear here once releases exist in the system."}
        </p>
      </CardContent>
    </Card>
  )
}

function MusicDetailsCard({
  music,
  onHide,
  onDelete,
}: {
  music: AdminMusicDetail
  onHide: (music: AdminMusicDetail) => void
  onDelete: (music: AdminMusicDetail) => void
}) {
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
          <InfoChip label="Seller" value={music.sellerName ?? "-"} />
          <InfoChip label="Genre" value={music.genreName ?? "-"} />
          <InfoChip label="Price" value={formatPrice(music.price)} />
          <InfoChip label="Duration" value={music.durationSeconds ? `${music.durationSeconds}s` : "-"} />
          <InfoChip label="Created" value={formatTimestamp(music.createdAt)} />
          <InfoChip label="Updated" value={formatTimestamp(music.updatedAt)} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
          {music.description || "No description provided for this release."}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => onHide(music)}
            disabled={music.status === "HIDDEN"}
            className="rounded-xl bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-40"
          >
            <EyeOff className="mr-2 size-4" />
            {music.status === "HIDDEN" ? "Hidden" : "Hide Music"}
          </Button>
          <Button type="button" onClick={() => onDelete(music)} className="rounded-xl bg-rose-500 text-white hover:bg-rose-400">
            <Trash2 className="mr-2 size-4" />
            Delete Music
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: AdminMusicStatus }) {
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

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 1) return [0]

  const items: PaginationItem[] = []
  const lastPage = totalPages - 1
  const start = Math.max(0, currentPage - 1)
  const end = Math.min(lastPage, currentPage + 1)

  if (start > 0) {
    items.push(0)
    if (start > 1) items.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    if (!items.includes(page)) {
      items.push(page)
    }
  }

  if (end < lastPage) {
    if (end < lastPage - 1) items.push("ellipsis")
    items.push(lastPage)
  }

  return items
}

function formatPrice(price?: number | string | null) {
  if (price === null || price === undefined || price === "") return "-"

  const numeric = typeof price === "number" ? price : Number(price)
  if (Number.isNaN(numeric)) return String(price)

  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric)
}