import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dealsense-aplikacja.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, price, product_name, category, packageType, maxOffers } = body

    // Forward request to KWANT backend
    const response = await fetch(`${BACKEND_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        price,
        product_name,
        category,
        packageType: packageType || 'free',
        maxOffers: maxOffers || 3
      }),
      // 30s timeout for KWANT processing
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Backend error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('[KWANT Scan Error]', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - probeer opnieuw' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Kan geen verbinding maken met backend' },
      { status: 500 }
    )
  }
}
