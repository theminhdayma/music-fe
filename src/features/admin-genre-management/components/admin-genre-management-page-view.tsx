"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAdminGenreManagement } from "@/features/admin-genre-management/hooks/use-admin-genre-management"
import { adminGenreManagementService } from "@/features/admin-genre-management/services/admin-genre-management-service"
import type {
    AdminGenreFormValues,
    AdminGenreListItem,
    AdminGenreQuery,
} from "@/features/admin-genre-management/types/admin-genre-management"
import { Navbar } from "@/features/home/components/navbar"
import { useAuthStore } from "@/store/auth-store"
import { motion } from "framer-motion"
import {
    AlertTriangle,
    ArrowLeft,
    BadgeInfo,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Tags,
    Trash2,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 5

type PaginationItem = number | "ellipsis"
type GenreFormMode = "create" | "edit"

export function AdminGenreManagementPageView({ initialQuery }: { initialQuery: AdminGenreQuery }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<GenreFormMode>("create")
  const [selectedGenre, setSelectedGenre] = useState<AdminGenreListItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const query = useMemo(
    () => ({
      page: initialQuery.page,
      keyword: initialQuery.keyword.trim(),
    }),
    [initialQuery.keyword, initialQuery.page]
  )

  const { data, isLoading, isError, errorMessage, refetch } = useAdminGenreManagement(query)

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

  const updateUrl = useCallback(
    (nextQuery: Partial<AdminGenreQuery>) => {
      const params = new URLSearchParams()

      const nextPage = nextQuery.page ?? query.page
      const nextKeyword = nextQuery.keyword ?? query.keyword

      if (nextPage > 0) {
        params.set("page", String(nextPage))
      }

      if (nextKeyword.trim()) {
        params.set("keyword", nextKeyword.trim())
      }

      const search = params.toString()
      router.push(search ? `${pathname}?${search}` : pathname)
    },
    [pathname, query.keyword, query.page, router]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page })
    },
    [updateUrl]
  )

  const handleOpenCreate = useCallback(() => {
    setFormMode("create")
    setSelectedGenre(null)
    setIsFormOpen(true)
  }, [])

  const handleOpenEdit = useCallback((genre: AdminGenreListItem) => {
    setFormMode("edit")
    setSelectedGenre(genre)
    setIsFormOpen(true)
  }, [])

  const handleOpenDelete = useCallback((genre: AdminGenreListItem) => {
    setSelectedGenre(genre)
    setIsDeleteOpen(true)
  }, [])

  const handleSubmitGenre = useCallback(
    async (values: AdminGenreFormValues) => {
      setIsSaving(true)

      try {
        if (formMode === "create") {
          await adminGenreManagementService.createGenre(values)
          toast.success("Genre created successfully")
        } else if (selectedGenre) {
          await adminGenreManagementService.updateGenre(selectedGenre.id, values)
          toast.success("Genre updated successfully")
        }

        setIsFormOpen(false)
        setSelectedGenre(null)
        await refetch()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save genre")
      } finally {
        setIsSaving(false)
      }
    },
    [formMode, refetch, selectedGenre]
  )

  const handleDeleteGenre = useCallback(async () => {
    if (!selectedGenre) return

    setIsDeleting(true)

    try {
      await adminGenreManagementService.deleteGenre(selectedGenre.id)
      toast.success("Genre deleted successfully")
      setIsDeleteOpen(false)
      setSelectedGenre(null)
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete genre")
    } finally {
      setIsDeleting(false)
    }
  }, [refetch, selectedGenre])

  const paginationItems = useMemo(
    () => buildPaginationItems(data?.pageNumber ?? query.page, data?.totalPages ?? 0),
    [data?.pageNumber, data?.totalPages, query.page]
  )

  const pageData = (data?.content ?? [])

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
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Genre Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Search genres by name, keep the catalog organized, and manage create, update, and soft delete actions from one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]">
                <Link href="/admin">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button
                type="button"
                onClick={handleOpenCreate}
                className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white transition duration-300 hover:brightness-110"
              >
                <Plus className="mr-2 size-4" />
                Create Genre
              </Button>
            </div>
          </div>
        </motion.section>

        <section className="mb-6 space-y-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md lg:p-5">
          <GenreSearchForm key={`${initialQuery.page}:${initialQuery.keyword}`} initialKeyword={initialQuery.keyword} onSubmit={updateUrl} />

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
              <BadgeInfo className="size-3.5 text-fuchsia-200" />
              Server-side pagination
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
              <Tags className="size-3.5 text-fuchsia-200" />
              Active state shown inline
            </span>
          </div>
        </section>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState errorMessage={errorMessage} onRetry={() => void refetch()} />
        ) : pageData.length > 0 ? (
          <div className="space-y-5">
            <GenreTable items={pageData} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />

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
          <EmptyState keyword={query.keyword} onCreate={handleOpenCreate} />
        )}
      </main>

      <GenreFormDialog
        key={`${isFormOpen ? formMode : "closed"}-${selectedGenre?.id ?? "new"}`}
        open={isFormOpen}
        mode={formMode}
        initialGenre={selectedGenre}
        isSubmitting={isSaving}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitGenre}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-white/10 bg-[#09070f] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this genre?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will soft delete <span className="font-medium text-zinc-100">{selectedGenre?.name ?? "this genre"}</span> from the platform.
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
              onClick={() => void handleDeleteGenre()}
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

function GenreTable({
  items,
  onEdit,
  onDelete,
}: {
  items: AdminGenreListItem[]
  onEdit: (genre: AdminGenreListItem) => void
  onDelete: (genre: AdminGenreListItem) => void
}) {
  return (
    <Card className="overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((genre, index) => (
                <motion.tr
                  key={genre.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 align-top">
  <p className="max-w-[18rem] truncate text-sm font-semibold text-white" title={genre.name}>
    {genre.name}
  </p>
</td>
<td className="px-5 py-4 align-top text-sm text-zinc-300">
  <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-xs text-zinc-200">
    {genre.slug}
  </span>
</td>
<td className="px-5 py-4 align-top text-sm text-zinc-300">
  <p className="max-w-[20rem] truncate" title={genre.description ?? ""}>
    {genre.description?.trim() ? genre.description : "-"}
  </p>
</td>
<td className="px-5 py-4 align-top">
  <GenreStateBadge active={genre.active} />
</td>
<td className="px-5 py-4 align-top text-sm text-zinc-300">
  {formatDateTime(genre.createdAt)}
</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onEdit(genre)}
                        className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDelete(genre)}
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

function GenreFormDialog({
  open,
  mode,
  initialGenre,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  mode: GenreFormMode
  initialGenre: AdminGenreListItem | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AdminGenreFormValues) => Promise<void>
}) {
  const [name, setName] = useState(() => initialGenre?.name ?? "")
  const [slug, setSlug] = useState(() => initialGenre?.slug ?? "")
  const [description, setDescription] = useState(() => initialGenre?.description ?? "")
  const [isActive, setIsActive] = useState(() => initialGenre?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [isSlugTouched, setIsSlugTouched] = useState(false)

  const title = mode === "create" ? "Create Genre" : "Edit Genre"
  const descriptionText =
    mode === "create"
      ? "Add a new genre with a name, slug, optional description, and active state."
      : "Update the genre details or toggle whether it remains active in the catalog."

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isSlugTouched) {
      setSlug(slugify(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setIsSlugTouched(true)
    setSlug(slugify(value))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedSlug = slug.trim()

    if (!trimmedName) {
      setError("Name is required")
      return
    }

    if (!trimmedSlug) {
      setError("Slug is required")
      return
    }

    setError(null)
    await onSubmit({
      name: trimmedName,
      slug: trimmedSlug,
      description: description.trim(),
      isActive,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#09070f] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-zinc-400">{descriptionText}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200" htmlFor="genre-name">
                Name
              </label>
              <Input
                id="genre-name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Lo-fi"
                maxLength={100}
                className="h-11 rounded-xl border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200" htmlFor="genre-slug">
                Slug
              </label>
              <Input
                id="genre-slug"
                value={slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                placeholder="lo-fi"
                maxLength={120}
                className="h-11 rounded-xl border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200" htmlFor="genre-description">
              Description
            </label>
            <Textarea
              id="genre-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description for this genre"
              maxLength={1000}
              className="min-h-32 rounded-xl border-white/10 bg-black/25 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 rounded border-white/20 bg-black/40 text-fuchsia-500 focus:ring-fuchsia-500/40"
            />
            Active
          </label>

          <DialogFooter className="border-white/10 bg-transparent px-0 pb-0 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400 disabled:opacity-60">
              {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Tags className="mr-2 size-4" />}
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function GenreSearchForm({
  initialKeyword,
  onSubmit,
}: {
  initialKeyword: string
  onSubmit: (nextQuery: Partial<AdminGenreQuery>) => void
}) {
  const [keywordInput, setKeywordInput] = useState(initialKeyword)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ page: 0, keyword: keywordInput })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="Search by genre name"
          className="h-11 rounded-xl border-white/10 bg-black/25 pl-10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
        />
      </div>
      <Button type="submit" className="h-11 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
        Search
      </Button>
    </form>
  )
}

function GenreStateBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={`border px-2 py-1 text-[10px] uppercase tracking-[0.22em] ${
        active
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/10"
          : "border-amber-400/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/10"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
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
      <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04]">
        <div className="animate-pulse">
          <div className="grid grid-cols-[1.3fr_0.9fr_1.9fr_0.8fr_1fr] gap-4 border-b border-white/10 px-5 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 rounded-full bg-white/8" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.3fr_0.9fr_1.9fr_0.8fr_1fr] gap-4 px-5 py-4">
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-10 rounded-2xl bg-white/8" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ErrorState({ errorMessage, onRetry }: { errorMessage: string | null; onRetry: () => void }) {
  return (
    <section className="rounded-[1.8rem] border border-rose-400/20 bg-rose-500/8 p-8 text-center backdrop-blur-xl">
      <AlertTriangle className="mx-auto size-6 text-rose-300" />
      <h2 className="mt-3 text-xl font-semibold text-rose-100">Could not load genres</h2>
      <p className="mt-2 text-sm text-rose-200/90">{errorMessage ?? "Please try again."}</p>
      <Button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-400">
        Retry
      </Button>
    </section>
  )
}

function EmptyState({ keyword, onCreate }: { keyword: string; onCreate: () => void }) {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
      <Tags className="mx-auto size-6 text-fuchsia-200" />
      <h2 className="mt-3 text-xl font-semibold text-white">No genres found</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {keyword.trim()
          ? "Try a different search term or clear the current filter."
          : "Create the first genre to start organizing the catalog."}
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Button type="button" onClick={onCreate} className="rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
          <Plus className="mr-2 size-4" />
          Create Genre
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]">
          <Link href="/admin">
            <ArrowLeft className="mr-2 size-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </section>
  )
}

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const items: PaginationItem[] = [0]

  if (currentPage > 2) {
    items.push("ellipsis")
  }

  const start = Math.max(1, currentPage - 1)
  const end = Math.min(totalPages - 2, currentPage + 1)

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (currentPage < totalPages - 3) {
    items.push("ellipsis")
  }

  items.push(totalPages - 1)

  return Array.from(new Set(items))
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}
