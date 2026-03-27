import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productUrl = searchParams.get('productUrl') || ''
  
  // Realistic delivery data per store
  const deliveryByStore = [
    {
      store: 'Coolblue',
      delivery: 'Morgen voor 23:00',
      cost: 'Gratis',
      carrier: 'Coolblue bezorging',
      icon: '🚀',
      speed: 'fastest',
      color: '#15803d'
    },
    {
      store: 'Bol.com',
      delivery: 'Overmorgen 10:00-18:00',
      cost: 'Gratis',
      carrier: 'PostNL',
      icon: '📦',
      speed: 'fast',
      color: '#15803d'
    },
    {
      store: 'MediaMarkt',
      delivery: '3-5 werkdagen',
      cost: '€4,99',
      carrier: 'DHL',
      icon: '🐌',
      speed: 'slow',
      color: '#f59e0b'
    },
    {
      store: 'Amazon.nl',
      delivery: 'Vandaag voor 22:00',
      cost: '€9,99 (express)',
      carrier: 'Amazon Logistics',
      icon: '⚡',
      speed: 'express',
      color: '#2563eb',
      expressAvailable: true
    }
  ]

  return NextResponse.json({
    productUrl,
    stores: deliveryByStore,
    lastUpdated: new Date().toISOString()
  })
}

