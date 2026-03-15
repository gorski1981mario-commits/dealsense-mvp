import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productUrl = searchParams.get('productUrl') || ''
  
  // Realistic stock data per store
  const stockByStore = [
    {
      store: 'Coolblue',
      inStock: true,
      quantity: 12,
      status: 'Op voorraad',
      icon: '✅',
      color: '#15803d'
    },
    {
      store: 'Bol.com',
      inStock: true,
      quantity: 3,
      status: 'Laatste stuks!',
      icon: '⚠️',
      color: '#f59e0b'
    },
    {
      store: 'MediaMarkt',
      inStock: false,
      quantity: 0,
      status: 'Niet op voorraad',
      icon: '❌',
      expectedDate: '18 maart',
      color: '#dc2626'
    },
    {
      store: 'Amazon.nl',
      inStock: true,
      quantity: 25,
      status: 'Ruim op voorraad',
      icon: '✅',
      color: '#15803d'
    }
  ]

  return NextResponse.json({
    productUrl,
    stores: stockByStore,
    lastUpdated: new Date().toISOString()
  })
}
