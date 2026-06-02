"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/features/home/components/navbar"
import { useAuthStore } from "@/store/auth-store"
import useCartStore from "@/store/cart-store"
import type { CartItem } from "@/types/cart"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CreditCard, Loader2, Lock, Music2, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function CartPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const loadCart = useCartStore((state) => state.loadCart)
  const removeItem = useCartStore((state) => state.removeItem)
  const items = useCartStore((state) => state.cartItems)
  const totalItems = useCartStore((state) => state.totalItems)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const isLoading = useCartStore((state) => state.isLoading)

  useEffect(() => {
    if (!isHydrated) return

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== "BUYER") {
      router.replace("/")
      return
    }

    void loadCart()
  }, [isHydrated, user, user?.id, user?.role, loadCart, router])

  const handleRemove = async (item: CartItem) => {
    try {
      await removeItem(String(item.musicId))
      toast.success(`Removed ${item.title}`)
    } catch (error) {
      console.error(error)
      toast.error("Could not remove item")
    }
  }

  const formattedTotal = formatCurrency(totalPrice)
  const empty = !isLoading && items.length === 0

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <Badge className="border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-fuchsia-200 hover:bg-fuchsia-500/10">
              Premium cart
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your cart, tuned for fast checkout and clean license review.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Review the tracks you have saved, keep the lineup tight, and move through licensing with a calm, premium interface.
            </p>
          </div>

          <Card className="border-white/10 bg-white/[0.05] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-fuchsia-400/20">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cart summary</p>
                  <p className="mt-1 text-lg font-semibold text-white">{totalItems} item{totalItems === 1 ? "" : "s"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Estimated total</p>
                <p className="mt-2 text-3xl font-semibold text-white">{formattedTotal}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Standard license. Secure checkout flow can be connected next.
                </p>
              </div>

              <Button asChild className="h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.3)] transition duration-300 hover:brightness-110">
                <Link href="/">
                  <ArrowLeft className="mr-2 size-4" />
                  Continue browsing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <section className="space-y-4">
            {isLoading ? (
              <LoadingState />
            ) : empty ? (
              <EmptyCart />
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <CartLineItem key={item.cartItemId} item={item} index={index} onRemove={handleRemove} />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card className="border-white/10 bg-[#0d0915]/70 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Order details</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Ready for the next step</h2>
                </div>

                <div className="space-y-3 text-sm text-zinc-300">
                  <SummaryRow label="Items" value={`${totalItems}`} />
                  <SummaryRow label="Subtotal" value={formattedTotal} />
                  <SummaryRow label="License" value="Standard" />
                </div>

                <Button
                  asChild
                  disabled={empty}
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.3)] transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Link href="/checkout">
                    <CreditCard className="mr-2 size-4" />
                    Proceed to checkout
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <Lock className="size-3.5 text-fuchsia-300" />
                    SSL secured
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <ShieldCheck className="size-3.5 text-fuchsia-300" />
                    Buyer protection
                  </div>
                </div>

                <div className="rounded-2xl border border-fuchsia-500/15 bg-fuchsia-500/8 p-4 text-sm leading-6 text-zinc-300">
                  <p className="font-medium text-fuchsia-100">What happens next</p>
                  <p className="mt-2 text-zinc-400">
                    Continue to checkout to review payment details and complete your purchase flow.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}

function CartLineItem({
  item,
  index,
  onRemove,
}: {
  item: CartItem
  index: number
  onRemove: (item: CartItem) => Promise<void>
}) {
  const price = formatCurrency(item.price)
  const initials = getInitials(item.sellerName ?? item.artistName)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-md"
    >
      <div className="grid gap-0 md:grid-cols-[160px_1fr_auto]">
        <Link href={`/music/${item.slug}`} className="relative block h-44 md:h-full min-h-[11rem] overflow-hidden bg-black/30">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 160px"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full min-h-[11rem] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.45),transparent_28%),linear-gradient(160deg,#1b1028,#09060d_70%)]">
              <Music2 className="size-12 text-fuchsia-200/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        </Link>

        <div className="space-y-4 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className="border border-white/10 bg-white/[0.05] text-[10px] uppercase tracking-[0.24em] text-zinc-400 hover:bg-white/[0.05]">
                In cart
              </Badge>
              <Link href={`/music/${item.slug}`} className="block">
                <h3 className="text-xl font-semibold tracking-tight text-white transition hover:text-fuchsia-300">{item.title}</h3>
              </Link>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Avatar className="size-8 border border-white/10 bg-zinc-900">
                  <AvatarImage src={undefined} alt={item.sellerName ?? item.artistName} />
                  <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-xs font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span>{item.sellerName ?? item.artistName}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Price</p>
              <p className="mt-2 text-2xl font-semibold text-white">{price}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">License: Standard</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Music ID #{item.musicId}</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-white/10 p-5 md:flex-col md:items-stretch md:border-l md:border-t-0 md:p-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void onRemove(item)}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-zinc-200 transition duration-300 hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-100"
          >
            <Trash2 className="mr-2 size-4" />
            Remove
          </Button>
          <p className="text-right text-xs leading-5 text-zinc-500 md:text-left">
            Safe to remove anytime before checkout.
          </p>
        </div>
      </div>
    </motion.article>
  )
}

function EmptyCart() {
  return (
    <Card className="border-dashed border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-indigo-500/10 text-fuchsia-200">
          <ShoppingBag className="size-9" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-white">Your cart is empty</h2>
          <p className="text-sm leading-7 text-zinc-400">
            Add a track from the music detail view and it will appear here with the premium cart summary.
          </p>
        </div>
        <Button asChild className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.3)] transition duration-300 hover:brightness-110">
          <Link href="/">Browse music</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3 text-zinc-300">
          <Loader2 className="size-5 animate-spin text-fuchsia-300" />
          <p className="text-sm">Loading cart items...</p>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[1.4rem] border border-white/10 bg-white/[0.04]" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}

function formatCurrency(value?: number | string | null) {
  const num = typeof value === "string" ? Number(value) : value ?? 0
  const safe = Number.isFinite(num) ? Number(num) : 0
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(safe)
}

function getInitials(name?: string | null) {
  if (!name) return "EM"
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
