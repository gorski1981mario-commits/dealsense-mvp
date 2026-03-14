import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data - w produkcji połączyć z prawdziwym API
  const stockData = {
    inStock: true,
    quantity: 15,
    location: 'Amsterdam warehouse',
    lastUpdated: new Date().toISOString()
  }

  return NextResponse.json(stockData)
}
