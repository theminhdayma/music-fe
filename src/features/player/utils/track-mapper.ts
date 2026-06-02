import type { HomeMusic } from "@/types/home"

import type { PlayerTrack } from "@/features/player/types"

export function toPlayerTrack(music: HomeMusic): PlayerTrack {
  return {
    musicId: music.id,
    slug: music.slug,
    title: music.title,
    artistName: music.artistName,
    sellerId: music.sellerId ?? null,
    sellerName: music.sellerName ?? null,
    thumbnailUrl: music.thumbnailUrl ?? null,
    audioUrl: music.audioUrl ?? null,
    durationSeconds: music.durationSeconds ?? null,
    price: music.price ?? null,
    previewLimitSeconds: 90,
  }
}