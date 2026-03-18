import { NextRequest, NextResponse } from 'next/server'

// VIRAL CHAIN REFERRAL SYSTEM
// User A (PLUS) → gets code REF001 → sends to User B
// User B uses REF001 → gets discount → gets code REF002 → sends to User C
// User C uses REF002 → gets discount → gets code REF003 → and so on...

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, userPackage, userId } = body

    if (!deviceId || !userPackage || !userId) {
      return NextResponse.json(
        { error: 'Device ID, user ID and package required' },
        { status: 400 }
      )
    }

    // Only PLUS/PRO/FINANCE users get referral codes after purchase
    if (userPackage === 'free') {
      return NextResponse.json(
        { error: 'Only PLUS/PRO/FINANCE users receive referral codes' },
        { status: 403 }
      )
    }

    // Generate unique viral chain code
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code = `${userPackage.toUpperCase()}-${timestamp}-${random}`

    // IMPORTANT: In production, save to Supabase:
    // - code: unique referral code (one-time use token)
    // - ownerId: userId who received this code
    // - ownerDeviceId: deviceId (code cannot be used by owner)
    // - usedBy: null (will be set when someone uses it)
    // - usedAt: null
    // - status: 'active' | 'used' | 'expired'
    // - createdAt: timestamp
    // - expiresAt: 7 days from now (AUTO-EXPIRE after 1 week)

    /* MOCK - Replace with Supabase:
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        code,
        owner_id: userId,
        owner_device_id: deviceId,
        status: 'active',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })
      .select()
      .single()
    */

    return NextResponse.json({
      code,
      message: 'Deel deze code met vrienden! Zij krijgen 2% korting, jij helpt DealSense groeien!',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days - auto-expire
      ownerId: userId,
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
