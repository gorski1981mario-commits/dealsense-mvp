import { NextRequest, NextResponse } from 'next/server'

// DEVICE-BOUND VIRAL REFERRAL SYSTEM
// NO physical codes - device ID is the token!
// User A (PLUS) → gets referral token (device-bound) → shares device link
// User B clicks link → opens on their device → clicks "Gebruik code" → auto-activates
// User B gets discount → receives new device-bound token → shares → and so on...

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

    // Only PLUS/PRO/FINANCE/ZAKELIJK users get referral codes after purchase
    if (userPackage === 'free') {
      return NextResponse.json(
        { error: 'Only PLUS/PRO/FINANCE/ZAKELIJK users receive referral codes' },
        { status: 403 }
      )
    }

    // ZAKELIJK B2B has additional requirements to prevent abuse
    if (userPackage === 'zakelijk') {
      // In production, check Supabase for:
      // 1. Account age: minimum 3 months active
      // 2. Transaction count: minimum 5 completed deals
      // 3. Total revenue: minimum €25,000 transaction value
      
      /* MOCK - Replace with Supabase:
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('account_created_at, transaction_count, total_revenue')
        .eq('user_id', userId)
        .single()

      const accountAgeMonths = Math.floor((Date.now() - new Date(userStats.account_created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
      
      if (accountAgeMonths < 3) {
        return NextResponse.json({
          error: 'Referral code beschikbaar na 3 maanden actief partnerschap',
          requirements: {
            accountAge: `${accountAgeMonths}/3 maanden`,
            transactions: `${userStats.transaction_count}/5 deals`,
            revenue: `€${userStats.total_revenue.toLocaleString()}/€25.000`
          }
        }, { status: 403 })
      }

      if (userStats.transaction_count < 5) {
        return NextResponse.json({
          error: 'Referral code beschikbaar na 5 gerealiseerde transacties',
          requirements: {
            accountAge: `${accountAgeMonths}/3 maanden`,
            transactions: `${userStats.transaction_count}/5 deals`,
            revenue: `€${userStats.total_revenue.toLocaleString()}/€25.000`
          }
        }, { status: 403 })
      }

      if (userStats.total_revenue < 25000) {
        return NextResponse.json({
          error: 'Referral code beschikbaar na €25.000 totale omzet',
          requirements: {
            accountAge: `${accountAgeMonths}/3 maanden`,
            transactions: `${userStats.transaction_count}/5 deals`,
            revenue: `€${userStats.total_revenue.toLocaleString()}/€25.000`
          }
        }, { status: 403 })
      }
      */
    }

    // Generate device-bound referral token (no physical code!)
    // Token = deviceId + timestamp for uniqueness
    const timestamp = Date.now()
    const tokenId = `${deviceId}-${timestamp}`

    // IMPORTANT: In production, save to Supabase:
    // - tokenId: unique device-bound token (deviceId-timestamp)
    // - ownerId: userId who owns this token
    // - ownerDeviceId: deviceId (THIS device owns the token)
    // - shareUrl: unique URL to share (contains tokenId)
    // - usedBy: null (will be set when someone activates it)
    // - usedByDeviceId: null (device that activated it)
    // - usedAt: null
    // - status: 'active' | 'used' | 'expired'
    // - createdAt: timestamp
    // - expiresAt: 14 days from now (AUTO-EXPIRE after 2 weeks)

    /* MOCK - Replace with Supabase:
    const { data, error } = await supabase
      .from('referral_tokens')
      .insert({
        token_id: tokenId,
        owner_id: userId,
        owner_device_id: deviceId,
        share_url: `https://dealsense.nl/ref/${tokenId}`,
        status: 'active',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days auto-expire
      })
      .select()
      .single()
    */

    // Generate share URL (no physical code!)
    const shareUrl = `https://dealsense.nl/ref/${tokenId}`
    
    return NextResponse.json({
      tokenId,
      shareUrl,
      message: 'Deel deze link met vrienden! Zij klikken "Gebruik code" en krijgen 2% korting!',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days auto-expire
      ownerId: userId,
      deviceId,
      instructions: 'Stuur deze link → Vriend opent op zijn device → Klikt "Gebruik code" → Automatisch geactiveerd!'
    })

  } catch (error) {
    console.error('[Referral Generate Error]', error)
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    )
  }
}

