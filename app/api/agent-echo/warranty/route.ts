import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data - w produkcji połączyć z prawdziwym API
  const warrantyData = {
    warrantyPeriod: '2 jaar',
    returnPolicy: '30 dagen bedenktijd',
    extendedWarrantyAvailable: true,
    conditions: 'Standaard fabrieksgarantie'
  }

  return NextResponse.json(warrantyData)
}
