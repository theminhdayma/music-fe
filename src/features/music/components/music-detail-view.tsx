"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/features/home/components/navbar"
import { toPlayerTrack } from "@/features/player/utils/track-mapper"
import { useAuthStore } from "@/store/auth-store"
import useCartStore from "@/store/cart-store"
import { useMusicPlayerStore } from "@/store/music-player-store"
import type { HomeMusic } from "@/types/home"
import { motion } from "framer-motion"
import {
    Activity,
    Calendar,
    Check,
    ChevronDown,
    Clock,
    FileAudio,
    Globe2,
    Music,
    Play,
    Shield,
    Sparkles,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface MusicDetailPageViewProps {
  initialData: HomeMusic
}

export function MusicDetailPageView({ initialData }: MusicDetailPageViewProps) {
  const [imageError, setImageError] = useState(false)
  const playTrack = useMusicPlayerStore((state) => state.playTrack)
  const ownedTrackIds = useMusicPlayerStore((state) => state.ownedTrackIds)
  const user = useAuthStore((state) => state.user)
  const isSellerOwnTrack = user?.role === "SELLER" && initialData.sellerId != null && initialData.sellerId === user.id
  const isBuyerOwnedTrack = ownedTrackIds.includes(initialData.id)
  const initials = getInitials(initialData.sellerName ?? "Producer")

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      {/* Reusable shared Navbar */}
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Dynamic Glowing Background Effect */}
        <div className="absolute top-20 left-1/4 -z-10 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-fuchsia-500/5 blur-3xl" />

        {/* 2-Column Responsive Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          
          {/* Left Column: Hero Cover & Specs & Details */}
          <div className="space-y-10">
            
            {/* Core Track Info + Image Block */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Artwork Card with Fallbacks and Glowing Accents */}
              <div className="relative size-64 md:size-80 shrink-0 mx-auto md:mx-0">
                {/* Backlighting Neon Glow */}
                <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-indigo-500 opacity-30 blur-lg transition duration-500 group-hover:opacity-40" />
                
                <Card className="relative overflow-hidden border border-white/10 bg-[#0d0915]/80 size-64 md:size-80 rounded-[1.85rem] shadow-2xl flex items-center justify-center">
                  {!imageError && initialData.thumbnailUrl ? (
                    <Image
                      src={initialData.thumbnailUrl}
                      alt={initialData.title}
                      fill
                      unoptimized
                      priority
                      className="object-cover transition duration-500 hover:scale-105"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-500">
                      <Music className="size-16 text-fuchsia-400" />
                      <span className="text-xs uppercase tracking-widest text-zinc-500">Premium Audio</span>
                    </div>
                  )}
                  {/* Subtle glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </Card>
              </div>

              {/* Text Metadata & Big Play Controls */}
              <div className="flex-1 w-full space-y-4 text-center md:text-left pt-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                  <Sparkles className="size-3.5" />
                  Premium Release
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight font-sora">
                  {initialData.title}
                </h1>

                <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                  <Avatar className="size-8 border border-white/15 bg-zinc-900">
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base text-zinc-300 font-medium">
                    {initialData.sellerName ?? initialData.artistName}
                  </span>
                  <Badge className="bg-white/5 hover:bg-white/5 text-zinc-400 border border-white/10 uppercase tracking-widest text-[9px] px-2 py-0.5">
                    Producer
                  </Badge>
                </div>

                {/* Micro Metadata Chips */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-3">
                  {initialData.genreName && (
                    <Badge className="bg-fuchsia-500/15 hover:bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/20 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Globe2 className="size-3.5" />
                      {initialData.genreName}
                    </Badge>
                  )}
                  <Badge className="bg-white/5 hover:bg-white/5 text-zinc-300 border border-white/10 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Activity className="size-3.5 text-fuchsia-400" />
                    120 BPM
                  </Badge>
                  {initialData.durationSeconds && (
                    <Badge className="bg-white/5 hover:bg-white/5 text-zinc-300 border border-white/10 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Clock className="size-3.5 text-fuchsia-400" />
                      {formatDuration(initialData.durationSeconds)}
                    </Badge>
                  )}
                  {initialData.createdAt && (
                    <Badge className="bg-white/5 hover:bg-white/5 text-zinc-300 border border-white/10 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-fuchsia-400" />
                      {formatDate(initialData.createdAt)}
                    </Badge>
                  )}
                </div>

                {/* Big Action Preview Button */}
                <div className="pt-6 flex justify-center md:justify-start">
                  <motion.button
                    onClick={() => playTrack(toPlayerTrack(initialData), { owned: isSellerOwnTrack || isBuyerOwnedTrack })}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-6 text-sm font-semibold text-fuchsia-300 transition duration-300 hover:bg-fuchsia-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:border-fuchsia-400/40"
                  >
                    <Play className="mr-2 size-4 fill-current text-fuchsia-400 animate-pulse" />
                    {isSellerOwnTrack || isBuyerOwnedTrack ? "Play Full Track" : "Play Track Preview"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Description Card section */}
            <Card className="border border-white/10 bg-[#0d0915]/45 backdrop-blur-md rounded-[1.85rem] overflow-hidden shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h3 className="text-lg font-semibold text-white tracking-tight">Description / Editorial Notes</h3>
                <p className="text-sm leading-7 text-zinc-400 font-normal">
                  {initialData.description ||
                    "This premium high-fidelity track has been carefully polished and mixed by a professional sound designer. Fully configured with dynamic soundscapes, clean spacing, and modern transitions ready for immediate integration into premium video, cinematic, or vocal projects."}
                </p>
              </CardContent>
            </Card>

            {/* Technical Information Details Card */}
            <Card className="border border-white/10 bg-[#0d0915]/45 backdrop-blur-md rounded-[1.85rem] overflow-hidden shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h3 className="text-lg font-semibold text-white tracking-tight">Technical Specs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                  <SpecInfo label="Tempo" value="120 BPM" />
                  <SpecInfo label="Key / Scale" value="C Minor (Mocked)" />
                  <SpecInfo label="Release Format" value="HQ WAV + MP3" />
                  <SpecInfo label="License Coverage" value="100% Royalty Free" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sticky Pricing & licensing panel */}
          <div className="h-fit lg:sticky lg:top-24">
            <MusicPurchasePanel price={initialData.price} musicId={String(initialData.id)} isBuyerOwnedTrack={isBuyerOwnedTrack} />
          </div>

        </div>
      </main>
    </div>
  )
}

function SpecInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  )
}

// Subcomponent: Sticky Purchase panel
interface LicenseOption {
  id: string
  name: string
  priceOffset: number
  format: string
  perks: string[]
}

function MusicPurchasePanel({ price, musicId, isBuyerOwnedTrack }: { price?: number | string | null; musicId: string; isBuyerOwnedTrack: boolean }) {
  const basePrice = getNumericPrice(price)
  const [selectedLicense, setSelectedLicense] = useState<string>("lease")
  const [expandedPerks, setExpandedPerks] = useState(false)

  const licenses: LicenseOption[] = [
    {
      id: "lease",
      name: "Standard MP3 Lease",
      priceOffset: 0,
      format: "High-Quality MP3",
      perks: [
        "Use for 1 commercial project",
        "Up to 10,000 online audio streams",
        "Non-exclusive license agreement",
        "Instant secure download"
      ]
    },
    {
      id: "premium",
      name: "Premium WAV License",
      priceOffset: 20,
      format: "Lossless WAV + MP3",
      perks: [
        "Use for unlimited commercial projects",
        "Up to 500,000 online audio streams",
        "Non-exclusive license agreement",
        "HQ WAV stems + tracking included"
      ]
    }
  ]

  const currentOption = licenses.find((l) => l.id === selectedLicense) || licenses[0]
  const finalPrice = basePrice + currentOption.priceOffset

  return (
    <Card className="border border-white/10 bg-[#0d0915]/65 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background glow flare */}
      <div className="absolute top-0 right-0 -z-10 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-2xl" />

      <div className="space-y-1">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">License Purchase</span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-sora">
          ${finalPrice.toFixed(2)}
        </h2>
      </div>

      {/* License Option Selector Buttons */}
      <div className="grid gap-3 pt-2">
        {licenses.map((lic) => (
          <button
            key={lic.id}
            type="button"
            onClick={() => setSelectedLicense(lic.id)}
            className={`relative flex items-center justify-between rounded-2xl border p-4 text-left transition duration-200 focus:outline-hidden ${
              selectedLicense === lic.id
                ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{lic.name}</p>
              <p className="text-xs text-zinc-400 mt-1">{lic.format}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-200">
                +${lic.priceOffset.toFixed(0)}
              </span>
              <div className={`flex size-5 items-center justify-center rounded-full border transition duration-200 ${
                selectedLicense === lic.id ? "border-fuchsia-400 bg-fuchsia-500 text-white" : "border-white/20"
              }`}>
                {selectedLicense === lic.id && <Check className="size-3 stroke-[3]" />}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Expandable License Details Section */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        <button
          type="button"
          onClick={() => setExpandedPerks(!expandedPerks)}
          className="flex w-full items-center justify-between text-xs uppercase tracking-widest text-zinc-400 font-semibold hover:text-white transition duration-200"
        >
          <span>What&apos;s included</span>
          <ChevronDown className={`size-4 transition duration-300 ${expandedPerks ? "rotate-180 text-fuchsia-400" : ""}`} />
        </button>

        {expandedPerks && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 pt-2"
          >
            {currentOption.perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                <Check className="size-4 text-fuchsia-400 shrink-0 mt-0.5" />
                <span>{perk}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Primary Glowing Add to Cart button (extensible) */}
      <div className="pt-2">
        <AddToCartButton musicId={musicId} isBuyerOwnedTrack={isBuyerOwnedTrack} />
      </div>

      {/* Secure Transactions Guarantee Footers */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-2">
        <Shield className="size-3.5 text-fuchsia-400" />
        <span>Instant Delivery • 100% Royalty Free Secure Payment</span>
      </div>
    </Card>
  )
}

function getNumericPrice(price?: number | string | null): number {
  if (price === null || price === undefined || price === "") return 19.99
  const num = typeof price === "string" ? Number(price) : price
  return Number.isFinite(num) ? num : 19.99
}

function formatDuration(durationSeconds?: number | null) {
  if (!durationSeconds || durationSeconds <= 0) return "Preview"
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Just released"
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  } catch {
    return dateStr
  }
}

function getInitials(name?: string | null) {
  if (!name) return "EM"
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function AddToCartButton({ musicId, isBuyerOwnedTrack }: { musicId: string; isBuyerOwnedTrack: boolean }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)

  const [isAdding, setIsAdding] = useState(false)
  const [success, setSuccess] = useState(false)

  const already = items.includes(musicId) || isBuyerOwnedTrack

  async function handleAdd() {
    if (!isHydrated) return
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role === "SELLER") {
      toast.error("Sellers cannot add to cart")
      return
    }
    if (already) {
      toast("Already in cart")
      return
    }

    setIsAdding(true)
    try {
      await addItem(musicId)
      setSuccess(true)
      toast.success("Added to cart")
      setTimeout(() => setSuccess(false), 1200)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.startsWith("ALREADY_IN_CART") || /already in cart/i.test(msg) || /status 409/.test(msg)) {
        toast("Already in cart")
      } else {
        console.error(err)
        toast.error("Could not add to cart. Try again.")
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.button
      whileHover={{ y: already ? 0 : -2, scale: already ? 1 : 1.02 }}
      whileTap={{ y: 0 }}
      type="button"
      onClick={handleAdd}
      disabled={isAdding || already}
      className={`w-full h-13 rounded-2xl text-sm font-semibold text-white transition duration-300 border-0 flex items-center justify-center gap-2 ${
        already
          ? "bg-white/6 text-zinc-300 border border-white/8 cursor-default"
          : "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_12px_40px_rgba(168,85,247,0.3)] hover:brightness-110"
      }`}
    >
      <FileAudio className="size-4" />
      {isAdding ? (
        <span className="flex items-center gap-2">Adding...</span>
      ) : success ? (
        <span className="flex items-center gap-2">
          <Check className="size-4 text-emerald-300" /> Added
        </span>
      ) : isBuyerOwnedTrack ? (
        <span>Already Purchased</span>
      ) : already ? (
        <span>Already Added</span>
      ) : (
        <span>Add To Cart</span>
      )}
    </motion.button>
  )
}
