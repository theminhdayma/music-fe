import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DollarSign } from "lucide-react"

interface RevenueCardProps {
  label: string
  value: string
  subtitle?: string
  className?: string
  tone?: "purple" | "blue"
}

export function RevenueCard({ label, value, subtitle, className, tone = "purple" }: RevenueCardProps) {
  const isBlue = tone === "blue"

  return (
    <Card
      className={cn(
        "overflow-hidden backdrop-blur-xl transition duration-300 hover:-translate-y-1",
        isBlue
          ? "border border-sky-400/25 bg-gradient-to-br from-sky-500/16 via-blue-500/12 to-indigo-500/10 shadow-[0_20px_60px_rgba(56,189,248,0.2)] hover:shadow-[0_26px_72px_rgba(59,130,246,0.3)]"
          : "border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 shadow-[0_20px_60px_rgba(168,85,247,0.18)] hover:shadow-[0_26px_72px_rgba(168,85,247,0.28)]",
        className
      )}
    >
      <CardContent className="relative p-5">
        <div className={cn(
          "absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl",
          isBlue ? "bg-sky-500/25" : "bg-fuchsia-500/25"
        )} />
        <div className="flex items-start justify-between">
          <div>
            <p className={cn(
              "text-xs uppercase tracking-[0.2em]",
              isBlue ? "text-sky-100/90" : "text-fuchsia-200/90"
            )}>{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            {subtitle ? <p className={cn("mt-1 text-xs", isBlue ? "text-sky-100/80" : "text-fuchsia-100/80")}>{subtitle}</p> : null}
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isBlue
              ? "border border-sky-300/30 bg-sky-500/15 text-sky-100"
              : "border border-fuchsia-300/30 bg-fuchsia-500/15 text-fuchsia-100"
          )}>
            <DollarSign className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
