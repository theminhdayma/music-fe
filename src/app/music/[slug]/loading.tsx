import { Navbar } from "@/features/home/components/navbar"

export default function MusicDetailLoading() {
  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left Column Skeleton */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Artwork Skeleton */}
              <div className="relative size-64 md:size-80 shrink-0 rounded-3xl bg-white/[0.03] animate-pulse border border-white/5 shadow-2xl flex items-center justify-center">
                <div className="size-16 rounded-full bg-white/[0.03] animate-pulse" />
              </div>

              {/* Title & Info Skeleton */}
              <div className="flex-1 w-full space-y-4 pt-2">
                <div className="h-4 w-24 bg-white/[0.03] animate-pulse rounded-full" />
                <div className="h-10 w-3/4 bg-white/[0.03] animate-pulse rounded-2xl" />
                <div className="h-6 w-1/3 bg-white/[0.03] animate-pulse rounded-xl" />

                <div className="flex flex-wrap gap-3 pt-4">
                  <div className="h-9 w-24 bg-white/[0.03] animate-pulse rounded-full" />
                  <div className="h-9 w-24 bg-white/[0.03] animate-pulse rounded-full" />
                  <div className="h-9 w-24 bg-white/[0.03] animate-pulse rounded-full" />
                </div>

                <div className="pt-6">
                  <div className="h-12 w-44 bg-white/[0.03] animate-pulse rounded-2xl" />
                </div>
              </div>
            </div>

            {/* Description Card Skeleton */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <div className="h-5 w-32 bg-white/[0.03] animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/[0.03] animate-pulse rounded-full" />
                <div className="h-4 w-5/6 bg-white/[0.03] animate-pulse rounded-full" />
                <div className="h-4 w-4/5 bg-white/[0.03] animate-pulse rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Column (Purchase Card) Skeleton */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="rounded-3xl border border-white/5 bg-[#0d0915]/65 backdrop-blur-2xl p-6 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-white/[0.03] animate-pulse rounded-full" />
                <div className="h-9 w-36 bg-white/[0.03] animate-pulse rounded-xl" />
              </div>

              <div className="space-y-3">
                <div className="h-16 w-full bg-white/[0.03] animate-pulse rounded-2xl" />
                <div className="h-16 w-full bg-white/[0.03] animate-pulse rounded-2xl" />
              </div>

              <div className="h-12 w-full bg-white/[0.03] animate-pulse rounded-2xl" />
              <div className="h-4 w-2/3 mx-auto bg-white/[0.03] animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
