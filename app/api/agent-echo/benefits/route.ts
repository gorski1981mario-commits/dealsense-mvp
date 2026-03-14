import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data - w produkcji połączyć z prawdziwym API
  const benefitsData = {
    cashback: '5%',
    freeGift: 'Gratis verzending',
    loyaltyPoints: 150,
    specialOffer: 'Koop 2, krijg 10% korting'
  }

  return NextResponse.json(benefitsData)
}
