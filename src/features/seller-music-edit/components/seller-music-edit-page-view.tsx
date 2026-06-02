"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/features/home/components/navbar"
import { useSellerMusicCreate } from "@/features/seller-music-create/hooks/use-seller-music-create"
import { sellerMusicManagementService } from "@/features/seller-music-management/services/seller-music-management-service"
import type { SellerMusicDetail, SellerMusicStatus, SellerMusicUpdatePayload } from "@/features/seller-music-management/types/seller-music-management"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CloudUpload,
    Disc3,
    ImageIcon,
    Loader2,
    Music2,
    Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_SIZE_BYTES = 200 * 1024 * 1024
const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/flac", "audio/x-flac"]

const sellerMusicEditSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  artistName: z.string().trim().min(1, "Artist name is required").max(120, "Artist name is too long"),
  genreId: z.string().trim().min(1, "Genre is required"),
  description: z.string().trim().max(2000, "Description is too long").optional().or(z.literal("")),
  price: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]),
})

type SellerMusicEditSchema = z.infer<typeof sellerMusicEditSchema>

interface SellerMusicEditPageViewProps {
  musicId: number
}

export function SellerMusicEditPageView({ musicId }: SellerMusicEditPageViewProps) {
  const router = useRouter()
  const { genres, isLoadingGenres, genresError, refetchGenres } = useSellerMusicCreate()
  const [isLoadingMusic, setIsLoadingMusic] = useState(true)
  const [isLoadingError, setIsLoadingError] = useState(false)
  const [loadingErrorMessage, setLoadingErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingMusic, setExistingMusic] = useState<SellerMusicDetail | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [hasFileChanges, setHasFileChanges] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null)
  const audioInputRef = useRef<HTMLInputElement | null>(null)
  const thumbnailObjectUrlRef = useRef<string | null>(null)
  const thumbnailFileRef = useRef<File | null>(null)
  const audioFileRef = useRef<File | null>(null)
  const audioDurationRef = useRef<number | null>(null)

  const form = useForm<SellerMusicEditSchema>({
    resolver: zodResolver(sellerMusicEditSchema),
    defaultValues: {
      title: "",
      artistName: "",
      genreId: "",
      description: "",
      price: "",
      status: "DRAFT",
    },
  })

  const title = useWatch({ control: form.control, name: "title" })
  const artistName = useWatch({ control: form.control, name: "artistName" })
  const genreId = useWatch({ control: form.control, name: "genreId" })
  const description = useWatch({ control: form.control, name: "description" })
  const price = useWatch({ control: form.control, name: "price" })
  const status = useWatch({ control: form.control, name: "status" })

  const selectedGenre = useMemo(() => genres.find((item) => String(item.id) === genreId), [genreId, genres])
  const hasUnsavedChanges = form.formState.isDirty || hasFileChanges

  const loadMusic = useCallback(async () => {
    setIsLoadingMusic(true)
    setIsLoadingError(false)
    setLoadingErrorMessage(null)

    try {
      const music = await sellerMusicManagementService.getMusic(musicId)
      setExistingMusic(music)

      form.reset({
        title: music.title ?? "",
        artistName: music.artistName ?? "",
        genreId: music.genreId ? String(music.genreId) : "",
        description: music.description ?? "",
        price: music.price === null || music.price === undefined ? "" : String(music.price),
        status: music.status,
      })
      setThumbnailPreviewUrl(music.thumbnailUrl ?? null)
      setThumbnailFileName(music.thumbnailUrl ? "Current thumbnail" : null)
      setAudioFileName(music.audioUrl ? "Current audio file" : null)
      setAudioDuration(music.durationSeconds ?? null)
      audioDurationRef.current = music.durationSeconds ?? null
      thumbnailFileRef.current = null
      audioFileRef.current = null
      setHasFileChanges(false)
      if (thumbnailObjectUrlRef.current) {
        URL.revokeObjectURL(thumbnailObjectUrlRef.current)
        thumbnailObjectUrlRef.current = null
      }
    } catch (error) {
      setIsLoadingError(true)
      setLoadingErrorMessage(error instanceof Error ? error.message : "Could not load music")
    } finally {
      setIsLoadingMusic(false)
    }
  }, [form, musicId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMusic()
  }, [loadMusic])

  useEffect(() => {
    return () => {
      if (thumbnailObjectUrlRef.current) {
        URL.revokeObjectURL(thumbnailObjectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [hasUnsavedChanges])

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    setThumbnailError(null)
    if (!file) return

    if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
      setThumbnailError("Thumbnail must be JPG, PNG, or WebP")
      toast.error("Thumbnail must be JPG, PNG, or WebP")
      return
    }

    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
      setThumbnailError("Thumbnail must be 5MB or smaller")
      toast.error("Thumbnail must be 5MB or smaller")
      return
    }

    thumbnailFileRef.current = file
    setHasFileChanges(true)

    if (thumbnailObjectUrlRef.current) {
      URL.revokeObjectURL(thumbnailObjectUrlRef.current)
    }

    const previewUrl = URL.createObjectURL(file)
    thumbnailObjectUrlRef.current = previewUrl
    setThumbnailPreviewUrl(previewUrl)
    setThumbnailFileName(file.name)
  }

  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    setAudioError(null)
    if (!file) return

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      setAudioError("Audio must be MP3, WAV, or FLAC")
      toast.error("Audio must be MP3, WAV, or FLAC")
      return
    }

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setAudioError("Audio file must be 200MB or smaller")
      toast.error("Audio file must be 200MB or smaller")
      return
    }

    const audioUrl = URL.createObjectURL(file)
    const audio = new Audio(audioUrl)

    audio.addEventListener("loadedmetadata", () => {
      audioFileRef.current = file
      audioDurationRef.current = Math.round(audio.duration)
      setAudioDuration(Math.round(audio.duration))
      setAudioFileName(file.name)
      setHasFileChanges(true)
      URL.revokeObjectURL(audioUrl)
    })

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(audioUrl)
      setAudioError("Could not read audio file")
      toast.error("Could not read audio file")
    })
  }

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm("Discard unsaved changes?")) {
      return
    }

    router.replace("/seller/musics")
  }, [hasUnsavedChanges, router])

  const handleSubmit = useCallback(async (values: SellerMusicEditSchema) => {
    if (!existingMusic) return

    setIsSubmitting(true)

    try {
      await sellerMusicManagementService.updateMusic(musicId, {
        title: values.title.trim(),
        artistName: values.artistName.trim(),
        genreId: Number(values.genreId),
        description: values.description?.trim() || undefined,
        price: values.price?.trim() || undefined,
        status: values.status as SellerMusicStatus,
        durationSeconds: audioDurationRef.current ?? existingMusic.durationSeconds ?? undefined,
        thumbnailFile: thumbnailFileRef.current,
        audioFile: audioFileRef.current,
      } satisfies SellerMusicUpdatePayload)
      toast.success("Music updated successfully")
      router.replace("/seller/musics")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update music")
    } finally {
      setIsSubmitting(false)
    }
  }, [existingMusic, musicId, router])

  // eslint-disable-next-line react-hooks/refs
  const onSubmit = form.handleSubmit(handleSubmit)

  if (isLoadingMusic) {
    return <EditMusicLoadingState />
  }

  if (isLoadingError) {
    return <EditMusicErrorState errorMessage={loadingErrorMessage} onRetry={() => void loadMusic()} />
  }

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <Badge className="border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-fuchsia-100 hover:bg-fuchsia-500/10">
              <Sparkles className="mr-1 size-3" />
              Seller Studio
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Edit Music</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
              Update your release metadata, preview assets, and publishing status.
            </p>
          </div>

          <Button asChild variant="outline" className="hidden rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06] sm:inline-flex">
            <Link href="/seller/musics">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
        </motion.section>

        {hasUnsavedChanges ? (
          <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            You have unsaved changes.
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <CardContent className="space-y-6 p-5 sm:p-6">
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="title"
                    label="Title"
                    placeholder="Street Anthem"
                    value={title}
                    onChange={(value) => form.setValue("title", value, { shouldValidate: true, shouldDirty: true })}
                    error={form.formState.errors.title?.message}
                  />
                  <Field
                    id="artistName"
                    label="Artist Name"
                    placeholder="John Doe"
                    value={artistName}
                    onChange={(value) => form.setValue("artistName", value, { shouldValidate: true, shouldDirty: true })}
                    error={form.formState.errors.artistName?.message}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <label htmlFor="genreId" className="text-sm font-medium text-zinc-200">Genre</label>
                    <select
                      id="genreId"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-zinc-50 shadow-inner shadow-black/20 outline-none transition duration-200 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/20"
                      value={genreId}
                      disabled={isLoadingGenres || isSubmitting}
                      onChange={(event) => form.setValue("genreId", event.target.value, { shouldValidate: true, shouldDirty: true })}
                    >
                      <option value="" disabled>
                        {isLoadingGenres ? "Loading genres..." : "Select genre"}
                      </option>
                      {genres.map((item) => (
                        <option key={item.id} value={item.id} className="bg-[#0d0915] text-white">
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.genreId?.message ? <ErrorText>{form.formState.errors.genreId.message}</ErrorText> : null}
                    {genresError ? (
                      <button type="button" onClick={() => void refetchGenres()} className="text-xs text-fuchsia-200 hover:text-fuchsia-100">
                        Retry genre loading
                      </button>
                    ) : null}
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="status" className="text-sm font-medium text-zinc-200">Status</label>
                    <select
                      id="status"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-zinc-50 shadow-inner shadow-black/20 outline-none transition duration-200 focus:border-fuchsia-400/60 focus:ring-4 focus:ring-fuchsia-500/20"
                      value={status}
                      disabled={isSubmitting}
                      onChange={(event) => form.setValue("status", event.target.value as SellerMusicStatus, { shouldValidate: true, shouldDirty: true })}
                    >
                      <option value="DRAFT" className="bg-[#0d0915] text-white">Draft</option>
                      <option value="PUBLISHED" className="bg-[#0d0915] text-white">Published</option>
                      <option value="HIDDEN" className="bg-[#0d0915] text-white">Hidden</option>
                    </select>
                    <p className="text-xs text-zinc-500">Hidden items stay out of public listings.</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label htmlFor="description" className="text-sm font-medium text-zinc-200">Description</label>
                  <Textarea
                    id="description"
                    value={description ?? ""}
                    placeholder="Describe the mood, use case, or production notes"
                    className="min-h-32 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-50 shadow-inner shadow-black/20 placeholder:text-zinc-500 focus-visible:border-fuchsia-400/60 focus-visible:ring-4 focus-visible:ring-fuchsia-500/20"
                    disabled={isSubmitting}
                    onChange={(event) => form.setValue("description", event.target.value, { shouldValidate: true, shouldDirty: true })}
                  />
                  {form.formState.errors.description?.message ? <ErrorText>{form.formState.errors.description.message}</ErrorText> : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="price"
                    label="Price"
                    type="number"
                    placeholder="19.99"
                    value={price}
                    onChange={(value) => form.setValue("price", value, { shouldValidate: true, shouldDirty: true })}
                    error={form.formState.errors.price?.message}
                    hint="Leave empty to keep the current value"
                  />
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-zinc-200">Audio Upload</label>
                    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-3 transition duration-200 hover:border-fuchsia-400/30 hover:bg-white/[0.05]">
                      <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/flac,audio/x-flac" className="hidden" disabled={isSubmitting} onChange={handleAudioChange} />
                      <span className="inline-flex items-center gap-2 text-sm text-zinc-300">
                        <Music2 className="size-4 text-fuchsia-300" />
                        {audioFileName ?? "Keep current audio file"}
                      </span>
                      <span className="text-xs text-zinc-500">MP3 / WAV / FLAC</span>
                    </label>
                    {audioError ? <ErrorText>{audioError}</ErrorText> : null}
                    {audioDuration !== null ? (
                      <p className="text-xs text-zinc-400">
                        Duration: {Math.floor(audioDuration / 60)}:{String(audioDuration % 60).padStart(2, "0")}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-zinc-200">Thumbnail Upload</label>
                  <label className="flex cursor-pointer flex-col gap-4 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-4 transition duration-200 hover:border-fuchsia-400/30 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <input ref={thumbnailInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={isSubmitting} onChange={handleThumbnailChange} />
                      <span className="inline-flex items-center gap-2 text-sm text-zinc-300">
                        <CloudUpload className="size-4 text-fuchsia-300" />
                        {thumbnailFileName ?? "Keep current thumbnail"}
                      </span>
                      <p className="text-xs text-zinc-500">JPG, PNG, WebP up to 5MB</p>
                    </div>

                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      {thumbnailPreviewUrl ? (
                        <Image src={thumbnailPreviewUrl} alt="Thumbnail preview" fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-500">
                          <ImageIcon className="size-6" />
                        </div>
                      )}
                    </div>
                  </label>
                  {thumbnailError ? <ErrorText>{thumbnailError}</ErrorText> : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !hasUnsavedChanges}
                    className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white transition duration-300 hover:brightness-110 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(168,85,247,0.18)] backdrop-blur-xl">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-fuchsia-100">
                  <Disc3 className="size-4" />
                  <span className="text-xs uppercase tracking-[0.24em]">Preview</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">{title || existingMusic?.title || "Untitled track"}</h2>
                  <p className="text-sm text-zinc-300">{artistName || existingMusic?.artistName || "Artist name"}</p>
                  {selectedGenre ? <Badge className="border border-white/10 bg-black/25 text-zinc-200">{selectedGenre.name}</Badge> : null}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-zinc-400">
                  {description || existingMusic?.description || "Your track description will appear here as you type, giving the release page a polished editorial feel."}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-medium text-fuchsia-100">{status}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-zinc-500">Price</span>
                  <span className="font-medium text-white">{price ? `$${price}` : "$0.00"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardContent className="space-y-3 p-5 text-sm text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-200">
                  <AlertTriangle className="size-4 text-amber-300" />
                  Edit checklist
                </div>
                <ul className="space-y-2 leading-7">
                  <li>Keep the release title clear and searchable.</li>
                  <li>Replace thumbnail or audio only when you need a new asset.</li>
                  <li>Published releases stay visible immediately after saving.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function EditMusicLoadingState() {
  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="space-y-5">
          <div className="h-14 w-56 animate-pulse rounded-2xl bg-white/8" />
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-[780px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.04]" />
            <div className="h-[520px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.04]" />
          </div>
        </div>
      </main>
    </div>
  )
}

function EditMusicErrorState({ errorMessage, onRetry }: { errorMessage: string | null; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-rose-400/20 bg-rose-500/8 p-8 text-center backdrop-blur-xl">
          <AlertTriangle className="mx-auto size-6 text-rose-300" />
          <h2 className="mt-3 text-xl font-semibold text-rose-100">Could not load music</h2>
          <p className="mt-2 text-sm text-rose-200/90">{errorMessage ?? "Please try again."}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" onClick={onRetry} className="rounded-xl bg-rose-500/80 text-white hover:bg-rose-400">
              Retry
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/[0.06]">
              <Link href="/seller/musics">Back to Music Management</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  hint,
}: {
  id: string
  label: string
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  type?: "text" | "number"
  error?: string
  hint?: string
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-zinc-200">
          {label}
        </label>
        {hint ? <span id={hintId} className="text-xs text-zinc-500">{hint}</span> : null}
      </div>
      <Input
        id={id}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-50 shadow-inner shadow-black/20 placeholder:text-zinc-500 focus-visible:border-fuchsia-400/60 focus-visible:ring-4 focus-visible:ring-fuchsia-500/20"
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  )
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-rose-300" role="alert">
      {children}
    </p>
  )
}