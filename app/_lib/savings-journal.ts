// Savings Journal - Osobisty dziennik oszczędności
// CALM COMMERCE: Personal, NIE competitive. ZERO porównań z innymi.

export interface SavingsEntry {
  id: string
  userId: string
  productName: string
  productEAN: string
  basePrice: number
  paidPrice: number
  savings: number
  purchasedAt: number
  category: string
  month: string // "2026-03" dla grupowania
}

export interface MonthlySummary {
  month: string
  totalSavings: number
  purchaseCount: number
  biggestSaving: SavingsEntry | null
  categories: Map<string, number> // category -> total savings
}

export class SavingsJournal {
  private static STORAGE_KEY = 'dealsense_savings_journal'

  /**
   * ADD SAVINGS ENTRY
   * Dodaje wpis do dziennika (po zakupie)
   */
  static addEntry(
    userId: string,
    productName: string,
    productEAN: string,
    basePrice: number,
    paidPrice: number,
    category: string
  ): SavingsEntry {
    const savings = basePrice - paidPrice
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const entry: SavingsEntry = {
      id: `savings_${userId}_${Date.now()}`,
      userId,
      productName,
      productEAN,
      basePrice,
      paidPrice,
      savings,
      purchasedAt: Date.now(),
      category,
      month
    }

    this.saveEntry(entry)

    console.log(`[Savings Journal] Added: €${savings.toFixed(2)} saved on ${productName}`)

    return entry
  }

  /**
   * GET USER JOURNAL
   * Zwraca wszystkie wpisy usera
   */
  static getUserJournal(userId: string): SavingsEntry[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    const allEntries: SavingsEntry[] = JSON.parse(stored)
    return allEntries
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.purchasedAt - a.purchasedAt) // Newest first
  }

  /**
   * GET MONTHLY SUMMARY
   * Zwraca podsumowanie dla danego miesiąca
   */
  static getMonthlySummary(userId: string, month: string): MonthlySummary {
    const entries = this.getUserJournal(userId).filter(e => e.month === month)

    if (entries.length === 0) {
      return {
        month,
        totalSavings: 0,
        purchaseCount: 0,
        biggestSaving: null,
        categories: new Map()
      }
    }

    const totalSavings = entries.reduce((sum, e) => sum + e.savings, 0)
    const biggestSaving = entries.reduce((max, e) => e.savings > max.savings ? e : max)

    // Group by category
    const categories = new Map<string, number>()
    entries.forEach(entry => {
      const current = categories.get(entry.category) || 0
      categories.set(entry.category, current + entry.savings)
    })

    return {
      month,
      totalSavings,
      purchaseCount: entries.length,
      biggestSaving,
      categories
    }
  }

  /**
   * GET TOTAL SAVINGS
   * Zwraca całkowite oszczędności usera (all time)
   */
  static getTotalSavings(userId: string): number {
    const entries = this.getUserJournal(userId)
    return entries.reduce((sum, e) => sum + e.savings, 0)
  }

  /**
   * GET CURRENT MONTH
   * Helper - zwraca bieżący miesiąc w formacie YYYY-MM
   */
  static getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * GET MONTH NAME (NL)
   * Helper - konwertuje YYYY-MM na "Maart 2026"
   */
  static getMonthName(month: string): string {
    const [year, monthNum] = month.split('-')
    const monthNames = [
      'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ]
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`
  }

  /**
   * SAVE ENTRY
   */
  private static saveEntry(entry: SavingsEntry): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(this.STORAGE_KEY)
    const allEntries: SavingsEntry[] = stored ? JSON.parse(stored) : []

    allEntries.push(entry)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allEntries))
  }
}

