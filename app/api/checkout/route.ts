import { NextRequest, NextResponse } from 'next/server'

// Stripe checkout API route
// This will create a Stripe checkout session for PLUS/PRO/FINANCE packages

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageType, userId, productType } = body

    // Handle Echo prompts purchase
    if (productType === 'echo-prompts') {
      const promptPackages = {
        '10k': 9.99  // 10,000 prompts at cost price (€0.0011 per message)
      }
      
      const price = promptPackages['10k']
      const checkoutUrl = `/checkout/echo-prompts?price=${price}&userId=${userId}&quantity=10000`
      
      return NextResponse.json({
        success: true,
        checkoutUrl,
        price,
        productType: 'echo-prompts',
        quantity: 10000
      })
    }

    // Validate package type for subscriptions
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

