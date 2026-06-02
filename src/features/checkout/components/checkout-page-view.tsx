"use client"

import { api } from "@/api/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/features/home/components/navbar"
import { useAuthStore } from "@/store/auth-store"
import useCartStore from "@/store/cart-store"
import type { ApiResponse } from "@/types/home"
import { motion } from "framer-motion"
import { CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

interface CheckoutOrderResponse {
  id: number
  orderCode: string
  totalAmount: number
  orderStatus: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  itemsCount: number
}

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Could not complete purchase"
  }

  const response = (error as { response?: { data?: unknown } }).response
  const responseData = response?.data

  if (responseData && typeof responseData === "object" && "message" in responseData) {
    const message = (responseData as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  if ("message" in (error as { message?: unknown })) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  return "Could not complete purchase"
}

export function CheckoutPageView() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const loadCart = useCartStore((state) => state.loadCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const cartItems = useCartStore((state) => state.cartItems)
  const totalItems = useCartStore((state) => state.totalItems)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const isLoadingCart = useCartStore((state) => state.isLoading)

  const [isProcessing, setIsProcessing] = useState(false)

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
  }, [isHydrated, user, user?.id, user?.role, router, loadCart])

  const tax = useMemo(() => Number((totalPrice * 0.05).toFixed(2)), [totalPrice])
  const total = useMemo(() => Number((totalPrice + tax).toFixed(2)), [totalPrice, tax])

  const handleCompletePurchase = async () => {
    if (!totalItems || isProcessing) return
    setIsProcessing(true)

    try {
      const response = await api.post<ApiResponse<CheckoutOrderResponse>>("/buyer/orders/checkout")
      const order = response.data?.data
      clearCart()
      toast.success(order?.orderCode ? `Order ${order.orderCode} completed` : "Order completed")
      router.push(order?.orderCode ? `/checkout/success?orderCode=${encodeURIComponent(order.orderCode)}` : "/checkout/success")
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const empty = !isLoadingCart && totalItems === 0

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 space-y-3"
        >
          <Badge className="border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-fuchsia-200 hover:bg-fuchsia-500/10">
            Checkout
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Complete your secure purchase</h1>
          <p className="max-w-3xl text-zinc-400">
            Premium checkout inspired by Stitch composition: a calm billing layout, strong trust cues, and a sticky summary so buyers never lose context.
          </p>
        </motion.div>

        {empty ? (
          <Card className="border-dashed border-white/10 bg-white/[0.03]">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
              <Sparkles className="size-10 text-fuchsia-300" />
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="max-w-md text-sm text-zinc-400">Add tracks to cart before checking out.</p>
              <Button asChild className="h-11 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white">
                <Link href="/">Explore Music</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <section className="space-y-6">
              <Card className="border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
                <CardContent className="space-y-5 p-6">
                  <h2 className="text-xl font-semibold">Payment method</h2>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <PaymentChip label="Credit Card" active icon={<CreditCard className="size-4" />} />
                    <PaymentChip label="PayPal" icon={<CheckCircle2 className="size-4" />} />
                    <PaymentChip label="Crypto" icon={<Sparkles className="size-4" />} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Cardholder name" placeholder="Alex Creator" />
                    <Field label="Card number" placeholder="4242 4242 4242 4242" />
                    <Field label="Expiry" placeholder="MM/YY" />
                    <Field label="CVC" placeholder="123" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold">Billing details</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Email" placeholder={user?.email ?? "buyer@example.com"} />
                    <Field label="Country" placeholder="Vietnam" />
                    <Field label="City" placeholder="Ho Chi Minh City" />
                    <Field label="ZIP / Postal" placeholder="700000" />
                  </div>
                </CardContent>
              </Card>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <Card className="border-white/10 bg-[#0d0915]/70 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Order overview</p>
                    <h2 className="mt-2 text-2xl font-semibold">{totalItems} licensed track{totalItems === 1 ? "" : "s"}</h2>
                  </div>

                  <div className="space-y-2">
                    {cartItems.slice(0, 4).map((item) => (
                      <div key={item.cartItemId} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                        <span className="line-clamp-1 max-w-[70%] text-zinc-300">{item.title}</span>
                        <span className="text-zinc-100">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <SummaryRow label="Subtotal" value={formatCurrency(totalPrice)} />
                  <SummaryRow label="Tax (5%)" value={formatCurrency(tax)} />
                  <SummaryRow label="Total" value={formatCurrency(total)} highlight />

                  <Button
                    type="button"
                    onClick={handleCompletePurchase}
                    disabled={isProcessing || !totalItems}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_18px_50px_rgba(168,85,247,0.32)] transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Processing payment...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Lock className="size-4" />
                        Complete Purchase
                      </span>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    <TrustPill icon={<ShieldCheck className="size-3.5 text-fuchsia-300" />} label="PCI ready" />
                    <TrustPill icon={<Lock className="size-3.5 text-fuchsia-300" />} label="SSL secured" />
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <Input
        placeholder={placeholder}
        className="h-11 rounded-xl border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-fuchsia-500/40"
      />
    </label>
  )
}

function PaymentChip({
  label,
  icon,
  active = false,
}: {
  label: string
  icon: ReactNode
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
        active ? "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100" : "border-white/10 bg-black/20 text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={highlight ? "font-semibold text-white" : "text-zinc-200"}>{value}</span>
    </div>
  )
}

function TrustPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      {icon}
      {label}
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
