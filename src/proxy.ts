import { auth }     from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/u/', '/api/auth', '/api/health', '/pricing', '/reseller']

export default auth(function proxy(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl
  const isPublic = pathname === '/' || PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!isPublic && !req.auth)
    return NextResponse.redirect(new URL('/login', req.url))

  // Admin routes require ADMIN role
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (isAdminPath && req.auth?.user?.role !== 'ADMIN')
    return NextResponse.redirect(new URL('/dashboard', req.url))

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico).*)'],
}
