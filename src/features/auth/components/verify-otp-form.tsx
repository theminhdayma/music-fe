"use client"

import { Button } from "@/components/ui/button"
import { AUTH_ROUTES } from "@/constants/auth"
import { AuthCard } from "@/features/auth/components/auth-card"
import { AuthOtpField } from "@/features/auth/components/auth-otp-field"
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button"
import { AuthTextField } from "@/features/auth/components/auth-text-field"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
    verifyOtpSchema,
    type VerifyOtpSchema,
} from "@/features/auth/schemas/auth-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

export function VerifyOtpForm() {
  const searchParams = useSearchParams()
  const { verifyEmail, resendVerification, toErrorMessage } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams])

  const form = useForm<VerifyOtpSchema>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
  })

  const email = useWatch({ control: form.control, name: "email" })
  const otp = useWatch({ control: form.control, name: "otp" })

  useEffect(() => {
    if (initialEmail) {
      form.setValue("email", initialEmail, { shouldValidate: true })
    }
  }, [form, initialEmail])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)

    try {
      await verifyEmail(values)
      toast.success("Email verified successfully")
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  })

  const onResend = async () => {
    const email = form.getValues("email")
    const valid = await form.trigger("email")

    if (!valid) {
      return
    }

    setIsResending(true)
    try {
      await resendVerification(email)
      toast.success("Verification code sent again")
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      description="Enter the six-digit code sent to your inbox to unlock your Neon Pulse account."
      footer={
        <p className="text-center text-sm text-zinc-400">
          Already verified?{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="font-medium text-fuchsia-200 transition-colors hover:text-fuchsia-100 hover:underline"
          >
            Sign in
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
          disabled={isSubmitting || isResending}
          value={email ?? ""}
          onChange={(value) => form.setValue("email", value, { shouldValidate: true })}
          error={form.formState.errors.email?.message}
          hint="We use this address to route the verification code"
        />

        <AuthOtpField
          id="otp"
          label="OTP code"
          value={otp ?? ""}
          onChange={(value) => form.setValue("otp", value, { shouldValidate: true })}
          disabled={isSubmitting}
          error={form.formState.errors.otp?.message}
          hint="Check spam if the code is missing"
        />

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-zinc-400">
          Enter the code exactly as it appears. If it expires, resend a fresh OTP.
        </div>

        <AuthSubmitButton
          label="Verify email"
          loadingLabel="Verifying..."
          isLoading={isSubmitting}
        />

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200 transition duration-200 hover:border-fuchsia-400/30 hover:bg-white/[0.06] hover:text-fuchsia-100"
          disabled={isResending || isSubmitting}
          onClick={() => void onResend()}
        >
          {isResending ? "Sending..." : "Resend OTP"}
        </Button>
      </form>
    </AuthCard>
  )
}
