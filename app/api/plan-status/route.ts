import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId') || 'anonymous'

  return NextResponse.json({
    success: true,
    userId,
    plan: 'free',
    scansRemaining: 3,
    scansUsed: 0
  })
}
