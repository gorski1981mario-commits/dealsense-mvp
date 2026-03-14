import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, basePrice, category } = body

    if (!url || !basePrice) {
      return NextResponse.json(
        { error: 'URL en prijs zijn verplicht' },
        { status: 400 }
      )
    }

    const mockOffers = [
      {
        shop: 'Coolblue',
        price: basePrice * 0.85,
        url: 'https://coolblue.nl/product/123',
        rating: 4.5,
        reviews: 1250,
        dealScore: 4.5
      },
      {
        shop: 'MediaMarkt',
        price: basePrice * 0.90,
        url: 'https://mediamarkt.nl/product/123',
        rating: 4.3,
        reviews: 890,
        dealScore: 4.2
      },
      {
        shop: 'Bol.com',
        price: basePrice * 0.92,
        url: 'https://bol.com/nl/p/123',
        rating: 4.7,
        reviews: 2100,
        dealScore: 4.0
      }
    ]

    const bestOffer = mockOffers[0]
    const savings = basePrice - bestOffer.price
    const savingsPct = (savings / basePrice) * 100

    return NextResponse.json({
      success: true,
      offers: mockOffers,
      bestOffer,
      savings: {
        eur: savings,
        pct: savingsPct
      },
      commission: {
        eur: savings * 0.10,
        pct: 10
      },
      netSavings: {
        eur: savings * 0.90
      }
    })

  } catch (error) {
    console.error('[Compare Error]', error)
    return NextResponse.json(
      { error: 'Server fout' },
      { status: 500 }
    )
  }
}
