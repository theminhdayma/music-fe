"use client"

import { AUTH_ROUTES } from "@/constants/auth"
import { AuthCard } from "@/features/auth/components/auth-card"
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button"
import { AuthTextField } from "@/features/auth/components/auth-text-field"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
    forgotPasswordSchema,
    type ForgotPasswordSchema,
} from "@/features/auth/schemas/auth-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const router = useRouter()
  const { forgotPassword, toErrorMessage } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const email = useWatch({ control: form.control, name: "email" })

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)

    try {
      await forgotPassword(values)
      toast.success("Reset code sent to your email")
      router.push(`${AUTH_ROUTES.resetPassword}?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthCard
      title="Forgot password"
      description="Request a secure reset code and recover access to your Neon Pulse account."
      footer={
        <p className="text-center text-sm text-zinc-400">
          Back to{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="font-medium text-fuchsia-200 transition-colors hover:text-fuchsia-100 hover:underline"
          >
            login
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthTextField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          value={email ?? ""}
          onChange={(value) => form.setValue("email", value, { shouldValidate: true })}
          error={form.formState.errors.email?.message}
          hint="We’ll send the reset OTP here"
        />

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-zinc-400">
          This code helps protect your account. Use the same email you used to sign up.
        </div>

        <AuthSubmitButton
          label="Send reset code"
          loadingLabel="Sending..."
          isLoading={isSubmitting}
        />
      </form>
    </AuthCard>
  )
}
