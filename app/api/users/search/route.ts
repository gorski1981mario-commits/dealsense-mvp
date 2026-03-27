import { NextRequest, NextResponse } from 'next/server'

// IN-APP USER SEARCH
// Search for family, friends in DealSense app

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, currentUserId } = body

    if (!query || !currentUserId) {
      return NextResponse.json(
        { error: 'Query and current user ID required' },
        { status: 400 }
      )
    }

    // IMPORTANT: In production, search Supabase users table:
    // - Search by name, email, phone
    // - Exclude current user
    // - Only return users with PLUS/PRO/FINANCE packages
    // - Return: id, name, email, packageType, deviceId

    /* MOCK - Replace with Supabase:
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, package_type, device_id')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .neq('id', currentUserId)
      .in('package_type', ['plus', 'pro', 'finance'])
      .limit(10)

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
    */

    // MOCK data for testing
    const mockUsers = [
      {
        id: 'user-123',
        name: 'Jan Kowalski (Tata)',
        email: 'jan@example.com',
        packageType: 'pro',
        deviceId: 'device-123'
      },
      {
        id: 'user-456',
        name: 'Maria Kowalska (Mama)',
        email: 'maria@example.com',
        packageType: 'plus',
        deviceId: 'device-456'
      },
      {
        id: 'user-789',
        name: 'Piotr Kowalski (Opa)',
        email: 'piotr@example.com',
        packageType: 'finance',
        deviceId: 'device-789'
      }
    ]

    // Filter by query
    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json({
      users: filteredUsers
    })

  } catch (error) {
    console.error('[User Search Error]', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

