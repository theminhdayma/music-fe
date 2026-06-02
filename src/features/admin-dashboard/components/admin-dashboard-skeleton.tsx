import { Card, CardContent } from "@/components/ui/card"

export function AdminDashboardSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="h-3 w-24 rounded-full bg-white/10" />
            <div className="mt-3 h-8 w-28 rounded-full bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}