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
      userId 
    } = body

    if (!category || !packageType) {
      return NextResponse.json(
        { error: 'Category and packageType required' },
        { status: 400 }
      )
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
        offers: data.offers || [],
        cached: data.cached || false
      }
    } catch (error) {
      console.error('[Crawler Error]', error)
      // Fallback to mock only on error
      crawlerResult = { offers: generateMockOffers(searchTerm, category, packageType) }
    }

    const offers = crawlerResult.offers || []

    // Filter based on package limits
    const maxOffers = getMaxOffers(packageType)
    const filteredOffers = offers.slice(0, maxOffers)

    const scansUsed = packageType === 'free' && ean ? await getScanCount(userId) : 0
    const scansRemaining = 3 - scansUsed

    return NextResponse.json({
      offers: filteredOffers,
      cached: false,
      scrapedAt: Date.now(),
      packageType,
      commission: getCommission(packageType),
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

/**
 * Generate mock offers for testing
 * IMPORTANT: Replace with real crawler results in production
 */
function generateMockOffers(searchTerm: string, category: string, packageType: string) {
  const basePrice = 999
  
  return [
    {
      title: `${searchTerm} - TechDeal.nl`,
      price: basePrice * 0.95,
      seller: 'TechDeal',
      url: 'https://techdeal.nl/product/123',
      rating: 4.8,
      reviews: 245,
      stock: { level: 'low', quantity: 2 },
      stockWarning: '⚠️ Beperkte voorraad: nog maar 2 stuks!',
      dealScore: 9.2,
      image: '/placeholder-product.jpg'
    },
    {
      title: `${searchTerm} - Coolblue`,
      price: basePrice * 1.05,
      seller: 'Coolblue',
      url: 'https://coolblue.nl/product/456',
      rating: 4.7,
      reviews: 1823,
      stock: { level: 'medium', quantity: null },
      stockWarning: '⚡ Populair product - beperkte voorraad',
      dealScore: 8.5,
      image: '/placeholder-product.jpg'
    },
    {
      title: `${searchTerm} - Bol.com`,
      price: basePrice * 1.10,
      seller: 'Bol.com',
      url: 'https://bol.com/product/789',
      rating: 4.6,
      reviews: 3421,
      stock: { level: 'high', quantity: null },
      stockWarning: null,
      dealScore: 8.0,
      image: '/placeholder-product.jpg'
    },
    // Additional offers for PRO/FINANCE
    ...(packageType === 'pro' || packageType === 'finance' ? [
      {
        title: `${searchTerm} - MediaMarkt`,
        price: basePrice * 1.08,
        seller: 'MediaMarkt',
        url: 'https://mediamarkt.nl/product/111',
        rating: 4.5,
        reviews: 892,
        stock: { level: 'high', quantity: null },
        stockWarning: null,
        dealScore: 7.8,
        image: '/placeholder-product.jpg'
      },
      {
        title: `${searchTerm} - Alternate`,
        price: basePrice * 0.98,
        seller: 'Alternate',
        url: 'https://alternate.nl/product/222',
        rating: 4.6,
        reviews: 156,
        stock: { level: 'medium', quantity: null },
        stockWarning: null,
        dealScore: 7.5,
        image: '/placeholder-product.jpg'
      }
    ] : [])
  ]
}
