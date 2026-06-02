import { Card, CardContent } from "@/components/ui/card"
import type { SellerRecentSale } from "@/features/seller-dashboard/types/seller-dashboard"
import { CalendarDays, Music2, ShoppingBag } from "lucide-react"
import Image from "next/image"

interface RecentSalesTableProps {
  items: SellerRecentSale[]
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const toNumber = (value: number | string): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function RecentSalesTable({ items }: RecentSalesTableProps) {
  return (
    <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Recent Sales</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Latest Purchases</h2>
          </div>
          <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 p-2 text-fuchsia-200">
            <ShoppingBag className="size-4" />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-12 text-center">
            <Music2 className="mx-auto size-6 text-zinc-500" />
            <p className="mt-3 text-sm text-zinc-400">No recent sales yet. Your next purchase will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={`${item.orderCode}-${item.musicId}-${item.purchasedAt}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition duration-300 hover:border-fuchsia-400/25 md:grid-cols-[1fr_auto]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.musicTitle}
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-500">
                        <Music2 className="size-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.musicTitle}</p>
                    <p className="truncate text-xs text-zinc-400">Buyer: {item.buyerName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">{item.orderCode}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
                  <p className="text-sm font-semibold text-fuchsia-100">{moneyFormatter.format(toNumber(item.amount))}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-zinc-400">
                    <CalendarDays className="size-3.5 text-fuchsia-300" />
                    {dateFormatter.format(new Date(item.purchasedAt))}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
