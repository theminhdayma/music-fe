"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAdminOrderManagement } from "@/features/admin-order-management/hooks/use-admin-order-management"
import { adminOrderManagementService } from "@/features/admin-order-management/services/admin-order-management-service"
import type {
    AdminOrderDetail,
    AdminOrderDetailItem,
    AdminOrderListItem,
    AdminOrderQuery,
    AdminOrderStatus,
    AdminPaymentStatus,
} from "@/features/admin-order-management/types/admin-order-management"
import { Navbar } from "@/features/home/components/navbar"
import { useAuthStore } from "@/store/auth-store"
import { motion } from "framer-motion"
import {
    AlertTriangle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Eye,
    Music2,
    ReceiptText,
    Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

const PAGE_SIZE = 5

type PaginationItem = number | "ellipsis"

export function AdminOrderManagementPageView({ initialQuery }: { initialQuery: AdminOrderQuery }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<AdminOrderDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      page: initialQuery.page,
    }),
    [initialQuery.page]
  )

  const { data, isLoading, isError, errorMessage, refetch } = useAdminOrderManagement(query)

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
    if (!viewOpen || !viewOrder?.id) return

    let isActive = true

    const loadDetail = async () => {
      setViewLoading(true)
      setViewError(null)

      try {
        const detail = await adminOrderManagementService.getOrder(viewOrder.id)
        if (!isActive) return
        setViewOrder(detail)
      } catch (error) {
        if (!isActive) return
        setViewError(error instanceof Error ? error.message : "Could not load order detail")
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
  }, [viewOpen, viewOrder?.id])

  const updateUrl = useCallback(
    (nextQuery: Partial<AdminOrderQuery>) => {
      const params = new URLSearchParams()
      const nextPage = nextQuery.page ?? query.page

      if (nextPage > 0) {
        params.set("page", String(nextPage))
      }

      const search = params.toString()
      router.push(search ? `${pathname}?${search}` : pathname)
    },
    [pathname, query.page, router]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page })
    },
    [updateUrl]
  )

  const handleOpenView = useCallback((order: AdminOrderListItem) => {
    setViewOrder(order as AdminOrderDetail)
    setViewError(null)
    setViewOpen(true)
  }, [])

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
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Order Management</h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Review platform orders, inspect purchase details, and keep the workflow lightweight with full information only in the detail drawer.
              </p>
            </div>
            <Button asChild className="h-11 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]">
              <Link href="/admin">
                <ArrowLeft className="mr-2 size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </motion.section>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState errorMessage={errorMessage} onRetry={() => void refetch()} />
        ) : pageData.length > 0 ? (
          <div className="space-y-5">
            <OrderTable items={pageData} onView={handleOpenView} />

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
          <EmptyState />
        )}
      </main>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="w-full border-white/10 bg-[#09070f] text-white sm:max-w-3xl">
          <SheetHeader className="border-b border-white/10 pb-4">
            <SheetTitle className="text-xl text-white">Order Detail</SheetTitle>
            <SheetDescription className="text-zinc-400">View the full order summary and purchase items.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-1 py-2">
            {viewLoading ? (
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="h-44 animate-pulse rounded-2xl bg-white/8" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/8" />
              </div>
            ) : null}

            {viewError ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{viewError}</p> : null}

{viewOrder && !viewLoading && 'items' in viewOrder ? (
  <OrderDetailCard order={viewOrder} />
) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function OrderTable({
  items,
  onView,
}: {
  items: AdminOrderListItem[]
  onView: (order: AdminOrderListItem) => void
}) {
  return (
    <Card className="overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03] text-left text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <tr>
                <th className="px-5 py-4">Order Code</th>
                <th className="px-5 py-4">Buyer Name</th>
                <th className="px-5 py-4">Total Amount</th>
                <th className="px-5 py-4">Order Status</th>
                <th className="px-5 py-4">Payment Status</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1">
                      <p className="max-w-[14rem] truncate text-sm font-semibold text-white" title={order.orderCode}>
                        {order.orderCode}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-zinc-300">
                    <p className="max-w-[16rem] truncate" title={order.buyerName}>
                      {order.buyerName}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-zinc-300">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4 align-top">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-zinc-300">{formatDateTime(order.createdAt)}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onView(order)}
                        className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
                      >
                        <Eye className="mr-2 size-4" />
                        View Order Detail
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

function OrderDetailCard({ order }: { order: AdminOrderDetail }) {
  return (
    <Card className="border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Order Code" value={order.orderCode} />
          <DetailField label="Buyer Name" value={order.buyerName} />
          <DetailField label="Total Amount" value={formatCurrency(order.totalAmount)} />
          <DetailField label="Order Status" value={<OrderStatusBadge status={order.orderStatus} />} />
          <DetailField label="Payment Method" value={order.paymentMethod} />
          <DetailField label="Payment Status" value={<PaymentStatusBadge status={order.paymentStatus} />} />
          <DetailField label="Created At" value={formatDateTime(order.createdAt)} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Purchased Items</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{order.items.length} item{order.items.length === 1 ? "" : "s"}</h3>
            </div>
            <ReceiptText className="size-5 text-fuchsia-200" />
          </div>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <OrderItemRow key={item.id ?? `${item.musicId}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderItemRow({ item }: { item: AdminOrderDetailItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        {item.thumbnailUrlAtPurchase ? (
          <Image
            src={item.thumbnailUrlAtPurchase}
            alt={item.musicTitleAtPurchase}
            fill
            unoptimized
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-fuchsia-200/70">
            <Music2 className="size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-semibold text-white" title={item.musicTitleAtPurchase}>
          {item.musicTitleAtPurchase}
        </p>
        <p className="truncate text-xs text-zinc-400" title={item.artistNameAtPurchase}>
          {item.artistNameAtPurchase}
        </p>
        <p className="text-xs text-zinc-500">Music ID: {item.musicId}</p>
      </div>

      <div className="shrink-0 text-sm font-medium text-zinc-100">{formatCurrency(item.priceAtPurchase)}</div>
    </div>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: string | number | React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <div className="mt-2 text-sm text-zinc-100">{value}</div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  const className =
    status === "PAID"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : "border-amber-400/25 bg-amber-500/10 text-amber-100"

  return <Badge className={`border px-2 py-1 text-[10px] uppercase tracking-[0.22em] hover:bg-transparent ${className}`}>{status}</Badge>
}

function PaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  const className =
    status === "SUCCESS"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : status === "FAILED"
        ? "border-rose-400/25 bg-rose-500/10 text-rose-100"
        : "border-amber-400/25 bg-amber-500/10 text-amber-100"

  return <Badge className={`border px-2 py-1 text-[10px] uppercase tracking-[0.22em] hover:bg-transparent ${className}`}>{status}</Badge>
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
          <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr_0.8fr_0.9fr_1fr] gap-4 border-b border-white/10 px-5 py-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-4 rounded-full bg-white/8" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr_0.8fr_0.9fr_1fr] gap-4 px-5 py-4">
              {Array.from({ length: 7 }).map((__, cellIndex) => (
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
      <h2 className="mt-3 text-xl font-semibold text-rose-100">Could not load orders</h2>
      <p className="mt-2 text-sm text-rose-200/90">{errorMessage ?? "Please try again."}</p>
      <Button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-rose-500/80 text-white hover:bg-rose-400">
        Retry
      </Button>
    </section>
  )
}

function EmptyState() {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
      <ReceiptText className="mx-auto size-6 text-fuchsia-200" />
      <h2 className="mt-3 text-xl font-semibold text-white">No orders found</h2>
      <p className="mt-2 text-sm text-zinc-400">Orders will appear here once buyers complete purchases.</p>
      <Button asChild variant="outline" className="mt-5 rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]">
        <Link href="/admin">
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Link>
      </Button>
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

function formatCurrency(value: number | string) {
  const numberValue = typeof value === "string" ? Number(value) : value

  if (Number.isNaN(numberValue)) {
    return String(value)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numberValue)
}
