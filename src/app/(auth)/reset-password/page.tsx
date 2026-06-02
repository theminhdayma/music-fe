import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reset Password | Ecommerce Music",
  description: "Reset your password using OTP verification.",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
