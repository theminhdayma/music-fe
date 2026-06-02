"use client"

import { motion } from "framer-motion"
import {
    BadgeCheck,
    LockKeyhole,
    type LucideIcon,
    ShieldCheck,
    Sparkles,
} from "lucide-react"
import { ReactNode } from "react"

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="dark relative min-h-screen overflow-hidden bg-[#04020a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(236,72,153,0.22),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(168,85,247,0.26),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(79,70,229,0.22),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl motion-safe:animate-pulse" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl motion-safe:animate-pulse" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-10">
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative hidden overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(165deg,rgba(14,10,24,0.9),rgba(6,8,14,0.8))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:block"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(168,85,247,0.2),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-100 shadow-[0_0_30px_rgba(236,72,153,0.14)]">
                <Sparkles className="size-3.5" />
                Neon Pulse Music
              </div>

              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">Premium access</p>
                <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white xl:text-6xl">
                  A luxury login surface for creators, buyers, and sellers.
                </h1>
                <p className="max-w-lg text-base leading-8 text-zinc-400">
                  Sign in, verify, recover, and manage your profile inside the same polished neon workspace used across the homepage, library, checkout, and music detail views.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <FeatureCard
                icon={ShieldCheck}
                title="Secure sessions"
                description="Clear validation states, calm error handling, and an interface that keeps sensitive actions easy to read."
              />
              <FeatureCard
                icon={BadgeCheck}
                title="Verified access"
                description="OTP verification and password recovery share the same premium rhythm and responsive layout."
              />
              <FeatureCard
                icon={LockKeyhole}
                title="Profile control"
                description="Review your identity, update your account name, and keep a clean view of session state."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Dark luxury" value="Neon" />
              <MiniStat label="Glow accents" value="Purple / pink" />
              <MiniStat label="UX polish" value="Responsive" />
            </div>
          </div>
        </motion.aside>

        <div className="relative flex w-full justify-center lg:justify-end">{children}</div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200 shadow-[0_0_24px_rgba(236,72,153,0.1)]">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-md">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  )
}
