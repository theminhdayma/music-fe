import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusSquare, Settings, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Upload Music",
    description: "Drop a new release with artwork and metadata.",
    href: "/seller/musics/create",
    icon: PlusSquare,
  },
  {
    title: "Manage Musics",
    description: "Edit tracks, pricing, and publish status.",
    href: "/seller/musics",
    icon: SlidersHorizontal,
  },
  {
    title: "Profile Settings",
    description: "Update your seller profile and brand info.",
    href: "/profile",
    icon: Settings,
  },
]

export function QuickActions() {
  return (
    <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Quick Actions</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Keep Shipping</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto justify-start rounded-2xl border-white/10 bg-black/25 p-4 text-left text-zinc-100 transition duration-300 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10"
            >
              <Link href={action.href}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200">
                  <action.icon className="size-4" />
                </span>
                <span className="ml-3 block">
                  <span className="block text-sm font-medium">{action.title}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{action.description}</span>
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
