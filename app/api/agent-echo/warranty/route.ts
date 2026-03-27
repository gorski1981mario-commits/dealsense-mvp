import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productUrl = searchParams.get('productUrl') || ''
  
  // Realistic warranty data per store
  const warrantyByStore = [
    {
      store: 'Coolblue',
      warranty: '2 jaar',
      returnDays: 30,
      returnPolicy: '30 dagen bedenktijd',
      freeService: true,
      extendedAvailable: true,
      icon: '🛡️',
      rating: 'best',
      color: '#15803d'
    },
    {
      store: 'Bol.com',
      warranty: '2 jaar',
      returnDays: 14,
      returnPolicy: '14 dagen bedenktijd',
      freeService: false,
      extendedAvailable: true,
      icon: '🛡️',
      rating: 'good',
      color: '#15803d'
    },
    {
      store: 'MediaMarkt',
      warranty: '1 jaar',
      returnDays: 14,
      returnPolicy: '14 dagen bedenktijd',
      freeService: false,
      extendedAvailable: true,
      icon: '⚠️',
      rating: 'standard',
      color: '#f59e0b'
    },
    {
      store: 'Amazon.nl',
      warranty: '2 jaar',
      returnDays: 30,
      returnPolicy: '30 dagen retour',
      freeService: false,
      extendedAvailable: false,
      icon: '🛡️',
      rating: 'good',
      color: '#15803d'
    }
  ]

  return NextResponse.json({
    productUrl,
    stores: warrantyByStore,
    bestWarranty: 'Coolblue',
    lastUpdated: new Date().toISOString()
  })
}

