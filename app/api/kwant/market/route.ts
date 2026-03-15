import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dealsense-aplikacja.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_name, ean } = body

    if (!product_name) {
      return NextResponse.json(
        { error: 'product_name is required' },
        { status: 400 }
      )
    }

    // Forward to KWANT backend
    const response = await fetch(`${BACKEND_URL}/api/market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_name,
        ean: ean || null
      }),
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
    console.error('[KWANT Market Error]', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Backend connection failed' },
      { status: 500 }
    )
  }
}
