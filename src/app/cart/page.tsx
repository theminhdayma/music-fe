import { CartPage } from "@/features/cart/components/cart-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review tracks in your premium cart and manage your selected licenses.",
}

export default function Page() {
  return <CartPage />
}
