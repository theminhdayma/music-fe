"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
// Dialog UI removed — the app will use only the persistent player dock
// to avoid layout shifts caused by modal portals.
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { useMusicPlayerStore } from "@/store/music-player-store"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    ArrowRight,
    Pause,
    Play,
    Waves,
    X
} from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"

export function GlobalMusicPlayerShell() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewFadeRef = useRef<number | null>(null)
  const previewLockHandledRef = useRef(false)

  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const pathname = usePathname()

  const currentTrack = useMusicPlayerStore((state) => state.currentTrack)
  const queue = useMusicPlayerStore((state) => state.queue)
  const currentIndex = useMusicPlayerStore((state) => state.currentIndex)
  const isPlaying = useMusicPlayerStore((state) => state.isPlaying)
  const currentTime = useMusicPlayerStore((state) => state.currentTime)
  const duration = useMusicPlayerStore((state) => state.duration)
  const volume = useMusicPlayerStore((state) => state.volume)
  const owned = useMusicPlayerStore((state) => state.owned)
  const refreshOwnedTrackIds = useMusicPlayerStore((state) => state.refreshOwnedTrackIds)
  const togglePlay = useMusicPlayerStore((state) => state.togglePlay)
  const pause = useMusicPlayerStore((state) => state.pause)
  const nextTrack = useMusicPlayerStore((state) => state.nextTrack)
  const previousTrack = useMusicPlayerStore((state) => state.previousTrack)
  const setCurrentTime = useMusicPlayerStore((state) => state.setCurrentTime)
  const setDuration = useMusicPlayerStore((state) => state.setDuration)
  const setVolume = useMusicPlayerStore((state) => state.setVolume)
  const stopPlayback = useMusicPlayerStore((state) => state.stopPlayback)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    void refreshOwnedTrackIds()
  }, [isHydrated, pathname, refreshOwnedTrackIds, user?.id, user?.role])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio || !currentTrack?.audioUrl) {
      return
    }

    audio.pause()
    audio.src = currentTrack.audioUrl
    audio.load()

    if (currentTrack.owned) {
      previewLockHandledRef.current = false
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        pause()
      })
    }
  }, [currentTrack?.audioUrl, currentTrack?.musicId, currentTrack?.owned, pause])

  useEffect(() => {
    previewLockHandledRef.current = false
  }, [currentTrack?.musicId])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        pause()
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, pause])

  useEffect(() => {
    return () => {
      if (previewFadeRef.current !== null) {
        window.cancelAnimationFrame(previewFadeRef.current)
      }
    }
  }, [])

  const progressPercent = useMemo(() => {
    if (!duration) return 0
    return Math.min(100, (currentTime / duration) * 100)
  }, [currentTime, duration])

  const previewLimit = currentTrack?.owned ? currentTrack.durationSeconds ?? duration : currentTrack?.previewLimitSeconds ?? 90

  const handleTrackTimeUpdate = useCallback(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    setCurrentTime(audio.currentTime)

    if (!currentTrack?.owned && previewLimit && audio.currentTime >= previewLimit && !previewLockHandledRef.current) {
      previewLockHandledRef.current = true

      const startVolume = audio.volume
      const fadeDuration = 240
      const startTime = performance.now()

      const step = (timestamp: number) => {
        const progress = Math.min(1, (timestamp - startTime) / fadeDuration)
        audio.volume = Math.max(0, startVolume * (1 - progress))

        if (progress < 1) {
          previewFadeRef.current = window.requestAnimationFrame(step)
          return
        }

        audio.pause()
        audio.volume = volume
          setCurrentTime(previewLimit)
          pause()
          // Instead of opening a modal, show a toast so the user is informed
          // that preview has ended and can purchase to unlock the full track.
          toast("Preview ended — purchase to unlock full track")
      }

      previewFadeRef.current = window.requestAnimationFrame(step)
    }
  }, [currentTrack?.owned, pause, previewLimit, setCurrentTime, volume])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    setDuration(audio.duration)
  }, [setDuration])

  const handleEnded = useCallback(() => {
    if (queue.length > 1 && currentIndex < queue.length - 1) {
      nextTrack()
      return
    }

    pause()
  }, [currentIndex, nextTrack, pause, queue.length])

  const handleSeek = useCallback(
    (time: number) => {
      const audio = audioRef.current

      if (!audio || !currentTrack) {
        return
      }

      const maxTime = currentTrack.owned ? Math.max(audio.duration || duration || 0, currentTrack.durationSeconds || 0) : previewLimit
      const clampedTime = Math.min(Math.max(0, time), maxTime || time)

      audio.currentTime = clampedTime
      setCurrentTime(clampedTime)
    },
    [currentTrack, duration, previewLimit, setCurrentTime]
  )

  const handleMainPlayToggle = useCallback(() => {
    if (!currentTrack) {
      return
    }

    if (!currentTrack.owned && previewLimit && currentTime >= previewLimit) {
      toast("Preview ended — purchase to unlock full track")
      return
    }

    togglePlay()
  }, [currentTime, currentTrack, previewLimit, togglePlay])

  if (!currentTrack) {
    return <audio ref={audioRef} className="hidden" preload="metadata" />
  }

  return (
    <>
      <audio
        ref={audioRef}
        className="hidden"
        preload="metadata"
        onTimeUpdate={handleTrackTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <PlayerDock
        currentTrack={currentTrack}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        owned={owned}
        progressPercent={progressPercent}
        onPauseToggle={handleMainPlayToggle}
        onSeek={handleSeek}
        onNext={nextTrack}
        onPrevious={previousTrack}
        onStop={stopPlayback}
        onVolumeChange={(nextVolume) => setVolume(nextVolume)}
        volume={volume}
      />

      {/* Expanded player modal removed per user request. Keep the persistent
          PlayerDock only to avoid layout shifts. */}

      {/* Preview lock modal removed per request. A toast is shown when preview ends. */}
    </>
  )
}

function PlayerDock({
  currentTrack,
  currentTime,
  duration,
  isPlaying,
  owned,
  progressPercent,
  onPauseToggle,
  onSeek,
  onNext,
  onPrevious,
  onStop,
  onVolumeChange,
  volume,
}: {
  currentTrack: import("@/features/player/types").PlayerTrack
  currentTime: number
  duration: number
  isPlaying: boolean
  owned: boolean
  progressPercent: number
  onPauseToggle: () => void
  onSeek: (time: number) => void
  onNext: () => void
  onPrevious: () => void
  onStop: () => void
  onVolumeChange: (volume: number) => void
  volume: number
}) {
  const artist = currentTrack.sellerName ?? currentTrack.artistName
  const initials = getInitials(artist)
  const previewLimit = owned ? Math.max(duration || currentTrack.durationSeconds || 0, 1) : currentTrack.previewLimitSeconds ?? 90
  const progressFillPercent = owned
    ? Math.min(progressPercent, 100)
    : Math.min(progressPercent, ((currentTrack.previewLimitSeconds ?? 90) / Math.max(duration || currentTrack.durationSeconds || 1, 1)) * 100)
  const progressSeekValue = Math.min(currentTime, previewLimit)

  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4"
    >
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <motion.div
          whileHover={{ y: -3, scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className="group relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(12,9,22,0.82),rgba(6,5,10,0.92))] p-3 text-left shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-3xl sm:p-4"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(168,85,247,0.24),transparent_18%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.16),transparent_18%)] opacity-80" />
          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(168,85,247,0.18)] sm:size-16">
                {currentTrack.thumbnailUrl ? (
                  <Image src={currentTrack.thumbnailUrl} alt={currentTrack.title} fill unoptimized sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.48),transparent_30%),linear-gradient(160deg,#1b1028,#09060d_70%)] text-fuchsia-200">
                    <Waves className="size-6" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-white sm:text-base">{currentTrack.title}</p>
                  <Badge className={cn("border text-[10px] uppercase tracking-[0.22em]", owned ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" : "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100")}>{owned ? "Owned" : "Preview"}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                  <Avatar className="size-7 border border-white/10 bg-zinc-900/60">
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-[10px] font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{artist}</span>
                  <span className="hidden text-zinc-600 sm:inline">•</span>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 lg:px-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{owned ? formatTime(duration || currentTrack.durationSeconds || 0) : `${formatTime(currentTrack.previewLimitSeconds ?? 30)} preview`}</span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-300 shadow-[0_0_22px_rgba(168,85,247,0.3)]"
                  animate={{ width: `${progressFillPercent}%` }}
                  transition={{ duration: 0.18 }}
                />
                <motion.span
                  className="absolute top-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]"
                  animate={{ left: `${progressFillPercent}%` }}
                  transition={{ duration: 0.18 }}
                />
                <input
                  type="range"
                  min={0}
                  max={previewLimit}
                  step={0.1}
                  value={progressSeekValue}
                  aria-label="Seek track"
                  onChange={(event) => onSeek(Number(event.target.value))}
                  className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                />
              </div>
            </div>

            <div className="grid gap-3 lg:flex lg:items-center lg:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-400 lg:flex">
                <span>Vol</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => onVolumeChange(Number(event.target.value))}
                  onClick={(event) => event.stopPropagation()}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-fuchsia-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 lg:justify-end">
                <PlayerIconButton onClick={(event) => { event.stopPropagation(); onStop(); }} icon={X} label="Stop playback" />
                <PlayerIconButton onClick={(event) => { event.stopPropagation(); onPrevious(); }} icon={ArrowLeft} label="Previous" />
                <PlayerIconButton onClick={(event) => { event.stopPropagation(); onPauseToggle(); }} icon={isPlaying ? Pause : Play} label={isPlaying ? "Pause" : "Play"} active />
                <PlayerIconButton onClick={(event) => { event.stopPropagation(); onNext(); }} icon={ArrowRight} label="Next" />
              </div>
            </div>
          </div>

          <div className="relative mt-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-end gap-1">
                {Array.from({ length: 18 }).map((_, index) => (
                  <motion.span
                    key={index}
                    animate={isPlaying ? { scaleY: [0.55, 1, 0.72] } : { scaleY: 0.65 }}
                    transition={{ duration: 1 + index * 0.04, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="h-4 w-1 origin-bottom rounded-full bg-gradient-to-t from-fuchsia-400/80 via-violet-400/80 to-cyan-300/80"
                  />
                ))}
              </div>
              <span className="text-zinc-400">Hover glow states active</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-500">
              <span>{owned ? "Full playback unlocked" : "Preview locked to 90 seconds"}</span>
            </div>
          </div>

          <div className="mt-3 block lg:hidden">
            <input
              type="range"
              min={0}
              max={owned ? Math.max(duration || currentTrack.durationSeconds || 0, 1) : currentTrack.previewLimitSeconds ?? 90}
              step={0.1}
              value={Math.min(currentTime, owned ? duration || currentTrack.durationSeconds || currentTime : currentTrack.previewLimitSeconds ?? 90)}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onSeek(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-fuchsia-500"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function PlayerIconButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: import("lucide-react").LucideIcon
  label: string
  active?: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border transition duration-200",
        active
          ? "border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_12px_36px_rgba(168,85,247,0.34)] hover:brightness-110"
          : "border-white/10 bg-white/[0.04] text-zinc-100 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10"
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

function getInitials(name?: string | null) {
  if (!name) return "EM"

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00"
  }

  const safeSeconds = Math.floor(seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds % 60
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}