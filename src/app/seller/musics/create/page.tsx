import { SellerMusicCreatePageView } from "@/features/seller-music-create/components/seller-music-create-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Music",
  description: "Create a new track and upload the media assets.",
}

export default function Page() {
  return <SellerMusicCreatePageView />
}
