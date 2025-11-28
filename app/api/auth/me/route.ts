import { NextResponse } from "next/server"

// GET /api/auth/me - Get current user session
export async function GET() {
  // TODO: Implement with Supabase Auth or other auth provider
  // Example with Supabase:
  // const supabase = createServerClient(...)
  // const { data: { user } } = await supabase.auth.getUser()

  return NextResponse.json({
    user: null,
    isAuthenticated: false,
  })
}
