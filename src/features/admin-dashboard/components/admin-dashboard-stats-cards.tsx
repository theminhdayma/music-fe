import { Card, CardContent } from "@/components/ui/card"
import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard"
import { DollarSign, Music2, ReceiptText, UserRoundCheck, UserRoundCog, Users } from "lucide-react"
import type { ReactNode } from "react"

interface AdminDashboardStatsCardsProps {
  stats: AdminDashboardStats
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

export function AdminDashboardStatsCards({ stats }: AdminDashboardStatsCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard label="Total Users" value={numberFormatter.format(stats.totalUsers)} icon={<Users className="size-4" />} tone="violet" />
      <MetricCard label="Total Buyers" value={numberFormatter.format(stats.totalBuyers)} icon={<UserRoundCheck className="size-4" />} tone="blue" />
      <MetricCard label="Total Sellers" value={numberFormatter.format(stats.totalSellers)} icon={<UserRoundCog className="size-4" />} tone="emerald" />
      <MetricCard label="Total Musics" value={numberFormatter.format(stats.totalMusics)} icon={<Music2 className="size-4" />} tone="slate" />
      <MetricCard label="Total Orders" value={numberFormatter.format(stats.totalOrders)} icon={<ReceiptText className="size-4" />} tone="amber" />
      <MetricCard label="Total Revenue" value={moneyFormatter.format(toNumber(stats.totalRevenue))} icon={<DollarSign className="size-4" />} tone="rose" />
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
  tone: "violet" | "blue" | "emerald" | "slate" | "amber" | "rose"
}) {
  const toneStyles = {
    violet: {
      card: "border-fuchsia-400/18 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 shadow-[0_20px_60px_rgba(168,85,247,0.18)] hover:shadow-[0_26px_72px_rgba(168,85,247,0.28)]",
      label: "text-fuchsia-100/80",
      iconWrap: "border-fuchsia-300/30 bg-fuchsia-500/15 text-fuchsia-100",
    },
    blue: {
      card: "border-sky-400/18 bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-indigo-500/10 shadow-[0_20px_60px_rgba(56,189,248,0.18)] hover:shadow-[0_26px_72px_rgba(59,130,246,0.28)]",
      label: "text-sky-100/80",
      iconWrap: "border-sky-300/30 bg-sky-500/15 text-sky-100",
    },
    emerald: {
      card: "border-emerald-400/18 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/10 shadow-[0_20px_60px_rgba(16,185,129,0.18)] hover:shadow-[0_26px_72px_rgba(16,185,129,0.28)]",
      label: "text-emerald-100/80",
      iconWrap: "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
    },
    slate: {
      card: "border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.24)] hover:shadow-[0_26px_72px_rgba(0,0,0,0.3)]",
      label: "text-zinc-300/80",
      iconWrap: "border-white/15 bg-white/8 text-zinc-100",
    },
    amber: {
      card: "border-amber-400/18 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/10 shadow-[0_20px_60px_rgba(245,158,11,0.18)] hover:shadow-[0_26px_72px_rgba(245,158,11,0.28)]",
      label: "text-amber-100/80",
      iconWrap: "border-amber-300/30 bg-amber-500/15 text-amber-100",
    },
    rose: {
      card: "border-rose-400/18 bg-gradient-to-br from-rose-500/15 via-fuchsia-500/10 to-violet-500/10 shadow-[0_20px_60px_rgba(244,63,94,0.18)] hover:shadow-[0_26px_72px_rgba(244,63,94,0.28)]",
      label: "text-rose-100/80",
      iconWrap: "border-rose-300/30 bg-rose-500/15 text-rose-100",
    },
  } as const

  const styles = toneStyles[tone]

  return (
    <Card className={`overflow-hidden border backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${styles.card}`}>
      <CardContent className="relative p-5">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-start justify-between gap-3">
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