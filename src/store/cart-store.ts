import { api } from "@/api/api"
import type { CartItem, CartResponse } from "@/types/cart"
import { create } from "zustand"

function parseApiError(error: unknown) {
  const fallback = { status: undefined as number | undefined, message: "Unexpected cart error" }
  if (!error || typeof error !== "object") return fallback

  const maybeResponse = (error as { response?: { status?: number; data?: unknown }; message?: string }).response
  const status = maybeResponse?.status
  const data = maybeResponse?.data

  let message: string | undefined
  if (data && typeof data === "object" && "message" in data) {
    const value = (data as { message?: unknown }).message
    if (typeof value === "string") {
      message = value
    }
  }

  if (!message && "message" in (error as { message?: unknown })) {
    const value = (error as { message?: unknown }).message
    if (typeof value === "string") {
      message = value
    }
  }

  return {
    status,
    message: message ?? fallback.message,
  }
}

interface CartState {
  items: string[]
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  loadCart: () => Promise<void>
  addItem: (musicId: string) => Promise<void>
  removeItem: (musicId: string) => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartItems: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,

  loadCart: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get("/buyer/cart")
      // Backend wraps payload in ApiResponse: { success, message, data }
      const payload = res?.data?.data as CartResponse | undefined
      const cartItems = Array.isArray(payload?.items) ? payload!.items : []
      const ids = cartItems.map((item) => String(item.musicId))
      const totalItems = Number(payload?.totalItems ?? cartItems.length)
      const totalPrice = Number(payload?.totalPrice ?? 0)
      set({ items: ids, cartItems, totalItems, totalPrice })
      try {
        localStorage.setItem("cart_items", JSON.stringify(ids))
      } catch {}
    } catch (err) {
      // fallback to cached localStorage items when API fails
      try {
        const cached = localStorage.getItem("cart_items")
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed)) set({ items: parsed.map(String), totalItems: parsed.length })
        }
      } catch {}
      console.error("Failed to load cart", err)
    } finally {
      set({ isLoading: false })
    }
  },

  addItem: async (musicId: string) => {
    const prev = get().items
    if (prev.includes(musicId)) return
    // optimistic
    set({ items: [...prev, musicId], totalItems: get().totalItems + 1 })
    try {
      await api.post(`/buyer/cart/${musicId}`)
      void get().loadCart()
    } catch (err: unknown) {
      const { status, message } = parseApiError(err)
      if (status === 409) {
        // server says already in cart — ensure our local state reflects that
        const merged = prev.includes(musicId) ? prev : [...prev, musicId]
        set({ items: merged, totalItems: merged.length })
        try {
          localStorage.setItem("cart_items", JSON.stringify(merged))
        } catch {}
        throw new Error(`ALREADY_IN_CART: ${message}`)
      }
      // rollback
      set({ items: prev, totalItems: prev.length })
      throw new Error(`Add to cart failed${status ? ` (status ${status})` : ""}: ${message}`)
    }
  },

  removeItem: async (musicId: string) => {
    const prev = get().items
    const prevCartItems = get().cartItems
    if (!prev.includes(musicId)) return
    const next = prev.filter((id) => id !== musicId)
    const nextCartItems = prevCartItems.filter((item) => String(item.musicId) !== musicId)
    set({ items: next, cartItems: nextCartItems, totalItems: next.length })
    try {
      await api.delete(`/buyer/cart/${musicId}`)
      void get().loadCart()
    } catch (err: unknown) {
      set({ items: prev, cartItems: prevCartItems, totalItems: prev.length })
      const { status, message } = parseApiError(err)
      throw new Error(`Remove from cart failed${status ? ` (status ${status})` : ""}: ${message}`)
    }
  },

  clearCart: () => {
    set({ items: [], cartItems: [], totalItems: 0, totalPrice: 0 })
    try {
      localStorage.removeItem("cart_items")
    } catch {}
  },
}))

export default useCartStore
