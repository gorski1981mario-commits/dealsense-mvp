import { NextRequest, NextResponse } from 'next/server'

// SEND REFERRAL IN-APP
// Device-to-device transfer within DealSense app

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId, fromUserId, toUserId, toDeviceId } = body

    if (!tokenId || !fromUserId || !toUserId || !toDeviceId) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      )
    }

    // IMPORTANT: In production, Supabase transaction:
    // 1. Verify token belongs to fromUserId
    // 2. Check toUserId has PLUS/PRO/FINANCE package
    // 3. Create in-app notification for toUserId
    // 4. Store pending referral transfer
    // 5. Send WhatsApp notification: "Je hebt een code ontvangen van [Naam]!"

    /* MOCK - Replace with Supabase:
    
    // Step 1: Verify token ownership
    const { data: token, error: tokenError } = await supabase
      .from('referral_tokens')
      .select('*')
      .eq('token_id', tokenId)
      .eq('owner_id', fromUserId)
      .single()

    if (tokenError || !token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Step 2: Check recipient package
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, package_type')
      .eq('id', toUserId)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (!['plus', 'pro', 'finance'].includes(recipient.package_type)) {
      return NextResponse.json({ error: 'Recipient must have PLUS/PRO/FINANCE' }, { status: 400 })
    }

    // Step 3: Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: toUserId,
        type: 'referral_received',
        title: 'Je hebt een referral code ontvangen!',
        message: `${fromUser.name} heeft je een referral code gestuurd. Gebruik deze voor 2% korting!`,
        data: {
          token_id: tokenId,
          from_user_id: fromUserId
        },
        read: false
      })

    if (notifError) {
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }

    // Step 4: Store pending transfer
    const { error: transferError } = await supabase
      .from('referral_transfers')
      .insert({
        token_id: tokenId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        to_device_id: toDeviceId,
        status: 'pending',
        sent_at: new Date().toISOString()
      })

    if (transferError) {
      return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 })
    }

    // Step 5: Send WhatsApp notification
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('phone_number, name')
      .eq('id', toUserId)
      .single()

    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('name')
      .eq('id', fromUserId)
      .single()

    if (recipient?.phone_number && sender?.name) {
      // Send WhatsApp via Twilio/WhatsApp Business API
      await fetch('https://api.whatsapp.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient.phone_number,
          message: `🎁 Je hebt een referral code ontvangen van ${sender.name}!\n\nOpen DealSense app om je 2% korting te activeren.\n\nGeldig 14 dagen.`
        })
      })
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Referral verzonden! De ontvanger krijgt een notificatie.'
    })

  } catch (error) {
    console.error('[Referral Send Error]', error)
    return NextResponse.json(
      { error: 'Failed to send referral' },
      { status: 500 }
    )
  }
}
