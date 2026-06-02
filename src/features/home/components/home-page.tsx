"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AUTH_ROUTES } from "@/constants/auth"
import { toPlayerTrack } from "@/features/player/utils/track-mapper"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { useMusicPlayerStore } from "@/store/music-player-store"
import type { HomeCreator, HomeGenre, HomeMusic, HomePageData } from "@/types/home"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Globe2,
  Headphones,
  Music2,
  Play,
  Radio,
  Search,
  Sparkles,
  Star,
  Waves,
  type LucideIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useRef } from "react"
import { Navbar } from "./navbar"
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
interface HomePageProps {
  data: HomePageData
}

const sectionFade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
}

export function HomePage({ data }: HomePageProps) {
  const playTrack = useMusicPlayerStore((state) => state.playTrack)
  const ownedTrackIds = useMusicPlayerStore((state) => state.ownedTrackIds)
  const user = useAuthStore((state) => state.user)

  const handlePreview = useCallback(
    (music: HomeMusic, queue: HomeMusic[] = [music]) => {
      playTrack(toPlayerTrack(music), {
        queue: queue.map((track) => toPlayerTrack(track)),
        owned:
          (user?.role === "SELLER" && music.sellerId != null && music.sellerId === user.id) ||
          ownedTrackIds.includes(music.id),
      })
    },
    [ownedTrackIds, playTrack, user]
  )

  const initials = data.heroTrack ? getCreatorInitials(data.heroTrack.sellerName ?? data.heroTrack.artistName) : "EM"

  return (
    <div className="min-h-screen bg-[#040307] text-white">
      <Navbar key={`${data.query}-${data.selectedGenreId ?? "all"}`} query={data.query} selectedGenreId={data.selectedGenreId} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <HeroSection data={data} creatorInitials={initials} onPreview={() => data.heroTrack && handlePreview(data.heroTrack, data.featuredMusics)} />
        <FeaturedSection
          musics={data.featuredPageData?.content ?? data.featuredMusics}
          pageData={data.featuredPageData}
          query={data.query}
          selectedGenreId={data.selectedGenreId}
          onPreview={handlePreview}
        />
        <GenreSection genres={data.genres} activeGenreId={data.selectedGenreId} query={data.query} />
        <TrendingSection musics={data.trendingMusics} />
        <CreatorsSection creators={data.creators} />
        <Footer />
      </main>
    </div>
  )
}

function HeroSection({
  data,
  creatorInitials,
  onPreview,
}: {
  data: HomePageData
  creatorInitials: string
  onPreview: () => void
}) {
  const heroTrack = data.heroTrack

  return (
    <motion.section
      {...sectionFade}
      className="grid items-center gap-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pt-8"
    >
      <div className="relative">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-xs font-medium text-fuchsia-200 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
          <Sparkles className="size-3.5" />
          Discover premium beats, loops, and producer drops
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
          Find cinematic music that sounds like a headline moment.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          Browse polished tracks from independent producers, explore genre collections, and build your next project with a premium beat marketplace made for creators.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="ghost" className="h-12 rounded-2xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 text-white shadow-[0_18px_50px_rgba(168,85,247,0.28)] transition duration-300 hover:brightness-110 hover:shadow-[0_22px_60px_rgba(168,85,247,0.35)]">
            <Link href="#featured">
              Explore music
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/5 px-6 text-zinc-100 transition duration-300 hover:border-fuchsia-400/30 hover:bg-white/8">
            <Link href={AUTH_ROUTES.register}>Become a seller</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-zinc-400">
          <StatPill icon={Music2} label={`${data.totalMusics}+ tracks`} />
          <StatPill icon={Headphones} label={`${data.genres.length} curated genres`} />
          <StatPill icon={Radio} label={`${data.creators.length} featured creators`} />
        </div>

        <div className="pointer-events-none absolute -left-6 top-24 hidden h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl lg:block" />
      </div>

      <div className="relative mx-auto w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-4 shadow-[0_20px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_28%)]" />
          <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#0b0911] p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-zinc-500">
              <span>Now trending</span>
              <span>HQ audio</span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="relative h-[320px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40">
                {heroTrack?.thumbnailUrl ? (
                  <Image
                    src={heroTrack.thumbnailUrl}
                    alt={heroTrack.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-90"
                  />
                ) : (
                  <div className="h-[320px] w-full bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.55),transparent_28%),linear-gradient(160deg,#1f102b,#09060d_70%)]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Featured track</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{heroTrack?.title ?? "Premium beat drop"}</h3>
                      <p className="text-sm text-zinc-400">{heroTrack?.artistName ?? "Independent producer"}</p>
                    </div>
                    <motion.button
                      type="button"
                      onClick={onPreview}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex size-14 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-fuchsia-400/25 transition hover:bg-fuchsia-500/30"
                    >
                      <Play className="ml-0.5 size-5 fill-current" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <Card className="border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-fuchsia-400/20">
                      <Disc3 className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Creator spotlight</p>
                      <p className="mt-1 text-sm font-medium text-white">{heroTrack?.sellerName ?? "Featured producer"}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Hand-picked sound design and clean licensing for creators who want high-end production without the clutter.
                  </p>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniPreview
                    label="Genre"
                    value={heroTrack?.genreName ?? "Beat / Cinematic"}
                    accent="from-fuchsia-500/30 to-violet-500/20"
                  />
                  <MiniPreview
                    label="Creator"
                    value={creatorInitials}
                    accent="from-cyan-500/30 to-sky-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
function FeaturedSection({
  musics,
  pageData,
  query,
  selectedGenreId,
  onPreview,
}: {
  musics: HomeMusic[]
  pageData: HomePageData["featuredPageData"]
  query: string
  selectedGenreId: number | null
  onPreview: (music: HomeMusic, queue?: HomeMusic[]) => void
}) {
  const pathname = usePathname()
  const currentPage = pageData?.pageNumber ?? 0
  const totalPages = pageData?.totalPages ?? 0
  const totalElements = pageData?.totalElements ?? musics.length
  const pageSize = pageData?.pageSize ?? 6
  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1
  const end = totalElements === 0 ? 0 : Math.min((currentPage + 1) * pageSize, totalElements)

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set("q", query.trim())
    }

    if (selectedGenreId !== null) {
      params.set("genreId", String(selectedGenreId))
    }

    if (nextPage > 0) {
      params.set("page", String(nextPage))
    }

    const search = params.toString()
    return search ? `${pathname}?${search}` : pathname
  }

  return (
    <motion.section id="featured" {...sectionFade} className="space-y-6">
      <SectionHeader
        eyebrow={query ? "Search results" : "Featured music"}
        title={query ? `Results for “${query}”` : "Hand-picked tracks worth a second listen."}
        description="Each page shows 6 tracks in a clean 3-column grid, so the featured row stays balanced and easy to scan."
      />

      {musics.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {musics.map((music, index) => (
              <MusicCard key={music.id} music={music} priority={index < 2} onPreview={() => onPreview(music, musics)} />
            ))}
          </div>

          {pageData && totalPages > 1 ? (
            <div className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-400">
                Showing {start}-{end} of {totalElements}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={buildPageHref(Math.max(currentPage - 1, 0))}
                  scroll={false}
                  aria-disabled={currentPage <= 0}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm transition",
                    currentPage <= 0
                      ? "pointer-events-none border-white/8 bg-white/[0.03] text-zinc-600"
                      : "border-white/10 bg-white/[0.05] text-zinc-200 hover:border-fuchsia-400/25 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  Prev
                </Link>

                {buildPaginationItems(currentPage, totalPages).map((item, index) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-zinc-500">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={item}
                      href={buildPageHref(item)}
                      scroll={false}
                      aria-current={item === currentPage ? "page" : undefined}
                      className={cn(
                        "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
                        item === currentPage
                          ? "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-100"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-fuchsia-400/25 hover:bg-white/[0.08] hover:text-white"
                      )}
                    >
                      {item + 1}
                    </Link>
                  )
                )}

                <Link
                  href={buildPageHref(Math.min(currentPage + 1, Math.max(totalPages - 1, 0)))}
                  scroll={false}
                  aria-disabled={currentPage >= totalPages - 1}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm transition",
                    currentPage >= totalPages - 1
                      ? "pointer-events-none border-white/8 bg-white/[0.03] text-zinc-600"
                      : "border-white/10 bg-white/[0.05] text-zinc-200 hover:border-fuchsia-400/25 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  Next
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No tracks found"
          description="Try a different search term or clear the current filter to browse the full catalog."
        />
      )}
    </motion.section>
  )
}

type PaginationItem = number | "ellipsis"

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const items: PaginationItem[] = [0]
  const start = Math.max(1, currentPage - 1)
  const end = Math.min(totalPages - 2, currentPage + 1)

  if (start > 1) {
    items.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < totalPages - 2) {
    items.push("ellipsis")
  }

  items.push(totalPages - 1)

  return items
}

function GenreSection({
  genres,
  activeGenreId,
  query,
}: {
  genres: HomeGenre[]
  activeGenreId: number | null
  query: string
}) {
  const pathname = usePathname()

  const buildHref = (genreId: number | null) => {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set("q", query.trim())
    }

    if (genreId) {
      params.set("genreId", String(genreId))
    }

    const search = params.toString()
    return search ? `${pathname}?${search}` : pathname
  }

  return (
    <motion.section {...sectionFade} className="space-y-6">
      <SectionHeader
        eyebrow="Genres"
        title="Quick filters that keep discovery effortless."
        description="Tap a genre to refine the homepage and move from browsing to listening faster."
      />

      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          <GenrePill href={buildHref(null)} active={activeGenreId === null} label="All" />
          {genres.map((genre) => (
            <GenrePill key={genre.id} href={buildHref(genre.id)} active={activeGenreId === genre.id} label={genre.name} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No genres available"
          description="The catalog will appear here once the public genre API returns active categories."
        />
      )}
    </motion.section>
  )
}

function TrendingSection({ musics }: { musics: HomeMusic[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" })
  }

  return (
    <motion.section {...sectionFade} className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Trending / Latest"
          title="A horizontal feed for fresh releases and quick scanning."
          description="Designed to feel light and editorial with subtle motion and a smooth scroll rhythm."
        />
        <div className="hidden shrink-0 items-center gap-2 pt-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-fuchsia-400/30 hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-fuchsia-400/30 hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {musics.length > 0 ? (
        <div className="relative">
          {/* Fade trái */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#040307] to-transparent" />
          {/* Fade phải */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#040307] to-transparent" />

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {musics.map((music) => (
              <TrendingCard key={music.id} music={music} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="Trending list is empty"
          description="Add a few published tracks and the latest releases carousel will appear here automatically."
        />
      )}
    </motion.section>
  )
}

function CreatorsSection({ creators }: { creators: HomeCreator[] }) {
  return (
    <motion.section {...sectionFade} className="space-y-6">
      <SectionHeader
        eyebrow="Seller / Producer showcase"
        title="Creators with a sharp visual presence."
        description="A lightweight spotlight for producers and sellers that keeps the homepage premium without feeling busy."
      />

      {creators.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {creators.map((creator) => (
            <CreatorCard key={creator.sellerId} creator={creator} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No creators yet"
          description="Creator cards are derived from the public music list and will show up once there are published tracks."
        />
      )}
    </motion.section>
  )
}

function Footer() {
  return (
    <footer className="mt-4 border-t border-white/10 pt-10 text-sm text-zinc-500">
      {/* Main grid */}
      <div className="grid grid-cols-2 gap-8 pb-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 text-[13px] font-bold tracking-tight text-white">
              EM
            </span>
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-zinc-100">
                Ecommerce Music
              </p>
              <p className="text-[12px] text-zinc-500">Modern beat marketplace</p>
            </div>
          </div>

          <p className="mb-5 max-w-[240px] text-[13px] leading-[1.8] text-zinc-400">
            Discover, license, and collect premium tracks with a clean dark interface built for creators and producers.
          </p>

          <div className="flex gap-2">
            {[
              { label: "Instagram", icon: "brand-instagram" },
              { label: "X / Twitter", icon: "brand-x" },
              { label: "YouTube", icon: "brand-youtube" },
              { label: "SoundCloud", icon: "brand-soundcloud" },
            ].map(({ label, icon }) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="flex size-[34px] items-center justify-center rounded-[10px] border border-fuchsia-400/25 bg-fuchsia-500/8 text-fuchsia-300 transition hover:bg-fuchsia-500/20"
              >
                <span className={`ti ti-${icon} text-base`} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <FooterColumn
          title="Explore"
          links={[
            { label: "Browse tracks", href: "#featured", icon: "music" },
            { label: "Trending now", href: "#", icon: "flame" },
            { label: "Genres", href: "#", icon: "tag" },
            { label: "Creators", href: "#", icon: "users" },
            { label: "Featured drops", href: "#", icon: "star" },
          ]}
        />

        {/* Sellers */}
        <FooterColumn
          title="Sellers"
          links={[
            { label: "Become a seller", href: AUTH_ROUTES.register, icon: "user-plus" },
            { label: "Upload a track", href: "#", icon: "upload" },
            { label: "Analytics", href: "#", icon: "chart-bar" },
            { label: "Licensing guide", href: "#", icon: "license" },
          ]}
        />

        {/* Company */}
        <FooterColumn
          title="Company"
          links={[
            { label: "About us", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Careers", href: "#", badge: "Hiring" },
            { label: "Press kit", href: "#" },
            { label: "Contact", href: "#" },
          ]}
        />
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-3 border-t border-white/[0.07] py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-zinc-600">
          © {new Date().getFullYear()} Ecommerce Music. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-6">
          {["Privacy policy", "Terms of use", "Cookie settings"].map((label) => (
            <Link
              key={label}
              href="#"
              className="text-[12px] text-zinc-600 transition hover:text-fuchsia-400"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; icon?: string; badge?: string }[]
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-violet-400">
        {title}
      </p>
      <ul className="flex flex-col gap-[10px]">
        {links.map(({ label, href, icon, badge }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex items-center gap-[6px] text-[13px] text-zinc-400 transition hover:text-fuchsia-300"
            >
              {icon && (
                <span
                  className={`ti ti-${icon} text-[14px] opacity-50`}
                  aria-hidden="true"
                />
              )}
              {label}
              {badge && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-0.5 text-[11px] text-fuchsia-300">
                  <span className="ti ti-sparkles text-[10px]" aria-hidden="true" />
                  {badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MusicCard({
  music,
  priority,
  onPreview,
}: {
  music: HomeMusic
  priority?: boolean
  onPreview: () => void
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 hover:border-fuchsia-400/25 hover:bg-white/[0.06]"
    >
      <div className="relative">
        <Link href={`/music/${music.slug}`}>
          {music.thumbnailUrl ? (
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src={music.thumbnailUrl}
                alt={music.title}
                fill
                unoptimized
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.45),transparent_28%),linear-gradient(160deg,#1b1028,#09060d_70%)]">
              <Music2 className="size-12 text-fuchsia-200/80" />
            </div>
          )}
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent pointer-events-none" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {music.genreName ? <Badge className="bg-black/45 text-white backdrop-blur-md">{music.genreName}</Badge> : null}
          {music.price ? <Badge variant="outline" className="border-white/15 bg-black/35 text-zinc-100 backdrop-blur-md">${formatPrice(music.price)}</Badge> : null}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <Link href={`/music/${music.slug}`} className="max-w-[70%] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md transition hover:bg-black/60">
            <h3 className="line-clamp-1 text-base font-semibold text-white group-hover:text-fuchsia-300 transition">{music.title}</h3>
            <p className="line-clamp-1 text-sm text-zinc-400">{music.artistName}</p>
          </Link>

          <div className="flex flex-col gap-2">
            <IconActionButton icon={Play} label="Play preview" onClick={onPreview} />
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <Link href={`/music/${music.slug}`} className="block group">
          <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-zinc-400 group-hover:text-zinc-300 transition">
            {music.description || "A polished track curated for modern creators and premium projects."}
          </p>
        </Link>

        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{music.sellerName ?? "Independent producer"}</span>
          <span>{formatDuration(music.durationSeconds)}</span>
        </div>
      </div>
    </motion.article>
  )
}

function TrendingCard({ music }: { music: HomeMusic }) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-w-[280px] snap-start overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md"
    >
      <div className="relative overflow-hidden rounded-[1.25rem]">
        {music.thumbnailUrl ? (
          <div className="relative h-44 w-full overflow-hidden rounded-[1.25rem]">
            <Image
              src={music.thumbnailUrl}
              alt={music.title}
              fill
              unoptimized
              sizes="280px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-[linear-gradient(160deg,#231034,#09060d_78%)]">
            <Waves className="size-10 text-fuchsia-200/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
      </div>
      <div className="space-y-2 px-1 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="line-clamp-1 font-medium text-white">{music.title}</h4>
          <span className="text-sm text-zinc-400">${formatPrice(music.price)}</span>
        </div>
        <p className="line-clamp-1 text-sm text-zinc-500">{music.artistName}</p>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-600">
          <span>{music.genreName ?? "Trending"}</span>
          <span>{music.sellerName ?? "Producer"}</span>
        </div>
      </div>
    </motion.article>
  )
}

function CreatorCard({ creator }: { creator: HomeCreator }) {
  return (
    <motion.article
      className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-md"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border border-white/10 bg-zinc-900/60">
            <AvatarImage src={creator.thumbnailUrl ?? undefined} alt={creator.sellerName} />
            <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white">
              {getCreatorInitials(creator.sellerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-white">{creator.sellerName}</h4>
            <p className="text-sm text-zinc-500">{creator.featuredTrack}</p>
          </div>
        </div>
        <ArrowUpRight className="size-4 text-zinc-500 transition duration-300 group-hover:text-fuchsia-300" />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-zinc-400">
        <span>{creator.musicCount} tracks</span>
        <span className="inline-flex items-center gap-1 text-fuchsia-200">
          <Star className="size-3.5 fill-current" />
          Featured producer
        </span>
      </div>
    </motion.article>
  )
}

function GenrePill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition duration-200",
        active
          ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_0_1px_rgba(168,85,247,0.2)]"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-fuchsia-400/25 hover:bg-white/[0.07] hover:text-white"
      )}
    >
      <Globe2 className="size-3.5 opacity-80" />
      {label}
    </Link>
  )
}

function MiniPreview({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={cn("rounded-[1.25rem] border border-white/10 bg-gradient-to-br p-4", accent)}>
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function IconActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/85 backdrop-blur-md transition duration-200 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/20 hover:text-white"
    >
      <Icon className="size-4" />
    </button>
  )
}

function StatPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
      <Icon className="size-4 text-fuchsia-300" />
      <span>{label}</span>
    </div>
  )
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 sm:max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300/90">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      <p className="text-sm leading-7 text-zinc-400 sm:text-base">{description}</p>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-zinc-400 backdrop-blur-md">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300">
        <Search className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-medium text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-zinc-500">{description}</p>
    </div>
  )
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition duration-200 hover:border-fuchsia-400/25 hover:bg-white/[0.08] hover:text-white"
    >
      {label}
      <ChevronRight className="ml-1 size-3.5 opacity-70" />
    </Link>
  )
}

function formatPrice(price: HomeMusic["price"]) {
  if (price === null || price === undefined || price === "") {
    return "0"
  }

  const numeric = typeof price === "string" ? Number(price) : price
  if (Number.isNaN(numeric)) {
    return String(price)
  }

  return numeric.toFixed(2).replace(/\.00$/, "")
}

function formatDuration(durationSeconds?: number | null) {
  if (!durationSeconds || durationSeconds <= 0) {
    return "Preview"
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function getCreatorInitials(name?: string | null) {
  if (!name) {
    return "EM"
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
