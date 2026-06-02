import { Card, CardContent } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border border-white/10 bg-white/[0.04]">
            <CardContent className="p-5">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-3 h-8 w-28 rounded-full bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Card className="border border-white/10 bg-white/[0.04]">
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 rounded-2xl bg-white/10" />
            ))}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/[0.04]">
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-16 rounded-2xl bg-white/10" />
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border border-white/10 bg-white/[0.04]">
        <CardContent className="space-y-3 p-5">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-20 rounded-2xl bg-white/10" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
