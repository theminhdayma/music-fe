import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ReactNode } from "react"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="relative w-full max-w-xl overflow-hidden border border-white/10 bg-[linear-gradient(165deg,rgba(18,10,30,0.94),rgba(8,8,18,0.86))] shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_36px_100px_rgba(88,28,135,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(236,72,153,0.15),transparent_26%),radial-gradient(circle_at_82%_0%,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
      <CardHeader className="relative space-y-4 border-b border-white/5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex w-fit items-center rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-100 shadow-[0_0_24px_rgba(236,72,153,0.12)]">
            Neon Pulse Music
          </div>
          <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            Secure access
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight text-white">{title}</CardTitle>
          <CardDescription className="text-sm leading-7 text-zinc-300">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-5 p-6 sm:p-8">{children}</CardContent>
      {footer ? <div className="relative border-t border-white/5 px-6 pb-6 pt-4 sm:px-8">{footer}</div> : null}
    </Card>
  )
}
