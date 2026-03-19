// Savings Timeline - Historia cen (NIE countdown timer!)
// CALM COMMERCE: Dajemy INFORMACJĘ, nie PRESJĘ

export interface PriceHistoryPoint {
  timestamp: number
  price: number
  shop?: string // Optional, dla context
}

export interface PriceAnalysis {
  currentPrice: number
  averagePrice: number
  lowestPrice: number
  highestPrice: number
  trend: 'up' | 'down' | 'stable'
  percentFromAverage: number // +25% lub -15%
  recommendation: string // Spokojny, pomocny tekst
}

export class SavingsTimeline {
  private static STORAGE_KEY = 'dealsense_price_history'

  /**
   * ADD PRICE POINT
   * Dodaje punkt do historii cen
   */
  static addPricePoint(
    ean: string,
    price: number,
    shop?: string
  ): void {
    if (typeof window === 'undefined') return

    const history = this.getPriceHistory(ean)
    
    history.push({
      timestamp: Date.now(),
      price,
      shop
    })

    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    const filtered = history.filter(point => point.timestamp > thirtyDaysAgo)

    this.savePriceHistory(ean, filtered)
  }

  /**
   * GET PRICE HISTORY
   * Zwraca historię cen dla produktu (ostatnie 30 dni)
   */
  static getPriceHistory(ean: string): PriceHistoryPoint[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${ean}`)
    if (!stored) return []

    return JSON.parse(stored)
  }

  /**
   * ANALYZE PRICE
   * Analizuje cenę i zwraca SPOKOJNĄ rekomendację
   */
  static analyzePrice(ean: string, currentPrice: number): PriceAnalysis {
    const history = this.getPriceHistory(ean)

    if (history.length === 0) {
      return {
        currentPrice,
        averagePrice: currentPrice,
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        trend: 'stable',
        percentFromAverage: 0,
        recommendation: 'To pierwsza cena którą widzimy. Możesz dodać do obserwowanych żeby śledzić zmiany.'
      }
    }

    // Calculate stats
    const prices = history.map(p => p.price)
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)

    // Calculate trend (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const recentHistory = history.filter(p => p.timestamp > sevenDaysAgo)
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (recentHistory.length >= 2) {
      const firstPrice = recentHistory[0].price
      const lastPrice = recentHistory[recentHistory.length - 1].price
      const change = ((lastPrice - firstPrice) / firstPrice) * 100
      
      if (change > 5) trend = 'up'
      else if (change < -5) trend = 'down'
    }

    // Percent from average
    const percentFromAverage = ((currentPrice - averagePrice) / averagePrice) * 100

    // CALM recommendation (NIE "KUP TERAZ!", tylko informacja)
    let recommendation = ''
    
    if (currentPrice === lowestPrice) {
      recommendation = 'To najniższa cena którą widzieliśmy. Jeśli potrzebujesz tego produktu, to dobry moment.'
    } else if (percentFromAverage < -15) {
      recommendation = `Cena jest ${Math.abs(percentFromAverage).toFixed(0)}% niższa niż średnia. To dobra okazja, ale bez pośpiechu.`
    } else if (percentFromAverage > 15) {
      recommendation = `Cena jest ${percentFromAverage.toFixed(0)}% wyższa niż średnia. Możesz poczekać - prawdopodobnie spadnie.`
    } else if (trend === 'down') {
      recommendation = 'Cena ostatnio spada. Możesz poczekać kilka dni i zaoszczędzić więcej.'
    } else if (trend === 'up') {
      recommendation = 'Cena ostatnio rośnie. Jeśli potrzebujesz, to dobry moment żeby kupić.'
    } else {
      recommendation = 'Cena jest stabilna. Możesz kupić teraz lub poczekać - Twoja decyzja.'
    }

    return {
      currentPrice,
      averagePrice,
      lowestPrice,
      highestPrice,
      trend,
      percentFromAverage,
      recommendation
    }
  }

  /**
   * GET CHART DATA
   * Zwraca dane do wykresu (ostatnie 30 dni)
   */
  static getChartData(ean: string): { labels: string[], prices: number[] } {
    const history = this.getPriceHistory(ean)

    if (history.length === 0) {
      return { labels: [], prices: [] }
    }

    // Group by day
    const dailyPrices = new Map<string, number[]>()
    
    history.forEach(point => {
      const date = new Date(point.timestamp)
      const day = `${date.getDate()}/${date.getMonth() + 1}`
      
      if (!dailyPrices.has(day)) {
        dailyPrices.set(day, [])
      }
      dailyPrices.get(day)!.push(point.price)
    })

    // Calculate average per day
    const labels: string[] = []
    const prices: number[] = []

    dailyPrices.forEach((dayPrices, day) => {
      labels.push(day)
      const avg = dayPrices.reduce((a, b) => a + b, 0) / dayPrices.length
      prices.push(avg)
    })

    return { labels, prices }
  }

  /**
   * SAVE PRICE HISTORY
   */
  private static savePriceHistory(ean: string, history: PriceHistoryPoint[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.STORAGE_KEY}_${ean}`, JSON.stringify(history))
  }
}
