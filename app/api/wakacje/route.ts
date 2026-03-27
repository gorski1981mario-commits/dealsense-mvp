import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destination, dates, travelers } = body

    return NextResponse.json({
      success: true,
      destination,
      dates,
      travelers,
      offers: [
        { provider: 'TUI', price: 899, rating: 4.5 },
        { provider: 'Corendon', price: 849, rating: 4.3 },
        { provider: 'Sunweb', price: 799, rating: 4.6 }
      ],
      bestPrice: 799,
      savings: 100
    })

  } catch (error) {
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}

