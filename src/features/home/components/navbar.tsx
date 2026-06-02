"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { AUTH_ROUTES } from "@/constants/auth"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useAuthStore } from "@/store/auth-store"
import useCartStore from "@/store/cart-store"
import { motion } from "framer-motion"
import {
    Compass,
    FolderHeart,
    LayoutDashboard,
    LogOut,
    Search,
    ShoppingCart,
    User,
    Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"

interface NavbarProps {
  query?: string
  selectedGenreId?: number | null
}

export function Navbar({ query = "", selectedGenreId = null }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(query)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const user = useAuthStore((state) => state.user)
  const { logout } = useAuth()

  const cartCount = useCartStore((s) => s.totalItems || s.items.length)
  const loadCart = useCartStore((s) => s.loadCart)
  const isCartRoute = pathname.startsWith("/cart")
  const isLibraryRoute = pathname.startsWith("/library")

  useEffect(() => {
    if (!isHydrated) return
    if (user && user.role === "BUYER") {
      void loadCart()
    }
  }, [isHydrated, user, user?.id, loadCart])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams()

    if (value.trim()) {
      params.set("q", value.trim())
    }

    if (selectedGenreId) {
      params.set("genreId", String(selectedGenreId))
    }

    const search = params.toString()
    // If not on home page, push to home page with search params
    const targetPath = pathname === "/" ? "/" : "/"
    router.push(search ? `${targetPath}?${search}` : targetPath)
  }

  const getCreatorInitials = (name?: string | null) => {
    if (!name) return "EM"
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050309]/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-sm font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_30px_rgba(168,85,247,0.35)]">
            EM
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-[0.22em] text-zinc-300 uppercase">Ecommerce Music</span>
            <span className="text-xs text-zinc-500">Beat marketplace</span>
          </span>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_12px_50px_rgba(0,0,0,0.22)] backdrop-blur-md transition focus-within:border-fuchsia-400/40 focus-within:bg-white/8"
        >
          <Search className="size-4 text-zinc-400" />
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search by title or artist"
            className="h-9 border-0 bg-transparent px-0 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-zinc-100 hover:bg-white/15"
          >
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3">
          {user?.role === "BUYER" && (
            <Link href="/library" className="relative hidden sm:inline-flex">
              <div className={`flex items-center justify-center size-9 rounded-xl border p-2 transition ${
                isLibraryRoute
                  ? "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-200"
                  : "border-white/8 bg-white/3 hover:ring-2 hover:ring-fuchsia-500/20"
              }`}>
                <FolderHeart className="size-5" />
              </div>
            </Link>
          )}
          {/* Cart icon with live badge */}
          {user?.role === "BUYER" &&(
            <Link href="/cart" className="relative hidden sm:inline-flex">
            <div className={`flex items-center justify-center size-9 rounded-xl border p-2 transition ${
              isCartRoute
                ? "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-200"
                : "border-white/8 bg-white/3 hover:ring-2 hover:ring-fuchsia-500/20"
            }`}>
              <ShoppingCart className="size-5 text-zinc-100" />
            </div>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-fuchsia-500 px-2 py-0.5 text-xs font-semibold text-white"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          )}
          
          {isHydrated ? (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group relative flex items-center gap-2 focus:outline-hidden">
                    <Avatar className="size-9 border border-white/15 bg-zinc-950 transition duration-300 group-hover:border-fuchsia-400/50 group-hover:ring-2 group-hover:ring-fuchsia-500/20">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white font-semibold text-xs">
                        {getCreatorInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 border border-white/10 bg-[#0c0816]/95 p-2 text-white shadow-2xl backdrop-blur-2xl rounded-2xl"
                >
                  <div className="flex flex-col gap-1 p-3">
                    <p className="text-sm font-semibold truncate text-white">{user.fullName}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge className="bg-fuchsia-500/15 hover:bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/30 text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider">
                        {user.role}
                      </Badge>
                      {user.emailVerified && (
                        <Badge className="bg-emerald-500/15 hover:bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 text-[10px] font-medium px-2 py-0.5">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-white/10 my-1" />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/"
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:text-white focus:bg-white/10 focus:text-white"
                    >
                      <Compass className="size-4 text-fuchsia-400" />
                      Home
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "BUYER" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/library"
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:text-white focus:bg-white/10 focus:text-white"
                      >
                        <FolderHeart className="size-4 text-fuchsia-400" />
                        Library
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:text-white focus:bg-white/10 focus:text-white"
                    >
                      <User className="size-4 text-fuchsia-400" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:text-white focus:bg-white/10 focus:text-white"
                        >
                          <LayoutDashboard className="size-4 text-fuchsia-400 animate-pulse" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.role === "SELLER" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/seller"
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:text-white focus:bg-white/10 focus:text-white"
                      >
                        <LayoutDashboard className="size-4 text-fuchsia-400 animate-pulse" />
                        Seller Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-white/10 my-1" />

                  <DropdownMenuItem
                    onClick={() => void logout()}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                  >
                    <LogOut className="size-4 text-red-400" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500 px-4 text-white hover:bg-fuchsia-400 transition duration-300">
                  <Link href={AUTH_ROUTES.login}>Log in</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex rounded-xl border-white/10 bg-white/5 px-4 text-zinc-100 hover:border-fuchsia-400/30 hover:bg-white/8 transition duration-300">
                  <Link href={AUTH_ROUTES.register}>Become a seller</Link>
                </Button>
              </>
            )
          ) : (
            <div className="h-9 w-20 rounded-xl bg-white/8" />
          )}
        </div>
      </div>
    </header>
  )
}
