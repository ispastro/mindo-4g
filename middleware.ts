import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is accessing /app route
  if (request.nextUrl.pathname.startsWith('/app')) {
    // Check for access token in cookies or headers
    const token = request.cookies.get('access_token')?.value
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      // Add redirect parameter to return to /app after login
      loginUrl.searchParams.set('redirect', '/app')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/app/:path*',
}
