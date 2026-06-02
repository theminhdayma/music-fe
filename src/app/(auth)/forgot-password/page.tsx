import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password | Ecommerce Music",
  description: "Request a password reset code for your account.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
