import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Mock data - in production, fetch from database
  const mockSavings = {
    week: parseFloat((Math.random() * 50 + 10).toFixed(2)),
    month: parseFloat((Math.random() * 200 + 50).toFixed(2)),
    total: parseFloat((Math.random() * 1000 + 200).toFixed(2)),
    scansCount: Math.floor(Math.random() * 50) + 10,
    accuracy: 89
  }

  return NextResponse.json(mockSavings)
}
