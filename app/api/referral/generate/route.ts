import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, userPackage } = body

    if (!deviceId || !userPackage) {
      return NextResponse.json(
        { error: 'Device ID and package required' },
        { status: 400 }
      )
    }

    // Only PLUS/PRO/FINANCE can generate codes
    if (userPackage === 'free') {
      return NextResponse.json(
        { error: 'FREE users cannot generate referral codes' },
        { status: 403 }
      )
    }

    // Generate unique code
    const prefix = userPackage.toUpperCase().substring(0, 3)
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const code = `DEAL-${prefix}-${random}`

    // In production, save to database with deviceId
    // For now, return the code
    return NextResponse.json({
      code,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceId
    })

  } catch (error) {
    console.error('[Referral Generate Error]', error)
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    )
  }
}
