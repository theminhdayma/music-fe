import { CheckoutPageView } from "@/features/checkout/components/checkout-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Premium checkout flow for secure music licensing.",
}

export default function Page() {
  return <CheckoutPageView />
}
