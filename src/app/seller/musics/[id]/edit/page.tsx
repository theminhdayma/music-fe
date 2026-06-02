import { SellerMusicEditPageView } from "@/features/seller-music-edit/components/seller-music-edit-page-view"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Music",
  description: "Update an existing track and its media assets.",
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const musicId = Number(id)

  if (!Number.isFinite(musicId) || musicId <= 0) {
    notFound()
  }

  return <SellerMusicEditPageView musicId={musicId} />
}