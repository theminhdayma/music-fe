import { create } from "zustand"

import { api } from "@/api/api"
import type { PlayerTrack } from "@/features/player/types"
import { useAuthStore } from "@/store/auth-store"
import type { ApiResponse, PageResponse } from "@/types/home"
import type { LibraryItem } from "@/types/library"

interface MusicPlayerState {
  currentTrack: PlayerTrack | null
  queue: PlayerTrack[]
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  owned: boolean
  ownedTrackIds: number[]
  isExpanded: boolean
  isPreviewLocked: boolean
  setOwnedTrackIds: (trackIds: number[]) => void
  refreshOwnedTrackIds: () => Promise<void>
  playTrack: (track: PlayerTrack, options?: { queue?: PlayerTrack[]; owned?: boolean; openExpanded?: boolean }) => void
  togglePlay: () => void
  pause: () => void
  nextTrack: () => void
  previousTrack: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  openExpanded: () => void
  closeExpanded: () => void
  openPreviewLock: () => void
  closePreviewLock: () => void
  stopPlayback: () => void
}

function clampVolume(value: number) {
  if (Number.isNaN(value)) return 0.8
  return Math.min(1, Math.max(0, value))
}

function resolveOwnedTrackIds(trackIds: number[]) {
  return Array.from(new Set(trackIds.filter((trackId) => Number.isFinite(trackId))))
}

function getResolvedTrack(track: PlayerTrack, ownedTrackIds: number[]): PlayerTrack {
  const currentUser = useAuthStore.getState().user
  const isSellerOwnTrack = currentUser?.role === "SELLER" && track.sellerId != null && track.sellerId === currentUser.id
  const owned = track.owned ?? (ownedTrackIds.includes(track.musicId) || isSellerOwnTrack)

  return {
    ...track,
    owned,
    previewLimitSeconds: owned ? null : track.previewLimitSeconds ?? 90,
  }
}

function getTrackFromQueue(queue: PlayerTrack[], index: number, ownedTrackIds: number[]): PlayerTrack | null {
  const track = queue[index]

  if (!track) {
    return null
  }

  return getResolvedTrack(track, ownedTrackIds)
}

export const useMusicPlayerStore = create<MusicPlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.82,
  owned: false,
  ownedTrackIds: [],
  isExpanded: false,
  isPreviewLocked: false,

  setOwnedTrackIds: (trackIds) =>
    set((state) => {
      const ownedTrackIds = resolveOwnedTrackIds(trackIds)
      const currentTrack = state.currentTrack ? getResolvedTrack(state.currentTrack, ownedTrackIds) : null

      return {
        ownedTrackIds,
        currentTrack,
        owned: currentTrack?.owned ?? false,
      }
    }),

  refreshOwnedTrackIds: async () => {
    const currentUser = useAuthStore.getState().user

    if (!currentUser || currentUser.role !== "BUYER") {
      set({ ownedTrackIds: [], owned: false })
      return
    }

    try {
      const response = await api.get<ApiResponse<PageResponse<LibraryItem>>>("/buyer/library")
      const content = response.data?.data?.content ?? []
      get().setOwnedTrackIds(content.map((item) => item.musicId))
    } catch {
      set({ ownedTrackIds: [], owned: false })
    }
  },

  playTrack: (track, options) => {
    const ownedTrackIds = get().ownedTrackIds
    const queue = options?.queue?.length ? options.queue : [track]
    const currentIndex = Math.max(
      0,
      queue.findIndex((item) => item.musicId === track.musicId)
    )
    const queueTrack = getTrackFromQueue(queue, currentIndex >= 0 ? currentIndex : 0, ownedTrackIds) ?? getResolvedTrack(track, ownedTrackIds)
    const resolvedTrack = options?.owned !== undefined ? { ...queueTrack, owned: options.owned, previewLimitSeconds: options.owned ? null : queueTrack.previewLimitSeconds ?? 90 } : queueTrack

    set({
      currentTrack: resolvedTrack,
      queue,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
      isPlaying: true,
      currentTime: 0,
      duration: resolvedTrack.durationSeconds ?? 0,
      owned: resolvedTrack.owned ?? false,
      // Only open the expanded player when explicitly requested. This
      // prevents route pages (like the music detail) from being squeezed
      // when a preview play button is pressed.
      isExpanded: options?.openExpanded ?? false,
      isPreviewLocked: false,
    })
  },

  togglePlay: () =>
    set((state) => ({
      isPlaying: state.currentTrack ? !state.isPlaying : false,
    })),

  pause: () => set({ isPlaying: false }),

  nextTrack: () =>
    set((state) => {
      if (!state.queue.length) return state

      const nextIndex = (state.currentIndex + 1) % state.queue.length
      const nextTrack = getTrackFromQueue(state.queue, nextIndex, state.ownedTrackIds)

      if (!nextTrack) return state

      return {
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        currentTime: 0,
        duration: nextTrack.durationSeconds ?? 0,
        owned: nextTrack.owned ?? false,
        isPlaying: true,
        isPreviewLocked: false,
      }
    }),

  previousTrack: () =>
    set((state) => {
      if (!state.queue.length) return state

      const previousIndex = (state.currentIndex - 1 + state.queue.length) % state.queue.length
      const previousTrack = getTrackFromQueue(state.queue, previousIndex, state.ownedTrackIds)

      if (!previousTrack) return state

      return {
        currentTrack: previousTrack,
        currentIndex: previousIndex,
        currentTime: 0,
        duration: previousTrack.durationSeconds ?? 0,
        owned: previousTrack.owned ?? false,
        isPlaying: true,
        isPreviewLocked: false,
      }
    }),

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),

  setDuration: (duration) => set({ duration: Math.max(0, duration) }),

  setVolume: (volume) => set({ volume: clampVolume(volume) }),

  openExpanded: () => set({ isExpanded: true }),

  closeExpanded: () => set({ isExpanded: false }),

  openPreviewLock: () => set({ isPreviewLocked: true, isPlaying: false }),

  closePreviewLock: () => set({ isPreviewLocked: false }),

  stopPlayback: () =>
    set({
      currentTrack: null,
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      owned: false,
      isExpanded: false,
      isPreviewLocked: false,
    }),
}))