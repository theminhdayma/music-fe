import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Verify Email | Ecommerce Music",
  description: "Verify your email with the one-time code sent to your inbox.",
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
