"use client"

import { Button } from "@/components/ui/button"
import { AUTH_ROUTES } from "@/constants/auth"
import { AuthCard } from "@/features/auth/components/auth-card"
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button"
import { AuthTextField } from "@/features/auth/components/auth-text-field"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
    registerSchema,
    type RegisterSchema,
} from "@/features/auth/schemas/auth-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter()
  const { register, toErrorMessage } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "BUYER",
    },
  })

  const fullName = useWatch({ control: form.control, name: "fullName" })
  const email = useWatch({ control: form.control, name: "email" })
  const password = useWatch({ control: form.control, name: "password" })
  const selectedRole = useWatch({ control: form.control, name: "role" })

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)

    try {
      const response = await register(values)
      toast.success("Verification code sent to your email")
      router.push(
        `${AUTH_ROUTES.verifyOtp}?email=${encodeURIComponent(response.email)}`
      )
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthCard
      title="Create account"
      description="Create a Neon Pulse account, verify your email, and step into the marketplace with a polished creator profile."
      footer={
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
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
          id="fullName"
          label="Full name"
          placeholder="Your full name"
          autoComplete="name"
          disabled={isSubmitting}
          value={fullName ?? ""}
          onChange={(value) => form.setValue("fullName", value, { shouldValidate: true })}
          error={form.formState.errors.fullName?.message}
          hint="Displayed across the marketplace"
        />

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
          hint="Used for verification and recovery"
        />

        <AuthTextField
          id="password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          disabled={isSubmitting}
          value={password ?? ""}
          onChange={(value) => form.setValue("password", value, { shouldValidate: true })}
          error={form.formState.errors.password?.message}
          hint="At least 8 characters"
        />

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm font-medium text-zinc-200">Role</p>
            <span className="text-xs text-zinc-500">You can update your profile later</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedRole === "BUYER" ? "default" : "outline"}
              aria-pressed={selectedRole === "BUYER"}
              className={
                selectedRole === "BUYER"
                  ? "h-12 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_24px_rgba(236,72,153,0.12)] hover:bg-fuchsia-500/20"
                  : "h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
              }
              disabled={isSubmitting}
              onClick={() => form.setValue("role", "BUYER", { shouldValidate: true })}
            >
              Buyer
            </Button>
            <Button
              type="button"
              variant={selectedRole === "SELLER" ? "default" : "outline"}
              aria-pressed={selectedRole === "SELLER"}
              className={
                selectedRole === "SELLER"
                  ? "h-12 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_24px_rgba(236,72,153,0.12)] hover:bg-fuchsia-500/20"
                  : "h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-fuchsia-400/30 hover:bg-white/[0.06]"
              }
              disabled={isSubmitting}
              onClick={() => form.setValue("role", "SELLER", { shouldValidate: true })}
            >
              Seller
            </Button>
          </div>
          {form.formState.errors.role?.message ? (
            <p className="text-sm text-rose-300" role="alert">
              {form.formState.errors.role.message}
            </p>
          ) : null}
        </div>

        <AuthSubmitButton
          label="Create account"
          loadingLabel="Creating account..."
          isLoading={isSubmitting}
        />
      </form>
    </AuthCard>
  )
}
