import { LoginForm } from "@/features/auth/components/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Ecommerce Music",
  description: "Sign in to access your music marketplace account.",
}

export default function LoginPage() {
  return <LoginForm />
}
