import { NextRequest, NextResponse } from 'next/server'

// Crawler Search API - Integration with DealSense Crawler
// Handles: EAN scans (FREE/PLUS), Configurators (all packages)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query,           // "iPhone 15 Pro" (for configurators)
      ean,             // "8719273287891" (for scanner)
      category,        // "electronics", "energie", etc.
      packageType,     // "free" | "plus" | "pro" | "finance"
      userId,
      scanToken        // Device-bound token (deviceId-timestamp)
    } = body

    if (!category || !packageType) {
      return NextResponse.json(
        { error: 'Category and packageType required' },
        { status: 400 }
      )
    }

    // DEVICE-BOUND TOKEN VALIDATION
    // Validate token format: deviceId-timestamp
    if (scanToken) {
      const isValidToken = validateScanToken(scanToken, userId)
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Invalid scan token - possible manipulation detected' },
          { status: 403 }
        )
      }
    }

    // FREE PACKAGE LOGIC - 3 scans teaser, then paywall
    if (packageType === 'free' && ean) {
      const scanCount = await getScanCount(userId)
      
      if (scanCount >= 3) {
        // PAYWALL - show upgrade prompt
        return NextResponse.json({
          paywall: true,
          message: 'Je hebt 3 gratis scans gebruikt. Upgrade naar PLUS voor onbeperkt scannen!',
          scansUsed: scanCount,
          maxScans: 3,
          upgradeUrl: '/packages',
          commission: '10%' // FREE users pay 10% commission
        }, { status: 402 }) // Payment Required
      }

      // TEASER - allow scan, increment counter
      await incrementScanCount(userId)
    }

    // PRODUCTION: Call actual crawler
    const searchTerm = ean || query
    
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Query or EAN required' },
        { status: 400 }
      )
    }

    // PRODUCTION: Call KWANT Backend (includes crawler)
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dealsense-aplikacja.onrender.com'
    let crawlerResult
    
    try {
      // Call KWANT backend which integrates crawler
      const response = await fetch(`${BACKEND_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_name: searchTerm,
          ean: ean || null,
          base_price: 999, // Default for search
          category,
          packageType,
          session_id: userId,
          fingerprint: userId
        }),
        signal: AbortSignal.timeout(30000) // 30s timeout
      })
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }
      
      const data = await response.json()
      crawlerResult = { 
        offers: data.result?.offers || [],
        cached: data.cached || false
      }
    } catch (error) {
      console.error('[Crawler Error]', error)
      crawlerResult = { offers: [] }
    }

    const offers = crawlerResult.offers || []

    // Filter based on package limits
    const maxOffers = getMaxOffers(packageType)
    const filteredOffers = offers.slice(0, maxOffers)

    const scansUsed = packageType === 'free' && ean ? await getScanCount(userId) : 0
    const scansRemaining = 3 - scansUsed
    const basePrice = 999
    const productName = searchTerm

    return NextResponse.json({
      offers: filteredOffers,
      cached: crawlerResult.cached || false,
      scrapedAt: Date.now(),
      packageType,
      commission: getCommission(packageType),
      productName,
      basePrice,
      ...(packageType === 'free' && ean ? {
        scansRemaining,
        scansUsed,
        // Proactive warning after 2nd scan
        warning: scansUsed === 2 ? '⚠️ Laatste gratis scan! Upgrade naar PLUS voor onbeperkt scannen.' : null
      } : {})
    })

  } catch (error) {
    console.error('[Crawler Search Error]', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}

/**
 * Validate device-bound scan token
 * Token format: deviceId-timestamp
 * Prevents URL manipulation and replay attacks
 */
function validateScanToken(scanToken: string, userId: string): boolean {
  if (!scanToken || !userId) return false
  
  // Token must match format: deviceId-timestamp
  const parts = scanToken.split('-')
  if (parts.length < 2) return false
  
  // Extract deviceId from token (all parts except last)
  const tokenDeviceId = parts.slice(0, -1).join('-')
  const timestamp = parseInt(parts[parts.length - 1])
  
  // Validate deviceId matches
  if (tokenDeviceId !== userId) {
    console.warn('[Security] Device ID mismatch:', { tokenDeviceId, userId })
    return false
  }
  
  // Validate timestamp is recent (within 5 minutes)
  const now = Date.now()
  const age = now - timestamp
  const MAX_AGE = 5 * 60 * 1000 // 5 minutes
  
  if (age > MAX_AGE || age < 0) {
    console.warn('[Security] Token expired or future timestamp:', { age, timestamp })
    return false
  }
  
  return true
}

/**
 * Get scan count for FREE users
 */
async function getScanCount(userId: string): Promise<number> {
  if (!userId) return 0
  
  // IMPORTANT: In production, get from Supabase
  /* 
  const { data, error } = await supabase
    .from('user_scans')
    .select('count')
    .eq('user_id', userId)
    .single()
  
  return data?.count || 0
  */
  
  // MOCK - use localStorage count
  if (typeof window !== 'undefined') {
    const count = localStorage.getItem(`scan_count_${userId}`)
    return count ? parseInt(count) : 0
  }
  
  return 0
}

/**
 * Increment scan count for FREE users
 */
async function incrementScanCount(userId: string): Promise<void> {
  if (!userId) return
  
  // IMPORTANT: In production, increment in Supabase
  /* 
  await supabase
    .from('user_scans')
    .upsert({
      user_id: userId,
      count: (await getScanCount(userId)) + 1,
      last_scan: new Date().toISOString()
    })
  */
  
  // MOCK - increment localStorage
  if (typeof window !== 'undefined') {
    const current = await getScanCount(userId)
    localStorage.setItem(`scan_count_${userId}`, (current + 1).toString())
  }
}

/**
 * Get max offers based on package
 */
function getMaxOffers(packageType: string): number {
  switch (packageType) {
    case 'free':
    case 'plus':
    case 'pro':
    case 'finance':
      return 3  // TOP 3 for all B2C packages
    case 'zakelijk':
      return 2  // TOP 2 for B2B (large transactions)
    default:
      return 3
  }
}

/**
 * Get commission rate based on package (on transaction value)
 */
function getCommission(packageType: string): string {
  switch (packageType) {
    case 'free':
      return '10%'
    case 'plus':
      return '9%'
    case 'pro':
      return '9%'
    case 'finance':
      return '9%'
    case 'zakelijk':
      return '10%'  // B2B package
    default:
      return '10%'
  }
}

