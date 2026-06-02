"use client"

import { AUTH_ROUTES } from "@/constants/auth"
import { AuthCard } from "@/features/auth/components/auth-card"
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button"
import { AuthTextField } from "@/features/auth/components/auth-text-field"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/auth-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

export function LoginForm() {
  const { login, toErrorMessage } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const email = useWatch({ control: form.control, name: "email" })
  const password = useWatch({ control: form.control, name: "password" })

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)

    try {
      await login(values)
      toast.success("Welcome back")
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your premium Neon Pulse workspace and continue managing purchases, uploads, and account settings."
      footer={
        <p className="text-center text-sm text-zinc-400">
          New here?{" "}
          <Link
            href={AUTH_ROUTES.register}
            className="font-medium text-fuchsia-200 transition-colors hover:text-fuchsia-100 hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthTextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          value={email ?? ""}
          onChange={(value) => form.setValue("email", value, { shouldValidate: true })}
          error={form.formState.errors.email?.message}
          hint="Use the email tied to your account"
        />

        <AuthTextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          value={password ?? ""}
          onChange={(value) => form.setValue("password", value, { shouldValidate: true })}
          error={form.formState.errors.password?.message}
          hint="Private and secure"
        />

        <div className="flex justify-end pt-1">
          <Link
            href={AUTH_ROUTES.forgotPassword}
            className="text-sm font-medium text-zinc-300 transition-colors hover:text-fuchsia-200 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <AuthSubmitButton
          label="Sign in"
          loadingLabel="Signing in..."
          isLoading={isSubmitting}
        />
      </form>
    </AuthCard>
  )
}
