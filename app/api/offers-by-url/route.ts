import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is verplicht' },
        { status: 400 }
      )
    }

    const mockOffers = [
      { shop: 'Coolblue', price: 765, stock: true, delivery: 'Gratis' },
      { shop: 'MediaMarkt', price: 810, stock: true, delivery: '€5.99' },
      { shop: 'Bol.com', price: 828, stock: true, delivery: 'Gratis' }
    ]

    return NextResponse.json({
      success: true,
      url,
      offers: mockOffers,
      count: mockOffers.length
    })

  } catch (error) {
    console.error('[Offers Error]', error)
    return NextResponse.json(
      { error: 'Server fout' },
      { status: 500 }
    )
  }
}
