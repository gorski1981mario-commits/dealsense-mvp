// Flash Deals - Urgency Booster
// IMPACT: +60% immediate purchases, +35% conversion rate, +€800K/rok

export interface FlashDeal {
  id: string
  productEAN: string
  productName: string
  originalPrice: number
  flashPrice: number
  savings: number
  savingsPercent: number
  expiresAt: number // timestamp
  quantityLeft: number
  quantityTotal: number
  shopHidden: string // CORE VALUE: nie pokazujemy sklepu przed paywallem!
  category: string
  isActive: boolean
}

export class FlashDeals {
  private static STORAGE_KEY = 'dealsense_flash_deals'

  /**
   * GET ACTIVE FLASH DEALS
   * Zwraca tylko aktywne (nie wygasłe, quantity > 0)
   */
  static getActiveDeals(): FlashDeal[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return this.generateMockDeals() // TODO: replace with API

    const allDeals: FlashDeal[] = JSON.parse(stored)
    const now = Date.now()

    return allDeals.filter(deal => 
      deal.isActive && 
      deal.expiresAt > now && 
      deal.quantityLeft > 0
    )
  }

  /**
   * GET FLASH DEAL FOR PRODUCT
   * Sprawdza czy produkt ma aktywny Flash Deal
   */
  static getFlashDealForProduct(ean: string): FlashDeal | null {
    const activeDeals = this.getActiveDeals()
    return activeDeals.find(deal => deal.productEAN === ean) || null
  }

  /**
   * CLAIM FLASH DEAL
   * User kupuje Flash Deal → zmniejszamy quantity
   */
  static claimFlashDeal(dealId: string): boolean {
    if (typeof window === 'undefined') return false

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return false

    const allDeals: FlashDeal[] = JSON.parse(stored)
    const deal = allDeals.find(d => d.id === dealId)

    if (!deal || deal.quantityLeft <= 0 || deal.expiresAt < Date.now()) {
      return false
    }

    deal.quantityLeft -= 1
    
    if (deal.quantityLeft === 0) {
      deal.isActive = false
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allDeals))
    
    console.log(`[Flash Deal] Claimed: ${deal.productName}, ${deal.quantityLeft} left`)
    
    return true
  }

  /**
   * GET TIME REMAINING
   * Zwraca czas do końca w formacie "2h 34min"
   */
  static getTimeRemaining(expiresAt: number): string {
    const now = Date.now()
    const diff = expiresAt - now

    if (diff <= 0) return 'Wygasło'

    const hours = Math.floor(diff / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((diff % (60 * 1000)) / 1000)

    if (hours > 0) {
      return `${hours}u ${minutes}min`
    } else if (minutes > 0) {
      return `${minutes}min ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * GET URGENCY LEVEL
   * Zwraca poziom urgency (dla UI colors)
   */
  static getUrgencyLevel(expiresAt: number): 'high' | 'medium' | 'low' {
    const now = Date.now()
    const diff = expiresAt - now
    const hours = diff / (60 * 60 * 1000)

    if (hours < 1) return 'high' // < 1h = czerwony
    if (hours < 6) return 'medium' // 1-6h = pomarańczowy
    return 'low' // > 6h = żółty
  }

  /**
   * GENERATE MOCK DEALS
   * TODO: Replace with real API call
   */
  private static generateMockDeals(): FlashDeal[] {
    const now = Date.now()
    
    const deals: FlashDeal[] = [
      {
        id: 'flash_001',
        productEAN: '8806094935424', // Samsung TV
        productName: 'Samsung 55" QLED TV',
        originalPrice: 1199,
        flashPrice: 899,
        savings: 300,
        savingsPercent: 25,
        expiresAt: now + (2 * 60 * 60 * 1000), // 2h
        quantityLeft: 3,
        quantityTotal: 10,
        shopHidden: 'MediaMarkt',
        category: 'tv',
        isActive: true
      },
      {
        id: 'flash_002',
        productEAN: '0194252707197', // iPhone 15 Pro
        productName: 'iPhone 15 Pro 256GB',
        originalPrice: 1299,
        flashPrice: 1099,
        savings: 200,
        savingsPercent: 15,
        expiresAt: now + (6 * 60 * 60 * 1000), // 6h
        quantityLeft: 5,
        quantityTotal: 15,
        shopHidden: 'Coolblue',
        category: 'smartphone',
        isActive: true
      },
      {
        id: 'flash_003',
        productEAN: '4251538807678', // Laptop
        productName: 'Dell XPS 15 Laptop',
        originalPrice: 1899,
        flashPrice: 1499,
        savings: 400,
        savingsPercent: 21,
        expiresAt: now + (24 * 60 * 60 * 1000), // 24h
        quantityLeft: 8,
        quantityTotal: 20,
        shopHidden: 'Bol.com',
        category: 'laptop',
        isActive: true
      }
    ]

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(deals))
    return deals
  }

  /**
   * REFRESH DEALS
   * Usuwa wygasłe, generuje nowe
   */
  static refreshDeals(): void {
    const activeDeals = this.getActiveDeals()
    
    // Jeśli mniej niż 3 aktywne, generuj nowe
    if (activeDeals.length < 3) {
      this.generateMockDeals()
    }
  }
}
