import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data - w produkcji połączyć z prawdziwym API
  const deliveryData = {
    estimatedDays: '2-3',
    shippingCost: 'Gratis',
    carrier: 'PostNL',
    trackingAvailable: true
  }

  return NextResponse.json(deliveryData)
}
