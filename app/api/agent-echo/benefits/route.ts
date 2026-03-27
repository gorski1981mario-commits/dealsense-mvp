import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productUrl = searchParams.get('productUrl') || ''
  
  // Realistic benefits data per store
  const benefitsByStore = [
    {
      store: 'Coolblue',
      cashback: null,
      loyaltyPoints: 0,
      freeGifts: ['Gratis installatie', 'Oude apparaat meenemen'],
      bankOffers: [],
      totalValue: '€25',
      icon: '🎁',
      color: '#15803d'
    },
    {
      store: 'Bol.com',
      cashback: '€5,00 via iGraal',
      loyaltyPoints: 200,
      loyaltyValue: '€2,00',
      freeGifts: [],
      bankOffers: ['ING: -5% (€10)'],
      totalValue: '€17',
      icon: '🎁',
      color: '#15803d'
    },
    {
      store: 'MediaMarkt',
      cashback: null,
      loyaltyPoints: 150,
      loyaltyValue: '€1,50',
      freeGifts: ['Gratis folia'],
      bankOffers: [],
      totalValue: '€6,50',
      icon: '🎁',
      color: '#15803d'
    },
    {
      store: 'Amazon.nl',
      cashback: '€3,00 via Scoupy',
      loyaltyPoints: 0,
      freeGifts: [],
      bankOffers: ['ABN AMRO: -3% (€6)'],
      totalValue: '€9',
      icon: '🎁',
      color: '#15803d'
    }
  ]

  const bestDeal = benefitsByStore.reduce((best, current) => {
    const bestValue = parseFloat(best.totalValue.replace('€', ''))
    const currentValue = parseFloat(current.totalValue.replace('€', ''))
    return currentValue > bestValue ? current : best
  })

  return NextResponse.json({
    productUrl,
    stores: benefitsByStore,
    bestDeal: bestDeal.store,
    maxSavings: bestDeal.totalValue,
    lastUpdated: new Date().toISOString()
  })
}

