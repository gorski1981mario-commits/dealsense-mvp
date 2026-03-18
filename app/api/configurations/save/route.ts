import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

// TODO: Add Supabase env variables to .env.local:
// NEXT_PUBLIC_SUPABASE_URL=your_url
// SUPABASE_SERVICE_ROLE_KEY=your_key

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      configId, 
      userId, 
      sector, 
      status = 'opgeslagen',
      transactionId,
      paymentAmount,
      userProfile,
      parameters, 
      results,
      timestamp 
    } = body

    // Use provided configId or generate new one
    const finalConfigId = configId || `CFG-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // TODO: Save to Supabase database when configured
    // For now, return mock success
    const savedConfig = {
      id: Date.now().toString(),
      configId: finalConfigId,
      userId,
      sector,
      status,
      transactionId,
      paymentAmount,
      userProfile,
      parameters,
      results,
      timestamp: timestamp || new Date().toISOString(),
      locked: true
    }
    
    console.log('Configuration saved (mock):', savedConfig)

    return NextResponse.json({
      success: true,
      configId: finalConfigId,
      data: savedConfig
    })
  } catch (error: any) {
    console.error('Error saving configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
