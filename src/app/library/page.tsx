import { LibraryPageView } from "@/features/library/components/library-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Library",
  description: "Access purchased tracks and download signed files securely.",
}

export default function Page() {
  return <LibraryPageView />
}
