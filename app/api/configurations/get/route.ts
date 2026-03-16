import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

// TODO: Add Supabase env variables to .env.local

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const configId = searchParams.get('configId')

    if (!userId && !configId) {
      return NextResponse.json(
        { error: 'userId or configId is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch from Supabase when configured
    // For now, return mock empty data
    console.log('Fetching configurations (mock):', { userId, configId })

    return NextResponse.json({
      success: true,
      data: [] // Empty array for now
    })
  } catch (error: any) {
    console.error('Error fetching configurations:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
