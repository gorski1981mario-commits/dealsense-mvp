import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_SCANS_PER_WINDOW = 10

const scanCounts = new Map<string, { count: number; resetAt: number }>()

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = scanCounts.get(ip)

  if (!record || now > record.resetAt) {
    scanCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: MAX_SCANS_PER_WINDOW - 1 }
  }

  if (record.count >= MAX_SCANS_PER_WINDOW) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_SCANS_PER_WINDOW - record.count }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Te veel scans. Probeer over 1 minuut opnieuw.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { data, type } = body

    if (!data || !type) {
      return NextResponse.json(
        { error: 'Ongeldige request' },
        { status: 400 }
      )
    }

    const scanData = {
      qrData: data,
      type,
      timestamp: Date.now(),
      ip
    }

    let action = ''
    let message = ''

    switch (type) {
      case 'free':
        action = 'view'
        message = 'QR code gescand (FREE)'
        break
      case 'plus':
        action = 'unlock'
        message = 'PLUS pakket ontgrendeld'
        break
      case 'pro':
        action = 'subscription'
        message = 'PRO abonnement geactiveerd'
        break
      case 'finance':
        action = 'premium'
        message = 'FINANCE premium toegang'
        break
      default:
        action = 'unknown'
        message = 'Onbekend type'
    }

    console.log('[QR Scan]', scanData)

    // Fast response - don't wait for backend
    // Backend processing happens async
    const response = NextResponse.json({
      success: true,
      action,
      message,
      data: scanData,
      remaining: rateLimit.remaining
    })

    // Optional: Send to backend async (fire and forget)
    // This prevents blocking the response
    if (process.env.BACKEND_URL) {
      fetch(`${process.env.BACKEND_URL}/api/qr-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData)
      }).catch(err => console.error('[Backend QR Sync Error]', err))
    }

    return response

  } catch (error) {
    console.error('[QR Scan Error]', error)
    return NextResponse.json(
      { error: 'Server fout' },
      { status: 500 }
    )
  }
}
