import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealsense-aplikacja.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, data } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is verplicht' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      data: result,
      status: response.status
    })

  } catch (error) {
    console.error('[Backend Proxy Error]', error)
    return NextResponse.json(
      { error: 'Backend proxy fout' },
      { status: 500 }
    )
  }
}
