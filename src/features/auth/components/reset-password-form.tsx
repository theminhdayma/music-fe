"use client"

import { AUTH_ROUTES } from "@/constants/auth"
import { AuthCard } from "@/features/auth/components/auth-card"
import { AuthOtpField } from "@/features/auth/components/auth-otp-field"
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button"
import { AuthTextField } from "@/features/auth/components/auth-text-field"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
    resetPasswordSchema,
    type ResetPasswordSchema,
} from "@/features/auth/schemas/auth-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const { resetPassword, toErrorMessage } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams])

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const email = useWatch({ control: form.control, name: "email" })
  const otp = useWatch({ control: form.control, name: "otp" })
  const newPassword = useWatch({ control: form.control, name: "newPassword" })
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword" })

  useEffect(() => {
    if (initialEmail) {
      form.setValue("email", initialEmail, { shouldValidate: true })
    }
  }, [form, initialEmail])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)

    try {
      await resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      })
      toast.success("Password reset successfully. Please login.")
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthCard
      title="Reset password"
      description="Use the OTP from your email and set a new password for your Neon Pulse account."
      footer={
        <p className="text-center text-sm text-zinc-400">
          Return to{" "}
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
          hint="Use the same address that received the OTP"
        />

        <AuthOtpField
          id="otp"
          label="OTP code"
          value={otp ?? ""}
          onChange={(value) => form.setValue("otp", value, { shouldValidate: true })}
          disabled={isSubmitting}
          error={form.formState.errors.otp?.message}
          hint="6 digits only"
        />

        <AuthTextField
          id="newPassword"
          label="New password"
          type="password"
          placeholder="Enter a new password"
          autoComplete="new-password"
          disabled={isSubmitting}
          value={newPassword ?? ""}
          onChange={(value) =>
            form.setValue("newPassword", value, { shouldValidate: true })
          }
          error={form.formState.errors.newPassword?.message}
          hint="Use a strong password"
        />

        <AuthTextField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          disabled={isSubmitting}
          value={confirmPassword ?? ""}
          onChange={(value) =>
            form.setValue("confirmPassword", value, { shouldValidate: true })
          }
          error={form.formState.errors.confirmPassword?.message}
          hint="Must match the new password"
        />

        <AuthSubmitButton
          label="Reset password"
          loadingLabel="Resetting..."
          isLoading={isSubmitting}
        />
      </form>
    </AuthCard>
  )
}
