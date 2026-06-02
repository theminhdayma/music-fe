import { Button } from "@/components/ui/button"
import { getMusicBySlug } from "@/features/home/api/home-api"
import { Navbar } from "@/features/home/components/navbar"
import { MusicDetailPageView } from "@/features/music/components/music-detail-view"
import { AlertCircle, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getMusicBySlug(slug)

  if (!data) {
    return {
      title: "Track Not Found | Ecommerce Music",
      description: "The requested music track could not be found.",
    }
  }

  return {
    title: `${data.title} - Prod. ${data.artistName} | Premium Beats`,
    description: data.description || `Listen to and license "${data.title}" produced by ${data.artistName} in our premium music marketplace.`,
  }
}

export default async function MusicDetailPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getMusicBySlug(slug)

  if (!data) {
    return (
      <div className="min-h-screen bg-[#040307] text-white">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
            <AlertCircle className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Track Not Found</h1>
          <p className="mx-auto mt-3 max-w-md text-base text-zinc-400">
            We couldn&apos;t find the premium beat you&apos;re looking for. It might have been unlisted, hidden, or deleted.
          </p>
          <div className="mt-8">
            <Button asChild className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:brightness-110 text-white border-0 transition duration-300">
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Return to Marketplace
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return <MusicDetailPageView initialData={data} />
}
