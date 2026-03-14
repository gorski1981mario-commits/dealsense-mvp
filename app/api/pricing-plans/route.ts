import { NextResponse } from 'next/server'

export async function GET() {
  const plans = [
    {
      id: 'free',
      name: 'FREE',
      price: 0,
      scans: 3,
      features: ['3 gratis scans', 'Alleen totale besparing', 'Geen winkelnamen']
    },
    {
      id: 'plus',
      name: 'PLUS',
      price: 19.99,
      scans: -1,
      features: ['Onbeperkt scans', 'Top 3 deals', 'Ghost Mode 24h', '10% commissie']
    },
    {
      id: 'pro',
      name: 'PRO',
      price: 29.99,
      scans: -1,
      features: ['Alles van PLUS', '16 categorieën', 'Vacations & Insurance', '5% commissie']
    },
    {
      id: 'finance',
      name: 'FINANCE',
      price: 39.99,
      scans: -1,
      features: ['Alles van PRO', '21 categorieën', 'Finance modules', '0% commissie']
    }
  ]

  return NextResponse.json({ success: true, plans })
}
