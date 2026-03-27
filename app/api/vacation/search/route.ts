import { NextRequest, NextResponse } from 'next/server'

/**
 * VACATION SEARCH API - Real-time prices from SearchAPI.io
 * 
 * Flow:
 * 1. User configures vacation in UI
 * 2. POST /api/vacation/search with configuration
 * 3. Call vacation-api.js (Google Flights + Hotels) - REAL-TIME
 * 4. Return TOP 3 agencies with real prices
 * 5. User pays → sees agency names + deep links
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      destination,
      departureAirport,
      departureDate,
      duration,
      adults,
      children,
      stars,
      board,
      packageType,
      userId
    } = body

    // Validate required fields
    if (!destination || !departureAirport || !departureDate || !duration || !adults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Call KWANT Backend which has vacation-api.js
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000'
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/vacation/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          departureAirport,
          departureDate,
          duration,
          adults,
          children: children || 0,
          stars: stars || '4',
          board: board || 'ai',
          packageType,
          userId
        }),
        signal: AbortSignal.timeout(30000) // 30s timeout
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const data = await response.json()
      
      // Return real-time results
      return NextResponse.json({
        success: true,
        offers: data.offers || [],
        basePrice: data.basePrice,
        referencePrice: data.referencePrice,
        maxSavings: data.maxSavings,
        cached: data.cached || false,
        timestamp: Date.now(),
        packageType,
        commission: getCommission(packageType)
      })

    } catch (error: any) {
      console.error('[Vacation API Error]', error)
      
      // Return error with helpful message
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch vacation prices',
        message: 'Could not connect to price API. Please try again.',
        offers: []
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[Vacation Search Error]', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

/**
 * Get commission rate based on package
 */
function getCommission(packageType: string): string {
  switch (packageType) {
    case 'free':
      return '10%'
    case 'plus':
    case 'pro':
    case 'finance':
      return '9%'
    default:
      return '10%'
  }
}

