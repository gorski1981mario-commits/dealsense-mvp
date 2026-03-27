import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, email, rating } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is verplicht' },
        { status: 400 }
      )
    }

    console.log('[Feedback]', { message, email, rating, timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      message: 'Bedankt voor je feedback!'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}

