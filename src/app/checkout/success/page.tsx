import { CheckoutSuccessPageView } from "@/features/checkout/components/checkout-success-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout Success",
  description: "Order completed successfully. Access your purchased music library.",
}

export default function Page() {
  return <CheckoutSuccessPageView />
}
