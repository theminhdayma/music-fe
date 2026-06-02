import { RegisterForm } from "@/features/auth/components/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | Ecommerce Music",
  description: "Create a buyer or seller account for the music marketplace.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
