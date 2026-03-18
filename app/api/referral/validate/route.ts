import { NextRequest, NextResponse } from 'next/server'

// VALIDATE REFERRAL CODE - Viral Chain
// Check if code is valid and can be used by this device

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, deviceId, userId } = body

    if (!code || !deviceId) {
      return NextResponse.json(
        { error: 'Code and device ID required' },
        { status: 400 }
      )
    }

    // IMPORTANT: In production, check Supabase:
    // 1. Code exists and is active
    // 2. Code is not expired
    // 3. Code was not used yet (usedBy === null)
    // 4. Device is NOT the owner's device (prevent self-use)

    /* MOCK - Replace with Supabase:
    const { data: referralCode, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !referralCode) {
      return NextResponse.json({ valid: false, error: 'Code niet gevonden' }, { status: 404 })
    }

    if (referralCode.status !== 'active') {
      return NextResponse.json({ valid: false, error: 'Code is al gebruikt' }, { status: 400 })
    }

    if (new Date(referralCode.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Code is verlopen' }, { status: 400 })
    }

    if (referralCode.owner_device_id === deviceId) {
      return NextResponse.json({ valid: false, error: 'Je kunt je eigen code niet gebruiken' }, { status: 400 })
    }
    */

    // MOCK validation - always valid for testing
    return NextResponse.json({
      valid: true,
      discount: 2, // 2% discount
      message: '🎉 Code geldig! Je krijgt 2% korting op je eerste maand!'
    })

  } catch (error) {
    console.error('[Referral Validate Error]', error)
    return NextResponse.json(
      { error: 'Failed to validate code' },
      { status: 500 }
    )
  }
}
