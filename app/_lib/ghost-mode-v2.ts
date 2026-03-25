// Ghost Mode 2.0 - KILLER FEATURE
// ⚠️ SEKRET FIRMY - ROZSZERZONA WERSJA Z MAKSYMALNYM PERFORMANCE
// Maksymalny performance + Minimalny koszt = UNFAIR ADVANTAGE

export interface GhostModeMonitorV2 {
  id: string
  userId: string
  ean: string
  productName: string
  basePrice: number
  targetPrice?: number // Price Drop Alert - user ustawia target
  createdAt: number
  expiresAt: number
  lastCheckedAt: number
  nextCheckAt: number
  status: 'active' | 'triggered' | 'expired' | 'target_reached'
  alertChannels: ('push' | 'email' | 'sms')[]
  
  // Price History Tracking
  priceHistory: PriceHistoryEntry[]
  lowestPriceEver?: number
  highestPriceEver?: number
  averagePrice?: number
  priceTrend?: 'rising' | 'falling' | 'stable'
  
  // Smart Timing
  bestDayToBuy?: string // "Friday" - AI prediction
  bestTimeOfMonth?: number // 1-31
  predictedNextDrop?: number // timestamp
  
  // Notifications sent
  notificationsSent: {
    priceDrops: number
    targetReached: boolean
    expiringWarning: boolean
    finalExpired: boolean
  }
  
  // Performance optimization
  checkInterval: number // adaptive polling (minutes)
  consecutiveNoChanges: number // ile razy sprawdziliśmy bez zmian
}

export interface PriceHistoryEntry {
  timestamp: number
  price: number
  shop: string
  dealScore?: number
}

export interface GhostModeDashboard {
  activeMonitors: number
  totalSavingsFound: number
  averageResponseTime: number // minutes
  successRate: number // % monitors that found better price
  topDeals: {
    productName: string
    originalPrice: number
    foundPrice: number
    savings: number
    shop: string
  }[]
}

export class GhostModeV2 {
  private static STORAGE_KEY = 'dealsense_ghost_monitors_v2'
  private static PRICE_HISTORY_KEY = 'dealsense_price_history'
  private static DASHBOARD_KEY = 'dealsense_ghost_dashboard'
  
  // COST OPTIMIZATION - Adaptive Polling
  private static MIN_CHECK_INTERVAL = 30 // 30 min (gdy cena się zmienia)
  private static MAX_CHECK_INTERVAL = 360 // 6h (gdy cena stabilna)
  private static BATCH_SIZE = 10 // sprawdzaj max 10 produktów naraz
  
  /**
   * ACTIVATE GHOST MODE 2.0
   * Multi-Product Monitoring:
   * - PLUS: 3 produkty (24h każdy)
   * - PRO: 10 produktów (48h każdy)
   * - FINANCE: 50 produktów (7 dni każdy)
   */
  static async activate(
    userId: string,
    ean: string,
    productName: string,
    basePrice: number,
    packageType: 'plus' | 'pro' | 'finance',
    targetPrice?: number
  ): Promise<GhostModeMonitorV2> {
    // Check limits
    const limits = { plus: 3, pro: 10, finance: 50 }
    const maxMonitors = limits[packageType]
    const activeMonitors = this.getAllMonitors(userId).filter(m => m.status === 'active')
    
    if (activeMonitors.length >= maxMonitors) {
      throw new Error(`Limit osiągnięty: ${maxMonitors} produktów dla ${packageType.toUpperCase()}`)
    }
    
    // MONITORING DURATION
    const hoursMap = { plus: 24, pro: 48, finance: 168 }
    const hours = hoursMap[packageType]
    const expiresAt = Date.now() + hours * 60 * 60 * 1000
    
    // ADAPTIVE POLLING - start with frequent checks
    const checkInterval = this.MIN_CHECK_INTERVAL
    
    const monitor: GhostModeMonitorV2 = {
      id: `ghost_v2_${userId}_${ean}_${Date.now()}`,
      userId,
      ean,
      productName,
      basePrice,
      targetPrice,
      createdAt: Date.now(),
      expiresAt,
      lastCheckedAt: Date.now(),
      nextCheckAt: Date.now() + checkInterval * 60 * 1000,
      status: 'active',
      alertChannels: ['push', 'email'],
      
      // Price History
      priceHistory: [{
        timestamp: Date.now(),
        price: basePrice,
        shop: 'Initial scan'
      }],
      lowestPriceEver: basePrice,
      highestPriceEver: basePrice,
      averagePrice: basePrice,
      priceTrend: 'stable',
      
      // Smart Timing - will be calculated
      bestDayToBuy: undefined,
      bestTimeOfMonth: undefined,
      predictedNextDrop: undefined,
      
      // Notifications
      notificationsSent: {
        priceDrops: 0,
        targetReached: false,
        expiringWarning: false,
        finalExpired: false
      },
      
      // Performance
      checkInterval,
      consecutiveNoChanges: 0
    }
    
    this.saveMonitor(monitor)
    
    console.log(`[Ghost Mode 2.0] ✅ ACTIVATED`)
    console.log(`[Ghost Mode 2.0] Product: ${productName} (${ean})`)
    console.log(`[Ghost Mode 2.0] Base price: €${basePrice}`)
    if (targetPrice) {
      console.log(`[Ghost Mode 2.0] Target price: €${targetPrice}`)
    }
    console.log(`[Ghost Mode 2.0] Monitoring for ${hours}h (${packageType.toUpperCase()})`)
    console.log(`[Ghost Mode 2.0] Active monitors: ${activeMonitors.length + 1}/${maxMonitors}`)
    
    return monitor
  }
  
  /**
   * CHECK PRICE - ADAPTIVE POLLING
   * Cost optimization:
   * - Batch requests (10 produktów naraz)
   * - Adaptive interval (30min - 6h)
   * - Cache results (5min)
   */
  static async checkPrice(monitorId: string): Promise<void> {
    const monitor = this.getMonitor(monitorId)
    if (!monitor) return
    
    // Skip if not time yet
    if (Date.now() < monitor.nextCheckAt) {
      console.log(`[Ghost Mode 2.0] Skipping check - next check at ${new Date(monitor.nextCheckAt).toLocaleTimeString()}`)
      return
    }
    
    // Check if expired
    if (Date.now() > monitor.expiresAt) {
      await this.handleExpired(monitor)
      return
    }
    
    // Warning 2h before expiry
    const twoHoursBeforeExpiry = monitor.expiresAt - 2 * 60 * 60 * 1000
    if (Date.now() > twoHoursBeforeExpiry && !monitor.notificationsSent.expiringWarning) {
      await this.sendExpiringWarning(monitor)
    }
    
    try {
      // COST OPTIMIZATION: Use cache if available
      const cachedResult = this.getCachedPrice(monitor.ean)
      if (cachedResult && Date.now() - cachedResult.timestamp < 5 * 60 * 1000) {
        console.log(`[Ghost Mode 2.0] Using cached price for ${monitor.productName}`)
        await this.processPriceCheck(monitor, cachedResult.price, cachedResult.shop)
        return
      }
      
      // Call API
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ean: monitor.ean,
          category: 'electronics',
          packageType: 'plus',
          userId: monitor.userId,
          scanToken: `ghost_${monitor.userId}_${Date.now()}`
        })
      })
      
      const result = await response.json()
      
      if (result.offers && result.offers.length > 0) {
        const bestOffer = result.offers[0]
        const newPrice = bestOffer.price
        const newShop = bestOffer.shop || bestOffer.seller
        
        // Cache result
        this.cachePrice(monitor.ean, newPrice, newShop)
        
        await this.processPriceCheck(monitor, newPrice, newShop)
      } else {
        // No offers found - increase check interval
        monitor.consecutiveNoChanges++
        this.adaptCheckInterval(monitor)
        monitor.lastCheckedAt = Date.now()
        monitor.nextCheckAt = Date.now() + monitor.checkInterval * 60 * 1000
        this.saveMonitor(monitor)
        
        console.log(`[Ghost Mode 2.0] No offers found for ${monitor.productName}`)
      }
    } catch (error) {
      console.error('[Ghost Mode 2.0] Price check failed:', error)
      
      // On error, increase interval
      monitor.consecutiveNoChanges++
      this.adaptCheckInterval(monitor)
      monitor.lastCheckedAt = Date.now()
      monitor.nextCheckAt = Date.now() + monitor.checkInterval * 60 * 1000
      this.saveMonitor(monitor)
    }
  }
  
  /**
   * PROCESS PRICE CHECK
   */
  private static async processPriceCheck(
    monitor: GhostModeMonitorV2,
    newPrice: number,
    newShop: string
  ): Promise<void> {
    // Add to price history
    monitor.priceHistory.push({
      timestamp: Date.now(),
      price: newPrice,
      shop: newShop
    })
    
    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    monitor.priceHistory = monitor.priceHistory.filter(h => h.timestamp > thirtyDaysAgo)
    
    // Update statistics
    this.updatePriceStatistics(monitor)
    
    // Calculate Smart Timing
    this.calculateSmartTiming(monitor)
    
    // Check if price dropped below base price
    if (newPrice < monitor.basePrice) {
      const savings = monitor.basePrice - newPrice
      
      // Check if target price reached
      if (monitor.targetPrice && newPrice <= monitor.targetPrice) {
        monitor.status = 'target_reached'
        await this.sendTargetReachedAlert(monitor, newPrice, newShop, savings)
      } else {
        monitor.status = 'triggered'
        await this.sendPriceDropAlert(monitor, newPrice, newShop, savings)
      }
      
      // Reset consecutive no changes
      monitor.consecutiveNoChanges = 0
      monitor.checkInterval = this.MIN_CHECK_INTERVAL
    } else {
      // Price same or higher - increase interval
      monitor.consecutiveNoChanges++
      this.adaptCheckInterval(monitor)
    }
    
    monitor.lastCheckedAt = Date.now()
    monitor.nextCheckAt = Date.now() + monitor.checkInterval * 60 * 1000
    this.saveMonitor(monitor)
  }
  
  /**
   * ADAPTIVE CHECK INTERVAL - COST OPTIMIZATION
   * Jeśli cena się nie zmienia → sprawdzaj rzadziej
   * Jeśli cena się zmienia → sprawdzaj częściej
   */
  private static adaptCheckInterval(monitor: GhostModeMonitorV2): void {
    if (monitor.consecutiveNoChanges >= 5) {
      // 5+ checks bez zmian → sprawdzaj co 6h
      monitor.checkInterval = this.MAX_CHECK_INTERVAL
    } else if (monitor.consecutiveNoChanges >= 3) {
      // 3-4 checks bez zmian → sprawdzaj co 3h
      monitor.checkInterval = 180
    } else if (monitor.consecutiveNoChanges >= 1) {
      // 1-2 checks bez zmian → sprawdzaj co 1h
      monitor.checkInterval = 60
    } else {
      // Cena się zmienia → sprawdzaj co 30min
      monitor.checkInterval = this.MIN_CHECK_INTERVAL
    }
    
    console.log(`[Ghost Mode 2.0] Adaptive interval: ${monitor.checkInterval}min (no changes: ${monitor.consecutiveNoChanges})`)
  }
  
  /**
   * UPDATE PRICE STATISTICS
   */
  private static updatePriceStatistics(monitor: GhostModeMonitorV2): void {
    const prices = monitor.priceHistory.map(h => h.price)
    
    monitor.lowestPriceEver = Math.min(...prices)
    monitor.highestPriceEver = Math.max(...prices)
    monitor.averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
    
    // Calculate trend (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentPrices = monitor.priceHistory.filter(h => h.timestamp > sevenDaysAgo)
    
    if (recentPrices.length >= 2) {
      const firstPrice = recentPrices[0].price
      const lastPrice = recentPrices[recentPrices.length - 1].price
      const change = ((lastPrice - firstPrice) / firstPrice) * 100
      
      if (change > 5) {
        monitor.priceTrend = 'rising'
      } else if (change < -5) {
        monitor.priceTrend = 'falling'
      } else {
        monitor.priceTrend = 'stable'
      }
    }
  }
  
  /**
   * CALCULATE SMART TIMING - AI PREDICTION
   */
  private static calculateSmartTiming(monitor: GhostModeMonitorV2): void {
    // Analyze price history to find best day/time to buy
    const dayPrices: { [key: string]: number[] } = {}
    
    monitor.priceHistory.forEach(entry => {
      const date = new Date(entry.timestamp)
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
      
      if (!dayPrices[dayName]) {
        dayPrices[dayName] = []
      }
      dayPrices[dayName].push(entry.price)
    })
    
    // Find day with lowest average price
    let bestDay = ''
    let lowestAvg = Infinity
    
    Object.entries(dayPrices).forEach(([day, prices]) => {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length
      if (avg < lowestAvg) {
        lowestAvg = avg
        bestDay = day
      }
    })
    
    if (bestDay) {
      monitor.bestDayToBuy = bestDay
    }
    
    // Predict next price drop (simple heuristic)
    if (monitor.priceTrend === 'falling') {
      // If falling, predict drop in 2-3 days
      monitor.predictedNextDrop = Date.now() + 2.5 * 24 * 60 * 60 * 1000
    }
  }
  
  /**
   * SEND PRICE DROP ALERT
   */
  private static async sendPriceDropAlert(
    monitor: GhostModeMonitorV2,
    newPrice: number,
    shop: string,
    savings: number
  ): Promise<void> {
    const message = `🎉 Znaleźliśmy taniej!\n\n${monitor.productName}\nByło: €${monitor.basePrice}\nTeraz: €${newPrice}\nOszczędność: €${savings.toFixed(2)} (${((savings / monitor.basePrice) * 100).toFixed(1)}%)\n\nSklep: ${shop}\n\nKup teraz!`
    
    console.log('[Ghost Mode 2.0] 🎉 PRICE DROP ALERT!', message)
    
    monitor.notificationsSent.priceDrops++
    
    // Send notifications
    if (monitor.alertChannels.includes('push')) {
      await this.sendPushNotification(monitor.userId, 'Znaleźliśmy taniej!', message)
    }
    
    // Update dashboard
    this.updateDashboard(monitor, savings)
  }
  
  /**
   * SEND TARGET REACHED ALERT
   */
  private static async sendTargetReachedAlert(
    monitor: GhostModeMonitorV2,
    newPrice: number,
    shop: string,
    savings: number
  ): Promise<void> {
    const message = `🎯 TARGET OSIĄGNIĘTY!\n\n${monitor.productName}\nTwój target: €${monitor.targetPrice}\nZnaleziono: €${newPrice}\nOszczędność: €${savings.toFixed(2)}\n\nSklep: ${shop}\n\nKup teraz zanim cena wzrośnie!`
    
    console.log('[Ghost Mode 2.0] 🎯 TARGET REACHED!', message)
    
    monitor.notificationsSent.targetReached = true
    
    if (monitor.alertChannels.includes('push')) {
      await this.sendPushNotification(monitor.userId, 'Target osiągnięty!', message)
    }
    
    this.updateDashboard(monitor, savings)
  }
  
  /**
   * SEND EXPIRING WARNING (2h before)
   */
  private static async sendExpiringWarning(monitor: GhostModeMonitorV2): Promise<void> {
    const message = `⏰ Ghost Mode wkrótce wygaśnie!\n\n${monitor.productName}\nPozostało: 2 godziny\n\nNie znaleźliśmy jeszcze lepszej ceny. Przedłuż monitoring lub kup teraz.`
    
    console.log('[Ghost Mode 2.0] ⏰ EXPIRING WARNING', message)
    
    monitor.notificationsSent.expiringWarning = true
    this.saveMonitor(monitor)
    
    if (monitor.alertChannels.includes('push')) {
      await this.sendPushNotification(monitor.userId, 'Ghost Mode wkrótce wygaśnie', message)
    }
  }
  
  /**
   * HANDLE EXPIRED MONITOR
   */
  private static async handleExpired(monitor: GhostModeMonitorV2): Promise<void> {
    monitor.status = 'expired'
    
    if (!monitor.notificationsSent.finalExpired) {
      const message = `⏱️ Ghost Mode wygasł\n\n${monitor.productName}\nNie znaleźliśmy lepszej ceny przez ${this.formatDuration(monitor.expiresAt - monitor.createdAt)}.\n\nMożesz:\n1. Włączyć ponownie Ghost Mode\n2. Kupić po obecnej cenie: €${monitor.basePrice}\n3. Poczekać na lepszą okazję`
      
      console.log('[Ghost Mode 2.0] ⏱️ EXPIRED', message)
      
      monitor.notificationsSent.finalExpired = true
      
      if (monitor.alertChannels.includes('push')) {
        await this.sendPushNotification(monitor.userId, 'Ghost Mode wygasł', message)
      }
    }
    
    this.saveMonitor(monitor)
  }
  
  /**
   * BATCH CHECK ALL MONITORS - COST OPTIMIZATION
   */
  static async batchCheckAllMonitors(userId: string): Promise<void> {
    const monitors = this.getAllMonitors(userId).filter(m => m.status === 'active')
    
    console.log(`[Ghost Mode 2.0] Batch checking ${monitors.length} monitors...`)
    
    // Process in batches of 10
    for (let i = 0; i < monitors.length; i += this.BATCH_SIZE) {
      const batch = monitors.slice(i, i + this.BATCH_SIZE)
      await Promise.all(batch.map(m => this.checkPrice(m.id)))
      
      // Wait 1s between batches to avoid rate limiting
      if (i + this.BATCH_SIZE < monitors.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
  
  /**
   * GET DASHBOARD STATISTICS
   */
  static getDashboard(userId: string): GhostModeDashboard {
    const stored = localStorage.getItem(this.DASHBOARD_KEY)
    const dashboard: GhostModeDashboard = stored ? JSON.parse(stored) : {
      activeMonitors: 0,
      totalSavingsFound: 0,
      averageResponseTime: 0,
      successRate: 0,
      topDeals: []
    }
    
    const monitors = this.getAllMonitors(userId)
    dashboard.activeMonitors = monitors.filter(m => m.status === 'active').length
    
    return dashboard
  }
  
  /**
   * UPDATE DASHBOARD
   */
  private static updateDashboard(monitor: GhostModeMonitorV2, savings: number): void {
    const dashboard = this.getDashboard(monitor.userId)
    
    dashboard.totalSavingsFound += savings
    
    // Add to top deals
    dashboard.topDeals.push({
      productName: monitor.productName,
      originalPrice: monitor.basePrice,
      foundPrice: monitor.basePrice - savings,
      savings,
      shop: monitor.priceHistory[monitor.priceHistory.length - 1]?.shop || 'Unknown'
    })
    
    // Keep only top 10
    dashboard.topDeals.sort((a, b) => b.savings - a.savings)
    dashboard.topDeals = dashboard.topDeals.slice(0, 10)
    
    localStorage.setItem(this.DASHBOARD_KEY, JSON.stringify(dashboard))
  }
  
  /**
   * CACHE PRICE - 5 MIN TTL
   */
  private static cachePrice(ean: string, price: number, shop: string): void {
    const cache = {
      ean,
      price,
      shop,
      timestamp: Date.now()
    }
    localStorage.setItem(`price_cache_${ean}`, JSON.stringify(cache))
  }
  
  private static getCachedPrice(ean: string): { price: number; shop: string; timestamp: number } | null {
    const cached = localStorage.getItem(`price_cache_${ean}`)
    return cached ? JSON.parse(cached) : null
  }
  
  /**
   * SEND PUSH NOTIFICATION
   */
  private static async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  }
  
  /**
   * REQUEST NOTIFICATION PERMISSION
   */
  static async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }
  
  /**
   * STORAGE HELPERS
   */
  static getAllMonitors(userId: string): GhostModeMonitorV2[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []
    
    const allMonitors: GhostModeMonitorV2[] = JSON.parse(stored)
    return allMonitors.filter(m => m.userId === userId)
  }
  
  private static getMonitor(monitorId: string): GhostModeMonitorV2 | null {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null
    
    const allMonitors: GhostModeMonitorV2[] = JSON.parse(stored)
    return allMonitors.find(m => m.id === monitorId) || null
  }
  
  private static saveMonitor(monitor: GhostModeMonitorV2): void {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const allMonitors: GhostModeMonitorV2[] = stored ? JSON.parse(stored) : []
    
    const index = allMonitors.findIndex(m => m.id === monitor.id)
    if (index >= 0) {
      allMonitors[index] = monitor
    } else {
      allMonitors.push(monitor)
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allMonitors))
  }
  
  static removeMonitor(monitorId: string): void {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return
    
    const allMonitors: GhostModeMonitorV2[] = JSON.parse(stored)
    const filtered = allMonitors.filter(m => m.id !== monitorId)
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }
  
  /**
   * FORMAT DURATION
   */
  private static formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} ${days === 1 ? 'dzień' : 'dni'}`
    }
    return `${hours} ${hours === 1 ? 'godzinę' : 'godzin'}`
  }
}
