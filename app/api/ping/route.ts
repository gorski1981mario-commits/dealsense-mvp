import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'online',
    timestamp: Date.now(),
    version: '1.0.0'
  })
}

