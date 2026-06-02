import { ProfilePageView } from "@/features/auth/components/profile-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Ecommerce Music",
  description: "View and update your account profile.",
}

export default function ProfilePage() {
  return <ProfilePageView />
}
