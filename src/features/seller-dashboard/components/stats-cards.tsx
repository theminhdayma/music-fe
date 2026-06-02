import { Card, CardContent } from "@/components/ui/card"
import { RevenueCard } from "@/features/seller-dashboard/components/revenue-card"
import type { SellerDashboardStats, SellerRevenueStats } from "@/features/seller-dashboard/types/seller-dashboard"
import { Disc3, FileClock, Music2 } from "lucide-react"
import type { ReactNode } from "react"

interface StatsCardsProps {
  stats: SellerDashboardStats
  revenue: SellerRevenueStats
}

const numberFormatter = new Intl.NumberFormat("en-US")
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const toNumber = (value: number | string): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function StatsCards({ stats, revenue }: StatsCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <RevenueCard
        label="Total Revenue"
        value={moneyFormatter.format(toNumber(revenue.totalRevenue))}
        tone="purple"
      />
      <RevenueCard
        label="Total Sales"
        value={numberFormatter.format(revenue.totalSales)}
        subtitle="Successful paid orders"
        tone="blue"
      />
      <RevenueCard
        label="Average Sale Price"
        value={moneyFormatter.format(toNumber(revenue.averageSalePrice))}
        subtitle="Per successful purchase"
        tone="purple"
      />
      <MetricCard
        label="Total Musics"
        value={numberFormatter.format(stats.totalMusics)}
        icon={<Music2 className="size-4" />}
        tone="default"
      />
      <MetricCard
        label="Published"
        value={numberFormatter.format(stats.publishedMusics)}
        icon={<Disc3 className="size-4" />}
        tone="green"
      />
      <MetricCard
        label="Draft"
        value={numberFormatter.format(stats.draftMusics)}
        icon={<FileClock className="size-4" />}
        tone="amber"
      />
    </section>
  )
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string
  icon: ReactNode
  tone: "default" | "green" | "amber"
}) {
  const toneStyles = {
    default: {
      card: "border-white/10 bg-white/[0.04] shadow-[0_16px_50px_rgba(0,0,0,0.24)] hover:border-white/15 hover:shadow-[0_20px_56px_rgba(0,0,0,0.28)]",
      label: "text-zinc-500",
      iconWrap: "border-fuchsia-400/12 bg-fuchsia-500/6 text-fuchsia-200/70",
    },
    green: {
      card: "border-emerald-400/10 bg-white/[0.04] shadow-[0_16px_50px_rgba(0,0,0,0.24)] hover:border-emerald-300/18 hover:shadow-[0_20px_56px_rgba(0,0,0,0.28)]",
      label: "text-zinc-500",
      iconWrap: "border-emerald-300/12 bg-emerald-500/6 text-emerald-200/75",
    },
    amber: {
      card: "border-amber-400/10 bg-white/[0.04] shadow-[0_16px_50px_rgba(0,0,0,0.24)] hover:border-amber-300/18 hover:shadow-[0_20px_56px_rgba(0,0,0,0.28)]",
      label: "text-zinc-500",
      iconWrap: "border-amber-300/12 bg-amber-500/6 text-amber-200/75",
    },
  } as const

  const styles = toneStyles[tone]

  return (
    <Card className={`border backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${styles.card}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs uppercase tracking-[0.2em] ${styles.label}`}>{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${styles.iconWrap}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
