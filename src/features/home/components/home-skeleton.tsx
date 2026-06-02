export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#050309]/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-11 w-11 rounded-2xl bg-white/8" />
          <div className="hidden h-10 flex-1 rounded-2xl bg-white/5 sm:block" />
          <div className="h-9 w-20 rounded-xl bg-white/8" />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <section className="grid gap-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pt-8">
          <div className="space-y-4">
            <div className="h-8 w-64 rounded-full bg-white/8" />
            <div className="h-20 w-full rounded-3xl bg-white/8" />
            <div className="h-20 w-4/5 rounded-3xl bg-white/5" />
            <div className="flex gap-3">
              <div className="h-12 w-40 rounded-2xl bg-white/10" />
              <div className="h-12 w-36 rounded-2xl bg-white/5" />
            </div>
          </div>
          <div className="h-[420px] rounded-[2rem] border border-white/10 bg-white/5" />
        </section>

        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </main>
    </div>
  )
}

function SectionSkeleton() {
  return (
    <section className="space-y-5">
      <div className="h-4 w-36 rounded-full bg-white/8" />
      <div className="h-9 w-2/3 rounded-full bg-white/8" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[360px] rounded-[1.7rem] bg-white/5" />
        ))}
      </div>
    </section>
  )
}
