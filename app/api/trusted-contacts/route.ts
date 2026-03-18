import { NextRequest, NextResponse } from 'next/server'

// TRUSTED CONTACTS API
// Manage user's trusted contacts for referral sharing

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // IMPORTANT: In production, fetch from Supabase
    /* 
    const { data: contacts, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 })
    }
    */

    // MOCK data
    const mockContacts = []

    return NextResponse.json({ contacts: mockContacts })

  } catch (error) {
    console.error('[Trusted Contacts GET Error]', error)
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contact } = body

    if (!userId || !contact) {
      return NextResponse.json({ error: 'User ID and contact required' }, { status: 400 })
    }

    // Validate max 5 contacts
    /* 
    const { count } = await supabase
      .from('trusted_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count >= 5) {
      return NextResponse.json({ error: 'Maximum 5 contacts allowed' }, { status: 400 })
    }
    */

    // IMPORTANT: In production, insert to Supabase
    /* 
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: userId,
        name: contact.name,
        relationship: contact.relationship,
        phone_number: contact.phoneNumber
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 })
    }
    */

    const contactId = `contact-${Date.now()}`

    return NextResponse.json({
      success: true,
      contactId,
      message: 'Contact toegevoegd!'
    })

  } catch (error) {
    console.error('[Trusted Contacts POST Error]', error)
    return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 })
  }
}
