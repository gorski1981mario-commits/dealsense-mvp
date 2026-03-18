// Stock Detector - Detect low stock levels from shop pages
// Warns users when product has limited availability

const cheerio = require('cheerio')

class StockDetector {
  /**
   * Detect stock level from HTML
   * Returns: 'high', 'medium', 'low', 'out_of_stock', or null (unknown)
   */
  detectStockLevel(html, domain) {
    const $ = cheerio.load(html)
    
    // Domain-specific stock detection
    const detector = this.getDetectorForDomain(domain)
    if (detector) {
      return detector($)
    }

    // Generic stock detection (fallback)
    return this.genericStockDetection($)
  }

  /**
   * Get domain-specific stock detector
   */
  getDetectorForDomain(domain) {
    const detectors = {
      'bol.com': this.detectBolStock,
      'coolblue.nl': this.detectCoolblueStock,
      'mediamarkt.nl': this.detectMediaMarktStock,
      'amazon.nl': this.detectAmazonStock
    }

    for (const [key, detector] of Object.entries(detectors)) {
      if (domain.includes(key)) {
        return detector.bind(this)
      }
    }

    return null
  }

  /**
   * Bol.com stock detection
   */
  detectBolStock($) {
    const stockText = $('.stock-status, .availability').text().toLowerCase()

    if (stockText.includes('op voorraad')) {
      // Check for quantity indicators
      if (stockText.includes('1 op voorraad') || stockText.includes('2 op voorraad')) {
        return { level: 'low', quantity: this.extractQuantity(stockText) }
      }
      if (stockText.includes('beperkt')) {
        return { level: 'medium', quantity: null }
      }
      return { level: 'high', quantity: null }
    }

    if (stockText.includes('niet op voorraad') || stockText.includes('uitverkocht')) {
      return { level: 'out_of_stock', quantity: 0 }
    }

    return { level: null, quantity: null }
  }

  /**
   * Coolblue stock detection
   */
  detectCoolblueStock($) {
    const stockText = $('.availability-label, .stock-info').text().toLowerCase()

    if (stockText.includes('morgen in huis') || stockText.includes('op voorraad')) {
      if (stockText.includes('laatste') || stockText.includes('1 stuks') || stockText.includes('2 stuks')) {
        return { level: 'low', quantity: this.extractQuantity(stockText) }
      }
      return { level: 'high', quantity: null }
    }

    if (stockText.includes('tijdelijk uitverkocht') || stockText.includes('niet leverbaar')) {
      return { level: 'out_of_stock', quantity: 0 }
    }

    return { level: null, quantity: null }
  }

  /**
   * MediaMarkt stock detection
   */
  detectMediaMarktStock($) {
    const stockText = $('.availability, .stock-status').text().toLowerCase()

    if (stockText.includes('op voorraad') || stockText.includes('beschikbaar')) {
      if (stockText.includes('beperkt') || stockText.includes('laatste')) {
        return { level: 'low', quantity: null }
      }
      return { level: 'high', quantity: null }
    }

    if (stockText.includes('niet op voorraad') || stockText.includes('uitverkocht')) {
      return { level: 'out_of_stock', quantity: 0 }
    }

    return { level: null, quantity: null }
  }

  /**
   * Amazon stock detection
   */
  detectAmazonStock($) {
    const stockText = $('#availability, .availability').text().toLowerCase()

    if (stockText.includes('op voorraad')) {
      // Amazon shows "Nog maar X op voorraad"
      if (stockText.includes('nog maar')) {
        const quantity = this.extractQuantity(stockText)
        if (quantity && quantity <= 5) {
          return { level: 'low', quantity }
        }
        return { level: 'medium', quantity }
      }
      return { level: 'high', quantity: null }
    }

    if (stockText.includes('niet op voorraad') || stockText.includes('tijdelijk uitverkocht')) {
      return { level: 'out_of_stock', quantity: 0 }
    }

    return { level: null, quantity: null }
  }

  /**
   * Generic stock detection (fallback for unknown domains)
   */
  genericStockDetection($) {
    const bodyText = $('body').text().toLowerCase()

    // Low stock indicators
    const lowStockKeywords = [
      'laatste', 'beperkt', 'nog maar', '1 op voorraad', '2 op voorraad',
      'bijna uitverkocht', 'snel op', 'weinig voorraad'
    ]

    for (const keyword of lowStockKeywords) {
      if (bodyText.includes(keyword)) {
        return { level: 'low', quantity: this.extractQuantity(bodyText) }
      }
    }

    // Out of stock indicators
    const outOfStockKeywords = [
      'niet op voorraad', 'uitverkocht', 'niet leverbaar', 
      'tijdelijk uitverkocht', 'niet beschikbaar'
    ]

    for (const keyword of outOfStockKeywords) {
      if (bodyText.includes(keyword)) {
        return { level: 'out_of_stock', quantity: 0 }
      }
    }

    // In stock indicators
    const inStockKeywords = [
      'op voorraad', 'beschikbaar', 'leverbaar', 'morgen in huis'
    ]

    for (const keyword of inStockKeywords) {
      if (bodyText.includes(keyword)) {
        return { level: 'high', quantity: null }
      }
    }

    return { level: null, quantity: null }
  }

  /**
   * Extract quantity from text
   * "Nog maar 3 op voorraad" → 3
   */
  extractQuantity(text) {
    const matches = text.match(/(\d+)\s*(op voorraad|stuks|items)/i)
    return matches ? parseInt(matches[1]) : null
  }

  /**
   * Get stock warning message for user
   */
  getStockWarning(stockInfo) {
    if (!stockInfo || !stockInfo.level) {
      return null
    }

    switch (stockInfo.level) {
      case 'low':
        if (stockInfo.quantity) {
          return `⚠️ Beperkte voorraad: nog maar ${stockInfo.quantity} stuks!`
        }
        return '⚠️ Beperkte voorraad - bestel snel!'

      case 'medium':
        return '⚡ Populair product - beperkte voorraad'

      case 'out_of_stock':
        return '❌ Niet op voorraad'

      default:
        return null
    }
  }
}

module.exports = { StockDetector }
