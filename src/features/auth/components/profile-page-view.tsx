"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useProtectedRoute } from "@/features/auth/hooks/use-protected-route"
import { updateProfileSchema } from "@/features/auth/schemas/auth-schemas"
import { Navbar } from "@/features/home/components/navbar"
import { cn } from "@/lib/utils"
import type { UpdateProfilePayload } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPen,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

export function ProfilePageView() {
  const { isAuthenticated, isHydrated } = useProtectedRoute()
  const { user, refreshProfile, saveProfile, uploadProfileAvatar, updateProfileAvatar, logout, toErrorMessage } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(user?.avatarUrl ?? "")
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const avatarPreviewObjectUrlRef = useRef<string | null>(null)

  const form = useForm<z.input<typeof updateProfileSchema>, unknown, z.output<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      avatarUrl: user?.avatarUrl ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
      bio: user?.bio ?? "",
      dateOfBirth: user?.dateOfBirth ?? "",
    },
  })

  const fullName = useWatch({ control: form.control, name: "fullName" })
  const phoneNumber = useWatch({ control: form.control, name: "phoneNumber" })
  const address = useWatch({ control: form.control, name: "address" })
  const bio = useWatch({ control: form.control, name: "bio" })
  const dateOfBirth = useWatch({ control: form.control, name: "dateOfBirth" })
  const avatarUrl = useWatch({ control: form.control, name: "avatarUrl" })

  useEffect(() => {
    const loadProfile = async () => {
      if (!isHydrated || !isAuthenticated) {
        return
      }

      setIsLoadingProfile(true)
      setLoadError(null)

      try {
        const profile = await refreshProfile()
        form.reset({
          fullName: profile.fullName ?? "",
          avatarUrl: profile.avatarUrl ?? "",
          phoneNumber: profile.phoneNumber ?? "",
          address: profile.address ?? "",
          bio: profile.bio ?? "",
          dateOfBirth: profile.dateOfBirth ?? "",
        })
        setAvatarPreviewUrl(profile.avatarUrl ?? "")
      } catch (error) {
        const message = toErrorMessage(error)
        setLoadError(message)
        toast.error(message)

        form.reset({
          fullName: user?.fullName ?? "",
          avatarUrl: user?.avatarUrl ?? "",
          phoneNumber: user?.phoneNumber ?? "",
          address: user?.address ?? "",
          bio: user?.bio ?? "",
          dateOfBirth: user?.dateOfBirth ?? "",
        })
        setAvatarPreviewUrl(user?.avatarUrl ?? "")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    void loadProfile()
  }, [
    form,
    isAuthenticated,
    isHydrated,
    refreshProfile,
    toErrorMessage,
    user?.fullName,
    user?.avatarUrl,
    user?.phoneNumber,
    user?.address,
    user?.bio,
    user?.dateOfBirth,
  ])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)

    try {
      let avatarUrl = normalizeOptionalValue(values.avatarUrl)

      if (selectedAvatarFile) {
        const uploadedAvatarUrl = await uploadProfileAvatar(selectedAvatarFile)
        avatarUrl = uploadedAvatarUrl
        updateProfileAvatar(uploadedAvatarUrl)
      }

      const payload: UpdateProfilePayload = {
        fullName: values.fullName,
        avatarUrl,
        phoneNumber: normalizeOptionalValue(values.phoneNumber),
        address: normalizeOptionalValue(values.address),
        bio: normalizeOptionalValue(values.bio),
        dateOfBirth: normalizeOptionalValue(values.dateOfBirth),
      }

      const savedProfile = await saveProfile(payload)
      setSelectedAvatarFile(null)
      setAvatarPreviewUrl(savedProfile.avatarUrl ?? avatarUrl ?? "")
      form.reset({
        fullName: savedProfile.fullName ?? "",
        avatarUrl: savedProfile.avatarUrl ?? avatarUrl ?? "",
        phoneNumber: savedProfile.phoneNumber ?? "",
        address: savedProfile.address ?? "",
        bio: savedProfile.bio ?? "",
        dateOfBirth: savedProfile.dateOfBirth ?? "",
      })
      setLastSavedAt(new Date().toISOString())
      toast.success("Profile updated")
    } catch (error) {
      toast.error(toErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  })

  const onLogout = async () => {
    await logout()
  }

  const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }

    const maxAvatarSizeInBytes = 10 * 1024 * 1024
    if (file.size > maxAvatarSizeInBytes) {
      toast.error("Avatar image must be 10MB or smaller")
      return
    }

    if (avatarPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewObjectUrlRef.current)
    }

    const localPreviewUrl = URL.createObjectURL(file)
    avatarPreviewObjectUrlRef.current = localPreviewUrl
    setSelectedAvatarFile(file)
    setAvatarPreviewUrl(localPreviewUrl)
    form.setValue("avatarUrl", "", {
      shouldDirty: true,
      shouldValidate: true,
    })
    toast.success("Avatar preview ready")
  }

  useEffect(() => {
    return () => {
      if (avatarPreviewObjectUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewObjectUrlRef.current)
      }
    }
  }, [])

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#040307] text-white">
        <Navbar />
        <main className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <Card className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(165deg,rgba(18,10,30,0.94),rgba(8,8,18,0.86))] text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(236,72,153,0.15),transparent_26%),radial-gradient(circle_at_82%_0%,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.08),transparent_28%)]" />
            <CardContent className="relative py-14 text-center text-sm text-zinc-400">
              <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
                <Loader2 className="size-8 animate-spin text-fuchsia-300" />
                Preparing your session...
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative space-y-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <Badge className="border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-fuchsia-200 hover:bg-fuchsia-500/10">
                Profile Overview
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Your account, styled like a premium dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-400">
                Update your display name, review your verification status, and keep a clean view of the session details that power your Neon Pulse experience.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => void onLogout()}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-zinc-200 transition duration-300 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(165deg,rgba(18,10,30,0.94),rgba(8,8,18,0.88))] text-white shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(236,72,153,0.16),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(168,85,247,0.18),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.08),transparent_30%)]" />
              <CardHeader className="relative space-y-4 border-b border-white/5 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <Avatar className="size-12 border border-white/15 bg-zinc-950 transition duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)] sm:size-14">
                    <AvatarImage src={avatarPreviewUrl || undefined} alt={fullName || user?.fullName || user?.email || "Profile avatar"} />
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white font-semibold text-xs">
                      {getInitials(fullName || user?.fullName || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate text-2xl font-semibold text-white sm:text-3xl">
                      {fullName || user?.fullName || "Profile owner"}
                    </CardTitle>
                    <p className="truncate text-sm text-zinc-400">{user?.email ?? "Connected account"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="fuchsia" text={user?.role ?? "USER"} />
                  <StatusBadge tone="slate" text={user?.status ?? "ACTIVE"} />
                  <StatusBadge tone={user?.emailVerified ? "emerald" : "rose"} text={user?.emailVerified ? "Email verified" : "Email unverified"} />
                  {lastSavedAt ? <StatusBadge tone="violet" text={`Saved ${formatSavedTime(lastSavedAt)}`} /> : null}
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4 p-6 sm:p-8">
                <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Avatar</p>
                      <p className="mt-1 text-sm font-semibold text-white">Preview first, update later</p>
                    </div>
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                      selectedAvatarFile
                        ? "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100"
                        : avatarPreviewUrl
                          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                          : "border-white/10 bg-white/[0.04] text-zinc-300"
                    )}>
                      {selectedAvatarFile ? "Preview selected" : avatarPreviewUrl ? "Ready" : "No avatar"}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="size-16 border border-white/15 bg-zinc-950 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:size-20">
                      <AvatarImage src={avatarPreviewUrl || undefined} alt="Avatar preview" />
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white font-semibold text-xs">
                        {getInitials(fullName || user?.fullName || user?.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isSaving}
                          className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-zinc-200 transition duration-300 hover:border-fuchsia-400/30 hover:bg-white/[0.06] hover:text-fuchsia-100"
                        >
                          <Camera className="mr-2 size-4" />
                          {avatarPreviewUrl ? "Change avatar" : "Upload avatar"}
                        </Button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => void handleAvatarSelect(event)}
                        />
                        <p className="text-xs leading-6 text-zinc-500">PNG, JPG, or WEBP up to 10MB.</p>
                      </div>
                      {selectedAvatarFile ? (
                        <p className="text-sm text-fuchsia-200" role="status" aria-live="polite">
                          Preview only for now. It uploads when you press update.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <InfoTile
                  icon={Mail}
                  label="Email"
                  value={user?.email ?? "Unavailable"}
                  subtitle="Used for log in, verification, and recovery"
                />
                <InfoTile
                  icon={ShieldCheck}
                  label="Session security"
                  value="Protected"
                  subtitle="JWT session state stays inside the app shell"
                />
                <InfoTile
                  icon={BadgeCheck}
                  label="Profile status"
                  value={user?.emailVerified ? "Verified" : "Action needed"}
                  subtitle="Verification state follows your backend account"
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(165deg,rgba(18,10,30,0.94),rgba(8,8,18,0.88))] text-white shadow-[0_30px_90px_rgba(0,0,0,0.52)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(236,72,153,0.14),transparent_24%),radial-gradient(circle_at_80%_8%,rgba(168,85,247,0.15),transparent_24%)]" />
              <CardHeader className="relative space-y-3 border-b border-white/5 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-100">
                      <UserPen className="size-3.5" />
                      Edit Profile
                    </div>
                    <CardTitle className="mt-4 text-2xl font-semibold text-white">Refine your display name</CardTitle>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400 sm:flex">
                    <Sparkles className="size-3.5 text-fuchsia-300" />
                    {lastSavedAt ? `Updated ${formatSavedTime(lastSavedAt)}` : "Ready to save"}
                  </div>
                </div>
                <p className="text-sm leading-7 text-zinc-400">
                  Keep your public profile polished. Changes apply only to your display name and do not affect login credentials or backend rules.
                </p>
              </CardHeader>

              <CardContent className="relative p-6 sm:p-8">
                {isLoadingProfile ? (
                  <div className="space-y-5" role="status" aria-live="polite">
                    <LoadingField />
                    <LoadingField short />
                    <LoadingField short />
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400">
                      <Loader2 className="size-4 animate-spin text-fuchsia-300" />
                      Loading profile...
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-5" noValidate>
                    {loadError ? (
                      <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100" role="alert">
                        {loadError}
                      </div>
                    ) : null}

                    <ProfileField
                      id="email"
                      label="Email address"
                      value={user?.email ?? ""}
                      helper="This is read-only and tied to your account identity"
                      readOnly
                    />

                    <ProfileField
                      id="fullName"
                      label="Full name"
                      value={fullName ?? ""}
                      onChange={(event) =>
                        form.setValue("fullName", event.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={isSaving}
                      error={form.formState.errors.fullName?.message}
                      helper="Shown across your profile and marketplace touchpoints"
                    />

                    <ProfileField
                      id="phoneNumber"
                      label="Phone number"
                      value={phoneNumber ?? ""}
                      onChange={(event) =>
                        form.setValue("phoneNumber", event.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={isSaving}
                      error={form.formState.errors.phoneNumber?.message}
                      helper="Optional contact number"
                      icon={Phone}
                      placeholder="+84 912 345 678"
                    />

                    <ProfileField
                      id="dateOfBirth"
                      label="Date of birth"
                      value={dateOfBirth ?? ""}
                      onChange={(event) =>
                        form.setValue("dateOfBirth", event.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={isSaving}
                      error={form.formState.errors.dateOfBirth?.message}
                      helper="YYYY-MM-DD"
                      icon={CalendarDays}
                      type="date"
                    />

                    <ProfileField
                      id="address"
                      label="Address"
                      value={address ?? ""}
                      onChange={(event) =>
                        form.setValue("address", event.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={isSaving}
                      error={form.formState.errors.address?.message}
                      helper="Street, city, and country if you want it on file"
                      icon={MapPin}
                      multiline
                      rows={3}
                    />

                    <ProfileField
                      id="bio"
                      label="Bio"
                      value={bio ?? ""}
                      onChange={(event) =>
                        form.setValue("bio", event.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={isSaving}
                      error={form.formState.errors.bio?.message}
                      helper="A short personal note for your profile"
                      multiline
                      rows={4}
                    />

                    <input type="hidden" value={avatarUrl ?? ""} {...form.register("avatarUrl")} />

                    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <AuthSubmitButton
                        label="Save profile"
                        loadingLabel="Saving..."
                        isLoading={isSaving}
                      />
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function getInitials(value?: string | null) {
  if (!value) return "NP"

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function formatSavedTime(isoString: string) {
  const savedAt = new Date(isoString)
  const minutes = Math.max(0, Math.floor((Date.now() - savedAt.getTime()) / 60000))

  if (minutes < 1) return "just now"
  if (minutes === 1) return "1 min ago"
  if (minutes < 60) return `${minutes} mins ago`

  const hours = Math.floor(minutes / 60)
  if (hours === 1) return "1 hr ago"
  return `${hours} hrs ago`
}

function normalizeOptionalValue(value?: string | null) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function StatusBadge({ tone, text }: { tone: "fuchsia" | "slate" | "emerald" | "rose" | "violet"; text: string }) {
  const toneClasses: Record<typeof tone, string> = {
    fuchsia: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100",
    slate: "border-white/10 bg-white/[0.04] text-zinc-300",
    emerald: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-100",
    violet: "border-violet-400/25 bg-violet-500/10 text-violet-100",
  }

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]", toneClasses[tone])}>
      {text}
    </Badge>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: LucideIcon
  label: string
  value: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200 shadow-[0_0_24px_rgba(236,72,153,0.1)]">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</p>
        <p className="truncate text-sm font-semibold text-white">{value}</p>
        <p className="text-sm leading-6 text-zinc-400">{subtitle}</p>
      </div>
    </div>
  )
}

function ProfileField({
  id,
  label,
  value,
  onChange,
  disabled,
  helper,
  error,
  readOnly,
  placeholder,
  type = "text",
  icon: Icon,
  multiline = false,
  rows = 3,
}: {
  id: string
  label: string
  value: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  helper?: string
  error?: string
  readOnly?: boolean
  placeholder?: string
  type?: "text" | "email" | "tel" | "date"
  icon?: LucideIcon
  multiline?: boolean
  rows?: number
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-zinc-200">
          {Icon ? <Icon className="mr-2 inline-block size-4 align-[-0.15em] text-fuchsia-300" /> : null}
          {label}
        </label>
        {helper ? <span className="text-xs text-zinc-500">{helper}</span> : null}
      </div>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "min-h-28 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-50 shadow-inner shadow-black/20 placeholder:text-zinc-500 transition duration-200 focus-visible:border-fuchsia-400/60 focus-visible:ring-4 focus-visible:ring-fuchsia-500/20",
            readOnly && "text-zinc-300"
          )}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            type === "date" ? "[color-scheme:dark]" : "",
            "h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-50 shadow-inner shadow-black/20 placeholder:text-zinc-500 transition duration-200 focus-visible:border-fuchsia-400/60 focus-visible:ring-4 focus-visible:ring-fuchsia-500/20",
            readOnly && "text-zinc-300"
          )}
        />
      )}
      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function LoadingField({ short = false }: { short?: boolean }) {
  return (
    <div className="space-y-2.5">
      <div className="h-3.5 w-36 rounded-full bg-white/10" />
      <div className={cn("h-12 rounded-2xl bg-white/[0.05]", short && "w-3/4")} />
    </div>
  )
}
