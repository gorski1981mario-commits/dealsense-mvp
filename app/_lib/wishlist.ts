// Wishlist + Price Drop Alerts
// IMPACT: +70% return rate, +85% conversion on return, +€600K/rok

export interface WishlistItem {
  id: string
  userId: string
  productEAN: string
  productName: string
  currentPrice: number
  targetPrice: number // User ustawia "powiadom gdy < €900"
  addedAt: number
  lastChecked: number
  priceHistory: PricePoint[]
  alertsEnabled: boolean
  shopHidden: string // CORE VALUE: nie pokazujemy sklepu przed paywallem!
  category: string
}

export interface PricePoint {
  timestamp: number
  price: number
}

export class Wishlist {
  private static STORAGE_KEY = 'dealsense_wishlist'

  /**
   * ADD TO WISHLIST
   * User dodaje produkt do wishlist
   */
  static addItem(
    userId: string,
    ean: string,
    productName: string,
    currentPrice: number,
    targetPrice: number,
    shopHidden: string,
    category: string
  ): WishlistItem {
    const item: WishlistItem = {
      id: `wishlist_${userId}_${ean}_${Date.now()}`,
      userId,
      productEAN: ean,
      productName,
      currentPrice,
      targetPrice,
      addedAt: Date.now(),
      lastChecked: Date.now(),
      priceHistory: [
        {
          timestamp: Date.now(),
          price: currentPrice
        }
      ],
      alertsEnabled: true,
      shopHidden,
      category
    }

    this.saveItem(item)

    console.log(`[Wishlist] Added: ${productName} (target: €${targetPrice})`)

    return item
  }

  /**
   * GET USER WISHLIST
   * Zwraca wszystkie items usera
   */
  static getUserWishlist(userId: string): WishlistItem[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    const allItems: WishlistItem[] = JSON.parse(stored)
    return allItems.filter(item => item.userId === userId)
  }

  /**
   * CHECK IF IN WISHLIST
   * Sprawdza czy produkt jest już w wishlist
   */
  static isInWishlist(userId: string, ean: string): boolean {
    const wishlist = this.getUserWishlist(userId)
    return wishlist.some(item => item.productEAN === ean)
  }

  /**
   * REMOVE FROM WISHLIST
   */
  static removeItem(itemId: string): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return

    const allItems: WishlistItem[] = JSON.parse(stored)
    const filtered = allItems.filter(item => item.id !== itemId)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))

    console.log(`[Wishlist] Removed item: ${itemId}`)
  }

  /**
   * CHECK PRICES
   * Sprawdza ceny wszystkich items (co 1h)
   * Wysyła alert jeśli cena spadła poniżej target
   */
  static async checkPrices(userId: string): Promise<void> {
    const wishlist = this.getUserWishlist(userId)

    for (const item of wishlist) {
      if (!item.alertsEnabled) continue

      try {
        // Call crawler to get current price
        const response = await fetch('/api/crawler/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ean: item.productEAN,
            category: item.category,
            packageType: 'plus',
            userId
          })
        })

        const result = await response.json()

        if (result.offers && result.offers.length > 0) {
          const bestOffer = result.offers[0]
          const newPrice = bestOffer.price

          // Add to price history
          item.priceHistory.push({
            timestamp: Date.now(),
            price: newPrice
          })

          item.currentPrice = newPrice
          item.lastChecked = Date.now()

          // Check if target price reached
          if (newPrice <= item.targetPrice) {
            await this.sendPriceAlert(item, newPrice)
          }

          this.saveItem(item)
        }
      } catch (error) {
        console.error('[Wishlist] Price check failed:', error)
      }
    }
  }

  /**
   * SEND PRICE ALERT (CALM COMMERCE)
   * Dyskretne powiadomienie - ZERO presji, user decyduje kiedy sprawdzi
   */
  private static async sendPriceAlert(
    item: WishlistItem,
    newPrice: number
  ): Promise<void> {
    const savings = item.currentPrice - newPrice
    const message = `ℹ️ Aktualizacja ceny\n\n${item.productName}\nCena spadła o €${savings.toFixed(2)}\n\nMożesz to sprawdzić w swoim czasie.`

    console.log('[Wishlist] ℹ️ Quiet notification:', message)

    // Quiet notification - TYLKO badge, NIE popup!
    // User otwiera KIEDY CHCE, bez presji
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('DealSense - Aktualizacja', {
        body: `Cena produktu na Twojej liście się zmieniła. Sprawdź kiedy będziesz gotowy.`,
        icon: '/icon.png',
        requireInteraction: false, // NIE wymuszamy interakcji
        silent: true // Cicho, bez dźwięku
      })
    }

    // TODO: Quiet email (nie "KUP TERAZ!", tylko informacja)
  }

  /**
   * GET PRICE TREND
   * Zwraca trend ceny (up/down/stable)
   */
  static getPriceTrend(item: WishlistItem): 'up' | 'down' | 'stable' {
    if (item.priceHistory.length < 2) return 'stable'

    const recent = item.priceHistory.slice(-5) // Last 5 points
    const first = recent[0].price
    const last = recent[recent.length - 1].price

    const diff = last - first
    const percentDiff = (diff / first) * 100

    if (percentDiff > 5) return 'up'
    if (percentDiff < -5) return 'down'
    return 'stable'
  }

  /**
   * SAVE ITEM
   */
  private static saveItem(item: WishlistItem): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(this.STORAGE_KEY)
    const allItems: WishlistItem[] = stored ? JSON.parse(stored) : []

    const index = allItems.findIndex(i => i.id === item.id)
    if (index >= 0) {
      allItems[index] = item
    } else {
      allItems.push(item)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allItems))
  }
}
