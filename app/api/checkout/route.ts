import { NextRequest, NextResponse } from 'next/server'

// Stripe checkout API route
// This will create a Stripe checkout session for PLUS/PRO/FINANCE packages

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageType, userId } = body

    // Validate package type
    if (!['plus', 'pro', 'finance'].includes(packageType)) {
      return NextResponse.json(
        { error: 'Invalid package type' },
        { status: 400 }
      )
    }

    // Package prices (monthly subscription)
    const prices = {
      plus: 19.99,
      pro: 29.99,
      finance: 39.99
    }

    const price = prices[packageType as keyof typeof prices]

    // TODO: Integrate with Stripe API
    // For now, return mock checkout URL
    const checkoutUrl = `/checkout/${packageType}?price=${price}&userId=${userId}`

    return NextResponse.json({
      success: true,
      checkoutUrl,
      price,
      packageType
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
