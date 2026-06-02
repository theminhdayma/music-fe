"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAdminUsers } from "@/features/admin-users/hooks/use-admin-users"
import { adminUsersService } from "@/features/admin-users/services/admin-users-service"
import type {
  AdminAccountStatus,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserRoleFilter,
  AdminUserStatusFilter,
  AdminUsersQuery,
} from "@/features/admin-users/types/admin-users"
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
  Loader2,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
const PAGE_SIZE = 10

const ROLE_FILTERS: Array<{ label: string; value: AdminUserRoleFilter }> = [
  { label: "All Roles", value: "ALL" },
  { label: "Buyers", value: "BUYER" },
  { label: "Sellers", value: "SELLER" },
  { label: "Admins", value: "ADMIN" },
]

const STATUS_FILTERS: Array<{ label: string; value: AdminUserStatusFilter }> = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

type PaginationItem = number | "ellipsis"

export function AdminUsersPageView({ initialQuery }: { initialQuery: AdminUsersQuery }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [keywordInput, setKeywordInput] = useState(initialQuery.keyword)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewUser, setViewUser] = useState<AdminUserDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const query = useMemo(() => {
    return {
      page: initialQuery.page,
      keyword: initialQuery.keyword.trim(),
      role: initialQuery.role,
      status: initialQuery.status,
    }
  }, [initialQuery.keyword, initialQuery.page, initialQuery.role, initialQuery.status])

  const { data, isLoading, isError, errorMessage, refetch } = useAdminUsers(query)

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
    if (!viewOpen || !viewUser?.id) return

    let isActive = true

    const loadDetail = async () => {
      setViewLoading(true)
      setViewError(null)

      try {
        const detail = await adminUsersService.getUser(viewUser.id)
        if (!isActive) return
        setViewUser((previous) => {
          if (!previous) return detail
          return {
            ...previous,
            ...detail,
          }
        })
      } catch (error) {
        if (!isActive) return
        setViewError(error instanceof Error ? error.message : "Could not load user detail")
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
  }, [viewOpen, viewUser?.id])

  const updateUrl = useCallback(
    (nextQuery: Partial<AdminUsersQuery>) => {
      const params = new URLSearchParams()

      const nextPage = nextQuery.page ?? query.page
      const nextKeyword = nextQuery.keyword ?? query.keyword
      const nextRole = nextQuery.role ?? query.role
      const nextStatus = nextQuery.status ?? query.status

      if (nextPage > 0) {
        params.set("page", String(nextPage))
      }

      if (nextKeyword.trim()) {
        params.set("keyword", nextKeyword.trim())
      }

      if (nextRole !== "ALL") {
        params.set("role", nextRole)
      }

      if (nextStatus !== "ALL") {
        params.set("status", nextStatus)
      }

      const search = params.toString()
      router.push(search ? `${pathname}?${search}` : pathname)
    },
    [pathname, query.keyword, query.page, query.role, query.status, router]
  )

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      updateUrl({ page: 0, keyword: keywordInput })
    },
    [keywordInput, updateUrl]
  )

  const handleRoleChange = useCallback(
    (role: AdminUserRoleFilter) => {
      updateUrl({ page: 0, role })
    },
    [updateUrl]
  )

  const handleStatusChange = useCallback(
    (status: AdminUserStatusFilter) => {
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

  const handleOpenView = useCallback((adminUser: AdminUserListItem) => {
    setViewUser(adminUser)
    setViewError(null)
    setViewOpen(true)
  }, [])

  const handleToggleStatus = useCallback(
    async (adminUser: AdminUserDetail, nextStatus: AdminAccountStatus) => {
      if (user?.id === adminUser.id) {
        toast.error("You cannot change your own account status")
        return
      }

      setUpdatingUserId(adminUser.id)

      try {
        const updatedUser = await adminUsersService.updateUserStatus(adminUser.id, { status: nextStatus })
        toast.success(`User ${nextStatus === "ACTIVE" ? "enabled" : "disabled"} successfully`)
        setViewUser((previous) => (previous?.id === updatedUser.id ? updatedUser : previous))
        await refetch()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update user status")
      } finally {
        setUpdatingUserId(null)
      }
    },
    [refetch, user?.id]
  )

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
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">User Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Search users by name or email, filter by role and status, then open a user record to review or change access.
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
                placeholder="Search by full name or email"
                className="h-11 rounded-xl border-white/10 bg-black/25 pl-10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
              />
            </div>
            <Button type="submit" className="h-11 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
              Search
            </Button>
          </form>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Role</p>
              <div className="flex flex-wrap items-center gap-2">
                {ROLE_FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleRoleChange(item.value)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium tracking-[0.18em] transition ${
                      query.role === item.value
                        ? "border-fuchsia-400/35 bg-fuchsia-500/14 text-fuchsia-100"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Status</p>
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
            </div>
          </div>
        </section>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState errorMessage={errorMessage} onRetry={() => void refetch()} />
        ) : pageData.length > 0 ? (
          <div className="space-y-5">
            <DesktopTable
              items={pageData}
              currentUserId={user?.id ?? null}
              updatingUserId={updatingUserId}
              onView={handleOpenView}
              onToggleStatus={handleToggleStatus}
            />
            <MobileCards
              items={pageData}
              currentUserId={user?.id ?? null}
              updatingUserId={updatingUserId}
              onView={handleOpenView}
              onToggleStatus={handleToggleStatus}
            />

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
          <EmptyState keyword={query.keyword} role={query.role} status={query.status} />
        )}
      </main>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="w-full border-white/10 bg-[#09070f] text-white sm:max-w-2xl">
          <SheetHeader className="border-b border-white/10 pb-4">
            <SheetTitle className="text-xl text-white">User Detail</SheetTitle>
            <SheetDescription className="text-zinc-400">Review profile data and change the user account status if needed.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-1 py-2">
            {viewLoading ? (
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="h-48 animate-pulse rounded-2xl bg-white/8" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/8" />
              </div>
            ) : null}

            {viewError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{viewError}</p> : null}

            {viewUser ? (
              <UserDetailCard
                user={viewUser}
                currentUserId={user?.id ?? null}
                isUpdating={updatingUserId === viewUser.id}
                onToggleStatus={handleToggleStatus}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DesktopTable({
  items,
  currentUserId,
  updatingUserId,
  onView,
  onToggleStatus,
}: {
  items: AdminUserListItem[]
  currentUserId: number | null
  updatingUserId: number | null
  onView: (user: AdminUserListItem) => void
  onToggleStatus: (user: AdminUserDetail, status: AdminAccountStatus) => void
}) {
  return (
    <Card className="hidden overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Verified</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 border border-white/10 bg-black/30">
                        <AvatarImage src={item.avatarUrl ?? undefined} alt={item.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-xs font-semibold text-white">
                          {getInitials(item.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="max-w-[18rem] truncate text-sm font-semibold text-white">{item.fullName}</p>
                        <p className="mt-1 text-xs text-zinc-400">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{item.role}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <VerifiedBadge verified={item.emailVerified} />
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{formatTimestamp(item.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onView(item)}
                        className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
                      >
                        <Eye className="mr-2 size-4" />
                        View Detail
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onToggleStatus(item, item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                        disabled={updatingUserId === item.id || currentUserId === item.id}
                        className={`rounded-xl border px-3 text-zinc-100 transition disabled:opacity-40 ${
                          item.status === "ACTIVE"
                            ? "border-rose-400/20 bg-rose-500/10 hover:border-rose-400/35 hover:bg-rose-500/20"
                            : "border-emerald-400/20 bg-emerald-500/10 hover:border-emerald-400/35 hover:bg-emerald-500/20"
                        }`}
                      >
                        {updatingUserId === item.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : item.status === "ACTIVE" ? (
                          <ToggleLeft className="mr-2 size-4" />
                        ) : (
                          <ToggleRight className="mr-2 size-4" />
                        )}
                        {currentUserId === item.id ? "Current User" : item.status === "ACTIVE" ? "Disable" : "Enable"}
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
  currentUserId,
  updatingUserId,
  onView,
  onToggleStatus,
}: {
  items: AdminUserListItem[]
  currentUserId: number | null
  updatingUserId: number | null
  onView: (user: AdminUserListItem) => void
  onToggleStatus: (user: AdminUserDetail, status: AdminAccountStatus) => void
}) {
  return (
    <section className="grid gap-4 lg:hidden">
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md"
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14 border border-white/10 bg-black/30">
                  <AvatarImage src={item.avatarUrl ?? undefined} alt={item.fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-semibold text-white">
                    {getInitials(item.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-lg font-semibold text-white">{item.fullName}</h3>
                  <p className="line-clamp-1 text-sm text-zinc-400">{item.email}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                <InfoChip label="Role" value={item.role} />
                <InfoChip label="Verified" value={item.emailVerified ? "Yes" : "No"} />
                <InfoChip label="Created" value={formatTimestamp(item.createdAt)} />
                <InfoChip label="Status" value={item.status} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" onClick={() => onView(item)} className="h-10 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
                  <Eye className="mr-2 size-4" />
                  View
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onToggleStatus(item, item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                  disabled={updatingUserId === item.id || currentUserId === item.id}
                  className={`h-10 rounded-xl border px-3 text-zinc-100 transition disabled:opacity-40 ${
                    item.status === "ACTIVE"
                      ? "border-rose-400/20 bg-rose-500/10 hover:border-rose-400/35 hover:bg-rose-500/20"
                      : "border-emerald-400/20 bg-emerald-500/10 hover:border-emerald-400/35 hover:bg-emerald-500/20"
                  }`}
                >
                  {updatingUserId === item.id ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : item.status === "ACTIVE" ? (
                    <ToggleLeft className="mr-2 size-4" />
                  ) : (
                    <ToggleRight className="mr-2 size-4" />
                  )}
                  {currentUserId === item.id ? "Current User" : item.status === "ACTIVE" ? "Disable" : "Enable"}
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
          <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr_0.8fr_1fr] gap-4 border-b border-white/10 px-5 py-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-4 rounded-full bg-white/8" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr_0.8fr_1fr] gap-4 px-5 py-4">
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
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-full bg-white/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-2/3 rounded-full bg-white/8" />
                  <div className="h-4 w-1/2 rounded-full bg-white/8" />
                </div>
              </div>
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
      <h2 className="mt-3 text-xl font-semibold text-rose-100">Could not load admin users</h2>
      <p className="mt-2 text-sm text-rose-200/90">{errorMessage ?? "Please try again."}</p>
      <Button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-400">
        Retry
      </Button>
    </section>
  )
}

function EmptyState({
  keyword,
  role,
  status,
}: {
  keyword: string
  role: AdminUserRoleFilter
  status: AdminUserStatusFilter
}) {
  const hasFilters = Boolean(keyword) || role !== "ALL" || status !== "ALL"

  return (
    <Card className="border-dashed border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 text-fuchsia-200">
          <Users className="size-9" />
        </div>
        <h2 className="text-2xl font-semibold text-white">No users found</h2>
        <p className="max-w-md text-sm leading-7 text-zinc-400">
          {hasFilters
            ? "Try another keyword, role, or status filter to surface more accounts."
            : "Users will appear here once accounts exist in the system."}
        </p>
      </CardContent>
    </Card>
  )
}

function UserDetailCard({
  user,
  currentUserId,
  isUpdating,
  onToggleStatus,
}: {
  user: AdminUserDetail
  currentUserId: number | null
  isUpdating: boolean
  onToggleStatus: (user: AdminUserDetail, status: AdminAccountStatus) => void
}) {
  const canToggle = currentUserId !== user.id
  const nextStatus: AdminAccountStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

  return (
    <div className="space-y-5 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="relative flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
        <Avatar className="size-20 border border-white/10 bg-black/30">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
          <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-lg font-semibold text-white">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-2xl font-semibold text-white">{user.fullName}</h3>
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-1 truncate text-sm text-zinc-400">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-fuchsia-100 hover:bg-fuchsia-500/10">
              {user.role}
            </Badge>
            <VerifiedBadge verified={user.emailVerified} />
            {currentUserId === user.id ? (
              <Badge className="border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-100 hover:bg-amber-500/10">
                Current user
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoChip label="Phone" value={user.phoneNumber ?? "-"} />
        <InfoChip label="Date of Birth" value={formatDateOnly(user.dateOfBirth)} />
        <InfoChip label="Created" value={formatTimestamp(user.createdAt)} />
        <InfoChip label="Updated" value={formatTimestamp(user.updatedAt)} />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Address</p>
          <p className="mt-1 text-zinc-200">{user.address ?? "No address provided."}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Bio</p>
          <p className="mt-1 text-zinc-200">{user.bio ?? "No biography provided."}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Deleted At</p>
          <p className="mt-1 text-zinc-200">{formatTimestamp(user.deletedAt)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={() => onToggleStatus(user, nextStatus)}
          disabled={!canToggle || isUpdating}
          className={`rounded-xl text-white transition disabled:opacity-40 ${
            user.status === "ACTIVE"
              ? "bg-rose-500 hover:bg-rose-400"
              : "bg-emerald-500 hover:bg-emerald-400"
          }`}
        >
          {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : user.status === "ACTIVE" ? <ToggleLeft className="mr-2 size-4" /> : <ToggleRight className="mr-2 size-4" />}
          {canToggle ? (user.status === "ACTIVE" ? "Disable Account" : "Enable Account") : "Current User"}
        </Button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: AdminAccountStatus }) {
  const variant =
    status === "ACTIVE"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : "border-amber-400/25 bg-amber-500/10 text-amber-100"

  return <Badge className={`border px-3 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-transparent ${variant}`}>{status}</Badge>
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      className={`border px-3 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-transparent ${
        verified
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
          : "border-zinc-400/20 bg-white/5 text-zinc-300"
      }`}
    >
      {verified ? "Verified" : "Unverified"}
    </Badge>
  )
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

function getInitials(name?: string | null) {
  if (!name) return "EM"

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function formatDateOnly(value?: string | null) {
  if (!value) return "-"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}