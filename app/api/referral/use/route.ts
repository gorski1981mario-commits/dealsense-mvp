import { NextRequest, NextResponse } from 'next/server'

// USE REFERRAL CODE - Viral Chain
// Mark code as used and generate new code for the user

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, deviceId, userId, userPackage } = body

    if (!code || !deviceId || !userId || !userPackage) {
      return NextResponse.json(
        { error: 'Code, device ID, user ID and package required' },
        { status: 400 }
      )
    }

    // IMPORTANT: In production, Supabase transaction:
    // 1. Validate code (same as /validate)
    // 2. Mark code as used:
    //    - status = 'used'
    //    - usedBy = userId
    //    - usedAt = now
    // 3. Generate NEW code for this user (viral chain!)
    // 4. Apply 2% discount to user's purchase

    /* MOCK - Replace with Supabase:
    
    // Step 1: Validate
    const { data: referralCode, error: validateError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .single()

    if (validateError || !referralCode || referralCode.status !== 'active') {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    if (referralCode.owner_device_id === deviceId) {
      return NextResponse.json({ error: 'Cannot use own code' }, { status: 400 })
    }

    // Step 2: Mark as used
    const { error: updateError } = await supabase
      .from('referral_codes')
      .update({
        status: 'used',
        used_by: userId,
        used_at: new Date().toISOString()
      })
      .eq('code', code)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to use code' }, { status: 500 })
    }

    // Step 3: Generate new code for this user (VIRAL CHAIN!)
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const newCode = `${userPackage.toUpperCase()}-${timestamp}-${random}`

    const { data: newReferral, error: createError } = await supabase
      .from('referral_codes')
      .insert({
        code: newCode,
        owner_id: userId,
        owner_device_id: deviceId,
        status: 'active',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days auto-expire
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to generate new code' }, { status: 500 })
    }
    */

    // MOCK response
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const newCode = `${userPackage.toUpperCase()}-${timestamp}-${random}`

    return NextResponse.json({
      success: true,
      discount: 2, // 2% discount applied
      message: '🎉 Code gebruikt! Je krijgt 2% korting!',
      // VIRAL CHAIN: User gets new code to share
      newCode: {
        code: newCode,
        message: '🎁 Jouw nieuwe code om te delen!',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

  } catch (error) {
    console.error('[Referral Use Error]', error)
    return NextResponse.json(
      { error: 'Failed to use code' },
      { status: 500 }
    )
  }
}
