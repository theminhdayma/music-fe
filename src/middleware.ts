import {
    AUTH_ROUTES,
    AUTH_TOKEN_COOKIE_KEY,
    PRIVATE_ROUTES,
    PUBLIC_ONLY_ROUTES,
    ROLE_PROTECTED_PREFIXES,
} from "@/constants/auth"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const isMatchRoute = (pathname: string, routes: readonly string[]) => {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

const decodeJwtRole = (token: string): string | null => {
  const parts = token.split(".")

  if (parts.length < 2) {
    return null
  }

  try {
    const payload = JSON.parse(atob(parts[1])) as { role?: string }
    return payload.role ?? null
  } catch {
    return null
  }
}

const roleForPath = (pathname: string): string | null => {
  const found = Object.entries(ROLE_PROTECTED_PREFIXES).find(([, prefixes]) =>
    isMatchRoute(pathname, prefixes)
  )
  return found ? found[0] : null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_KEY)?.value

  if (isMatchRoute(pathname, PRIVATE_ROUTES) && !token) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.login
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const expectedRole = roleForPath(pathname)

  if (expectedRole) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = AUTH_ROUTES.login
      return NextResponse.redirect(url)
    }

    const role = decodeJwtRole(token)

    if (!role || role !== expectedRole) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  if (isMatchRoute(pathname, PUBLIC_ONLY_ROUTES) && token) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/profile/:path*",
    "/buyer/:path*",
    "/seller/:path*",
    "/admin/:path*",
  ],
}
