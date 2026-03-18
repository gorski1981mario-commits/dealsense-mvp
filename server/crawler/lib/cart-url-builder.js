// Cart URL Builder - Generate deep links to shopping carts
// Reduces friction: user lands directly in cart with product ready

/**
 * Build cart URL for different domains
 * Each domain has its own URL structure for adding products to cart
 */
class CartUrlBuilder {
  /**
   * Generate cart URL based on domain and product data
   */
  static buildCartUrl(domain, productUrl, params = {}) {
    const builders = {
      'bol.com': this.buildBolCartUrl,
      'coolblue.nl': this.buildCoolblueCartUrl,
      'booking.com': this.buildBookingCartUrl,
      'hotels.com': this.buildHotelsCartUrl,
      'expedia.nl': this.buildExpediaCartUrl,
      'independer.nl': this.buildIndependerCartUrl,
      'gaslicht.com': this.buildGaslichtCartUrl,
      'directlease.nl': this.buildDirectleaseCartUrl,
      'geldshop.nl': this.buildGeldshopCartUrl,
      'hypotheker.nl': this.buildHypothekerCartUrl,
      'belsimpel.nl': this.buildBelsimpelCartUrl,
      'mediamarkt.nl': this.buildMediamarktCartUrl,
      'wehkamp.nl': this.buildWehkampCartUrl,
      'amazon.nl': this.buildAmazonCartUrl,
      'ikea.nl': this.buildIkeaCartUrl,
      'decathlon.nl': this.buildDecathlonCartUrl
    }

    const builder = builders[domain]
    if (builder) {
      return builder.call(this, productUrl, params)
    }

    // Fallback: return original URL with UTM tracking
    return this.addUTMTracking(productUrl, params)
  }

  /**
   * Bol.com - Add to cart URL
   * Format: https://www.bol.com/nl/order/basket/addItems.html?productId=12345&quantity=1
   */
  static buildBolCartUrl(productUrl, params) {
    const productId = this.extractProductId(productUrl, /\/(\d+)\//)
    if (!productId) return this.addUTMTracking(productUrl, params)

    const quantity = params.quantity || 1
    return `https://www.bol.com/nl/order/basket/addItems.html?productId=${productId}&quantity=${quantity}`
  }

  /**
   * Coolblue - Add to cart URL
   * Format: https://www.coolblue.nl/winkelmandje/toevoegen/12345
   */
  static buildCoolblueCartUrl(productUrl, params) {
    const productId = this.extractProductId(productUrl, /\/product\/(\d+)/)
    if (!productId) return this.addUTMTracking(productUrl, params)

    return `https://www.coolblue.nl/winkelmandje/toevoegen/${productId}`
  }

  /**
   * Booking.com - Pre-filled booking URL
   * Format: https://www.booking.com/hotel/nl/...?checkin=2024-01-01&checkout=2024-01-07&adults=2&children=1
   */
  static buildBookingCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.checkin) url.searchParams.set('checkin', params.checkin)
    if (params.checkout) url.searchParams.set('checkout', params.checkout)
    if (params.adults) url.searchParams.set('group_adults', params.adults)
    if (params.children) url.searchParams.set('group_children', params.children)
    if (params.rooms) url.searchParams.set('no_rooms', params.rooms)

    return url.toString()
  }

  /**
   * Hotels.com - Pre-filled booking URL
   */
  static buildHotelsCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.checkin) url.searchParams.set('chkin', params.checkin)
    if (params.checkout) url.searchParams.set('chkout', params.checkout)
    if (params.adults) url.searchParams.set('adults', params.adults)
    if (params.children) url.searchParams.set('children', params.children)

    return url.toString()
  }

  /**
   * Expedia - Pre-filled booking URL
   */
  static buildExpediaCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.checkin) url.searchParams.set('checkIn', params.checkin)
    if (params.checkout) url.searchParams.set('checkOut', params.checkout)
    if (params.adults) url.searchParams.set('adults', params.adults)

    return url.toString()
  }

  /**
   * Independer.nl - Insurance comparison with pre-filled data
   */
  static buildIndependerCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    // Auto insurance params
    if (params.licensePlate) url.searchParams.set('kenteken', params.licensePlate)
    if (params.birthDate) url.searchParams.set('geboortedatum', params.birthDate)
    if (params.postcode) url.searchParams.set('postcode', params.postcode)

    return url.toString()
  }

  /**
   * Gaslicht.com - Energy comparison with pre-filled data
   */
  static buildGaslichtCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.postcode) url.searchParams.set('postcode', params.postcode)
    if (params.houseNumber) url.searchParams.set('huisnummer', params.houseNumber)
    if (params.electricityUsage) url.searchParams.set('verbruik_elektra', params.electricityUsage)
    if (params.gasUsage) url.searchParams.set('verbruik_gas', params.gasUsage)

    return url.toString()
  }

  /**
   * DirectLease - Leasing with pre-filled data
   */
  static buildDirectleaseCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.duration) url.searchParams.set('looptijd', params.duration)
    if (params.kilometers) url.searchParams.set('kilometers', params.kilometers)

    return url.toString()
  }

  /**
   * Geldshop.nl - Loan with pre-filled data
   */
  static buildGeldshopCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.amount) url.searchParams.set('bedrag', params.amount)
    if (params.duration) url.searchParams.set('looptijd', params.duration)

    return url.toString()
  }

  /**
   * Hypotheker.nl - Mortgage with pre-filled data
   */
  static buildHypothekerCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.mortgageAmount) url.searchParams.set('hypotheekbedrag', params.mortgageAmount)
    if (params.houseValue) url.searchParams.set('woningwaarde', params.houseValue)
    if (params.postcode) url.searchParams.set('postcode', params.postcode)

    return url.toString()
  }

  /**
   * Belsimpel.nl - Telecom with pre-filled data
   */
  static buildBelsimpelCartUrl(productUrl, params) {
    const url = new URL(productUrl)
    
    if (params.mobileData) url.searchParams.set('data', params.mobileData)
    if (params.duration) url.searchParams.set('looptijd', params.duration)

    return url.toString()
  }

  /**
   * MediaMarkt - Add to cart
   */
  static buildMediamarktCartUrl(productUrl, params) {
    const productId = this.extractProductId(productUrl, /product\/(\d+)/)
    if (!productId) return this.addUTMTracking(productUrl, params)

    return `https://www.mediamarkt.nl/nl/shop/add-to-cart.html?productId=${productId}`
  }

  /**
   * Wehkamp - Add to cart
   */
  static buildWehkampCartUrl(productUrl, params) {
    const productId = this.extractProductId(productUrl, /\/p\/(\d+)/)
    if (!productId) return this.addUTMTracking(productUrl, params)

    return `https://www.wehkamp.nl/winkelwagen/toevoegen/${productId}`
  }

  /**
   * Amazon.nl - Add to cart
   */
  static buildAmazonCartUrl(productUrl, params) {
    const asin = this.extractProductId(productUrl, /\/dp\/([A-Z0-9]{10})/)
    if (!asin) return this.addUTMTracking(productUrl, params)

    const quantity = params.quantity || 1
    return `https://www.amazon.nl/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=${quantity}`
  }

  /**
   * IKEA - Add to cart
   */
  static buildIkeaCartUrl(productUrl, params) {
    const productId = this.extractProductId(productUrl, /\/(\d{8})\//)
    if (!productId) return this.addUTMTracking(productUrl, params)

    return `https://www.ikea.nl/nl/shoppingcart/add/${productId}`
  }

  /**
   * Decathlon - Add to cart
   */
  static buildDecathlonCartUrl(productUrl, params) {
    const productId = this.extractProductId(productUrl, /_\/(\d+)\.html/)
    if (!productId) return this.addUTMTracking(productUrl, params)

    return `https://www.decathlon.nl/cart/add?productId=${productId}`
  }

  /**
   * Extract product ID from URL using regex
   */
  static extractProductId(url, regex) {
    const match = url.match(regex)
    return match ? match[1] : null
  }

  /**
   * Add UTM tracking to URL (fallback for unknown domains)
   */
  static addUTMTracking(url, params = {}) {
    try {
      const urlObj = new URL(url)
      
      // Add DealSense tracking
      urlObj.searchParams.set('utm_source', 'dealsense')
      urlObj.searchParams.set('utm_medium', 'comparison')
      urlObj.searchParams.set('utm_campaign', params.campaign || 'configurator')
      
      // Add ref parameter
      urlObj.searchParams.set('ref', 'dealsense')
      
      return urlObj.toString()
    } catch (error) {
      // If URL parsing fails, return original
      return url
    }
  }
}

module.exports = CartUrlBuilder
