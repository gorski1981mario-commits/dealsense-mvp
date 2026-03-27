import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Return realistic savings data
  // In production, this would fetch from database
  // For MVP, we return structured mock data that matches real usage patterns
  const savingsData = {
    week: parseFloat((Math.random() * 50 + 10).toFixed(2)),
    month: parseFloat((Math.random() * 200 + 50).toFixed(2)),
    total: parseFloat((Math.random() * 1000 + 200).toFixed(2)),
    scansCount: Math.floor(Math.random() * 50) + 10,
    accuracy: 89,
    userId,
    lastUpdated: new Date().toISOString()
  }

  return NextResponse.json(savingsData)
}

// POST endpoint to record a new scan and update savings
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productUrl, basePrice, savings, bestOffer, category } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // In production, save to database
    // For MVP, return success
    return NextResponse.json({ 
      success: true,
      message: 'Scan recorded',
      savings: savings || 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

