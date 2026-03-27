import { NextRequest, NextResponse } from 'next/server'

// VALIDATE REFERRAL TOKEN - Device-Bound
// Check if token is valid and can be activated by this device

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId, deviceId, userId, targetPackage } = body

    if (!tokenId || !deviceId || !targetPackage) {
      return NextResponse.json(
        { error: 'Token ID, device ID and target package required' },
        { status: 400 }
      )
    }

    // IMPORTANT: In production, check Supabase:
    // 1. Token exists and is active
    // 2. Token is not expired (< 14 days old)
    // 3. Token was not used yet (usedBy === null)
    // 4. Device is NOT the owner's device (prevent self-activation)
    // 5. PACKAGE COMPATIBILITY:
    //    - ZAKELIJK referral codes ONLY work for ZAKELIJK package
    //    - PLUS/PRO/FINANCE referral codes ONLY work for PLUS/PRO/FINANCE packages
    //    - Cross-package usage is NOT allowed

    /* MOCK - Replace with Supabase:
    const { data: referralToken, error } = await supabase
      .from('referral_tokens')
      .select('*')
      .eq('token_id', tokenId)
      .single()

    if (error || !referralToken) {
      return NextResponse.json({ valid: false, error: 'Token niet gevonden' }, { status: 404 })
    }

    if (referralToken.status !== 'active') {
      return NextResponse.json({ valid: false, error: 'Token is al gebruikt' }, { status: 400 })
    }

    if (new Date(referralToken.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token is verlopen (max 14 dagen)' }, { status: 400 })
    }

    if (referralToken.owner_device_id === deviceId) {
      return NextResponse.json({ valid: false, error: 'Je kunt je eigen referral niet gebruiken' }, { status: 400 })
    }

    // PACKAGE COMPATIBILITY CHECK
    const ownerPackage = referralToken.owner_package_type // 'plus', 'pro', 'finance', or 'zakelijk'
    const isZakelijkToken = ownerPackage === 'zakelijk'
    const isZakelijkTarget = targetPackage === 'zakelijk'

    if (isZakelijkToken && !isZakelijkTarget) {
      return NextResponse.json({ 
        valid: false, 
        error: 'ZAKELIJK referral codes kunnen alleen gebruikt worden voor ZAKELIJK pakket' 
      }, { status: 400 })
    }

    if (!isZakelijkToken && isZakelijkTarget) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Deze referral code is niet geldig voor ZAKELIJK pakket' 
      }, { status: 400 })
    }
    */

    // MOCK validation - always valid for testing
    // In production, add package compatibility check above
    return NextResponse.json({
      valid: true,
      discount: 2, // 2% discount
      message: '🎉 Token geldig! -2% korting wordt automatisch toegepast bij betaling'
    })

  } catch (error) {
    console.error('[Referral Validate Error]', error)
    return NextResponse.json(
      { error: 'Failed to validate code' },
      { status: 500 }
    )
  }
}

