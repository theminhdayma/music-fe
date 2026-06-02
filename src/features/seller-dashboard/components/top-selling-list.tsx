import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SellerTopSellingMusic } from "@/features/seller-dashboard/types/seller-dashboard"
import { Music2, TrendingUp } from "lucide-react"
import Image from "next/image"

interface TopSellingListProps {
  items: SellerTopSellingMusic[]
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const toNumber = (value: number | string): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function TopSellingList({ items }: TopSellingListProps) {
  return (
    <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Top Selling Musics</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Chart Leaders</h2>
          </div>
          <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 p-2 text-fuchsia-200">
            <TrendingUp className="size-4" />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-12 text-center">
            <Music2 className="mx-auto size-6 text-zinc-500" />
            <p className="mt-3 text-sm text-zinc-400">No sales yet. Publish more tracks to climb the chart.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 3).map((item, index) => (
              <article
                key={`${item.musicId}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-400/25"
              >
                <Badge className="min-w-11 justify-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/15">
                  #{index + 1}
                </Badge>

                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
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

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.sales} sales</p>
                </div>

                <p className="text-sm font-semibold text-fuchsia-100">{moneyFormatter.format(toNumber(item.revenue))}</p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
