import { Button } from "@/components/ui/button"
import { Navbar } from "@/features/home/components/navbar"
import Link from "next/link"

export default function SellerUploadMusicPage() {
  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Upload Flow</p>
          <h1 className="mt-2 text-3xl font-semibold">Upload new music</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Upload UI module is coming next. This route is ready so Seller Dashboard quick actions navigate without dead links.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="rounded-xl border-white/15 bg-black/25 text-zinc-100 hover:border-fuchsia-400/30">
              <Link href="/seller/musics">Manage Musics</Link>
            </Button>
            <Button asChild className="rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
              <Link href="/seller">Back to Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
