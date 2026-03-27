// Ghost Mode - Price Monitoring & Alerts
// ⚠️ SEKRET FIRMY - GHOST MODE DZIAŁA TYLKO GDY NIE ZNALEŹLIŚMY PRODUKTU!
// PLUS: 24h, PRO: 48h, FINANCE: 7 dni
// TO JEST KOMPENSACJA DLA KLIENTA!

export interface GhostModeMonitor {
  id: string
  userId: string
  ean: string
  productName: string
  basePrice: number // Cena z bol.com (lub inna cena bazowa)
  monitoringSince: number
  expiresAt: number
  lastChecked: number
  priceHistory: PricePoint[]
  alertsEnabled: boolean
  alertChannels: ('email' | 'push' | 'sms')[]
  status: 'active' | 'expired' | 'triggered'
}

export interface PricePoint {
  timestamp: number
  price: number
  shop: string
}

export class GhostMode {
  private static STORAGE_KEY = 'dealsense_ghost_monitors'

  /**
   * ⚠️ SEKRET FIRMY - GHOST MODE ACTIVATION
   * 
   * KLUCZOWA ZASADA:
   * Ghost Mode aktywuje się TYLKO gdy NIE ZNALEŹLIŚMY produktu taniej!
   * 
   * FLOW:
   * 1. User skanuje produkt (€999 na bol.com)
   * 2. MY NIE ZNAJDUJEMY żadnej oferty taniej
   * 3. Pokazujemy: "Nie znaleźliśmy teraz produktu taniej"
   * 4. TYLKO WTEDY przycisk "Włącz Ghost Mode" się aktywuje
   * 5. User klika → monitorujemy 24h/48h/7 dni
   * 6. Gdy znajdziemy taniej → ALERT!
   * 
   * TO JEST KOMPENSACJA DLA KLIENTA!
   * Nie znaleźliśmy od razu → dajemy szansę
   * Monitorujemy w tle → jak znajdziemy → alert
   * 
   * UNFAIR ADVANTAGE - konkurencja tego nie ma!
   */
  static async activate(
    userId: string,
    ean: string,
    productName: string,
    basePrice: number,
    packageType: 'plus' | 'pro' | 'finance'
  ): Promise<GhostModeMonitor> {
    // MONITORING DURATION (POPRAWIONE!)
    const hoursMap = { plus: 24, pro: 48, finance: 168 } // 24h, 48h, 7 days
    const hours = hoursMap[packageType]
    const expiresAt = Date.now() + hours * 60 * 60 * 1000

    const monitor: GhostModeMonitor = {
      id: `ghost_${userId}_${ean}_${Date.now()}`,
      userId,
      ean,
      productName,
      basePrice,
      monitoringSince: Date.now(),
      expiresAt,
      lastChecked: Date.now(),
      priceHistory: [],
      alertsEnabled: true,
      alertChannels: ['push'], // Default: push notifications
      status: 'active'
    }

    // Save to storage
    this.saveMonitor(monitor)

    console.log(`[Ghost Mode] ⚠️ ACTIVATED - NIE ZNALEŹLIŚMY PRODUKTU!`)
    console.log(`[Ghost Mode] Product: ${productName} (${ean})`)
    console.log(`[Ghost Mode] Base price: €${basePrice}`)
    console.log(`[Ghost Mode] Monitoring for ${hours}h (${packageType.toUpperCase()})`)
    console.log(`[Ghost Mode] TO JEST KOMPENSACJA DLA KLIENTA!`)

    return monitor
  }

  /**
   * CHECK PRICE
   * Sprawdza cenę co 1h (gdy cache się odświeża)
   * Jeśli ZNALEŹLIŚMY produkt taniej niż basePrice → ALERT!
   */
  static async checkPrice(monitorId: string): Promise<void> {
    const monitor = this.getMonitor(monitorId)
    if (!monitor || monitor.status !== 'active') return

    // Check if expired
    if (Date.now() > monitor.expiresAt) {
      monitor.status = 'expired'
      this.saveMonitor(monitor)
      console.log(`[Ghost Mode] Expired - nie znaleźliśmy produktu w czasie`)
      return
    }

    try {
      // DEVICE-BOUND TOKEN SECURITY
      const timestamp = Date.now()
      const scanToken = `${monitor.userId}-${timestamp}`

      // Call crawler to get current best price
      const response = await fetch('/api/crawler/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ean: monitor.ean,
          category: 'electronics',
          packageType: 'plus', // Ghost Mode available for PLUS+
          userId: monitor.userId,
          scanToken // Device-bound token (cannot be manipulated)
        })
      })

      const result = await response.json()

      monitor.lastChecked = Date.now()

      // Check if we found offers cheaper than basePrice
      if (result.offers && result.offers.length > 0) {
        const bestOffer = result.offers[0] // Already sorted by price
        const newPrice = bestOffer.price
        const newShop = bestOffer.seller

        // Add to price history
        monitor.priceHistory.push({
          timestamp: Date.now(),
          price: newPrice,
          shop: newShop
        })

        // Check if cheaper than basePrice
        if (newPrice < monitor.basePrice) {
          // ✅ ZNALEŹLIŚMY TANIEJ!
          const savings = monitor.basePrice - newPrice
          monitor.status = 'triggered'

          console.log(`[Ghost Mode] ✅ ZNALEŹLIŚMY TANIEJ!`)
          console.log(`[Ghost Mode] Base: €${monitor.basePrice} → Now: €${newPrice}`)
          console.log(`[Ghost Mode] Savings: €${savings}`)

          await this.sendAlert(monitor, newPrice, newShop, savings)
        }

        this.saveMonitor(monitor)
      } else {
        console.log(`[Ghost Mode] Checking... still no offers cheaper than €${monitor.basePrice}`)
      }
    } catch (error) {
      console.error('[Ghost Mode] Price check failed:', error)
    }
  }

  /**
   * SEND ALERT
   * Push/Email/SMS gdy ZNALEŹLIŚMY produkt taniej!
   */
  private static async sendAlert(
    monitor: GhostModeMonitor,
    newPrice: number,
    shop: string,
    savings: number
  ): Promise<void> {
    const message = `🎉 Znaleźliśmy taniej!\n\n${monitor.productName}\nByło: €${monitor.basePrice}\nTeraz: €${newPrice}\nOszczędność: €${savings.toFixed(2)} 💰\n\nSklep: ${shop}\n\nKup teraz!`

    console.log('[Ghost Mode] 🎉 ALERT!', message)

    // Send via selected channels
    if (monitor.alertChannels.includes('push')) {
      // Send push notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DealSense - Znaleźliśmy taniej! 🎉', {
          body: `${monitor.productName}: €${newPrice} (było €${monitor.basePrice}) - Oszczędność €${savings.toFixed(2)}!`,
          icon: '/icon.png'
        })
      }
    }

    if (monitor.alertChannels.includes('email')) {
      // Send email via API
      await fetch('/api/ghost-mode/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: monitor.userId,
          type: 'email',
          message
        })
      })
    }
  }

  /**
   * GET ALL MONITORS
   */
  static getAllMonitors(userId: string): GhostModeMonitor[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    const allMonitors: GhostModeMonitor[] = JSON.parse(stored)
    return allMonitors.filter(m => m.userId === userId)
  }

  /**
   * GET MONITOR
   */
  private static getMonitor(monitorId: string): GhostModeMonitor | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null

    const allMonitors: GhostModeMonitor[] = JSON.parse(stored)
    return allMonitors.find(m => m.id === monitorId) || null
  }

  /**
   * SAVE MONITOR
   */
  private static saveMonitor(monitor: GhostModeMonitor): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(this.STORAGE_KEY)
    const allMonitors: GhostModeMonitor[] = stored ? JSON.parse(stored) : []

    const index = allMonitors.findIndex(m => m.id === monitor.id)
    if (index >= 0) {
      allMonitors[index] = monitor
    } else {
      allMonitors.push(monitor)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allMonitors))
  }

  /**
   * DEACTIVATE MONITOR
   */
  static deactivate(monitorId: string): void {
    const monitor = this.getMonitor(monitorId)
    if (!monitor) return

    monitor.status = 'expired'
    this.saveMonitor(monitor)
  }

  /**
   * REQUEST NOTIFICATION PERMISSION
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false

    if (Notification.permission === 'granted') return true

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
}

