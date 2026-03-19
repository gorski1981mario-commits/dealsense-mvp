// UNIVERSAL NISZOWY PARSER
// Obsługuje 450+ małych sklepów bez dedykowanych parserów
// KLUCZOWE dla 50-60% przebić cenowych!

const cheerio = require('cheerio')
const CartUrlBuilder = require('../lib/cart-url-builder')

module.exports = {
  name: 'universal-niszowy',
  category: 'products',
  type: 'niszowy-universal',

  /**
   * Universal parse - próbuje różne strategie
   */
  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { ean, searchQuery, url } = jobData

    // Detect page type
    const isProductPage = this.detectProductPage($)
    
    if (isProductPage) {
      return this.parseProductPage($, ean, url)
    } else {
      return this.parseSearchResults($, searchQuery, url)
    }
  },

  /**
   * Detect if it's a product page
   */
  detectProductPage($) {
    const indicators = [
      $('.product-price, .price, [itemprop="price"]').length > 0,
      $('.product-title, h1.product, [itemprop="name"]').length > 0,
      $('.add-to-cart, .buy-button, button[type="submit"]').length > 0,
      $('.product-description, .description').length > 0,
      $('.product-image, .main-image, [itemprop="image"]').length > 0
    ]
    
    return indicators.filter(Boolean).length >= 3
  },

  /**
   * Parse product page - universal selectors
   */
  parseProductPage($, ean, url) {
    const offers = []
    
    // Extract product info using multiple strategies
    const title = this.extractTitle($)
    const price = this.extractPrice($)
    const seller = this.extractSeller($, url)
    const inStock = this.checkStock($)
    const shipping = this.extractShipping($)
    const rating = this.extractRating($)
    const reviews = this.extractReviews($)
    
    if (price > 0) {
      offers.push({
        seller,
        title,
        price,
        condition: 'new',
        shipping,
        rating,
        reviews,
        inStock,
        url,
        cartUrl: CartUrlBuilder.buildCartUrl(seller, url, { quantity: 1 }),
        dealScore: 8.5, // Niszowy = vaak betere deals
        source: 'niszowy'
      })
    }

    return {
      ean,
      source: seller,
      offers,
      scrapedAt: Date.now()
    }
  },

  /**
   * Parse search results - universal selectors
   */
  parseSearchResults($, searchQuery, url) {
    const offers = []
    const seller = this.extractSeller($, url)

    // Try multiple common product list selectors
    const productSelectors = [
      '.product-item',
      '.product-card',
      '.product',
      '.item',
      '[itemtype*="Product"]',
      '.listing-item',
      '.search-result',
      '.grid-item'
    ]

    let $products = $()
    for (const selector of productSelectors) {
      $products = $(selector)
      if ($products.length > 0) break
    }

    $products.each((i, elem) => {
      const $elem = $(elem)
      
      const title = this.extractTitleFromElement($elem)
      const price = this.extractPriceFromElement($elem)
      const productUrl = this.extractUrlFromElement($elem, url)
      
      if (title && price > 0 && productUrl) {
        offers.push({
          seller,
          title,
          price,
          condition: 'new',
          shipping: 0,
          rating: 4.2,
          reviews: 10,
          inStock: true,
          url: productUrl,
          cartUrl: CartUrlBuilder.buildCartUrl(seller, productUrl, { quantity: 1 }),
          dealScore: 8.5,
          source: 'niszowy'
        })
      }
    })

    return {
      source: seller,
      offers,
      scrapedAt: Date.now()
    }
  },

  /**
   * Extract title - multiple strategies
   */
  extractTitle($) {
    const selectors = [
      'h1.product-title',
      'h1.product-name',
      'h1[itemprop="name"]',
      '.product-title',
      '.product-name',
      'h1',
      '[itemprop="name"]'
    ]

    for (const selector of selectors) {
      const title = $(selector).first().text().trim()
      if (title && title.length > 3) return title
    }

    return 'Product'
  },

  extractTitleFromElement($elem) {
    const selectors = [
      '.product-title',
      '.product-name',
      'h2',
      'h3',
      'a',
      '[itemprop="name"]'
    ]

    for (const selector of selectors) {
      const title = $elem.find(selector).first().text().trim()
      if (title && title.length > 3) return title
    }

    return ''
  },

  /**
   * Extract price - multiple strategies
   */
  extractPrice($) {
    const selectors = [
      '.product-price',
      '.price',
      '[itemprop="price"]',
      '.price-current',
      '.sale-price',
      '.final-price',
      '.amount'
    ]

    for (const selector of selectors) {
      const priceText = $(selector).first().text().trim()
      const price = this.parsePrice(priceText)
      if (price > 0) return price
    }

    return 0
  },

  extractPriceFromElement($elem) {
    const selectors = [
      '.price',
      '.product-price',
      '[itemprop="price"]',
      '.amount'
    ]

    for (const selector of selectors) {
      const priceText = $elem.find(selector).first().text().trim()
      const price = this.parsePrice(priceText)
      if (price > 0) return price
    }

    return 0
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/gratis|free|inclusief/gi, '0')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
      .trim()
    
    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  },

  /**
   * Extract seller from domain
   */
  extractSeller($, url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    } catch {
      return 'Niszowy Shop'
    }
  },

  /**
   * Extract URL from element
   */
  extractUrlFromElement($elem, baseUrl) {
    const href = $elem.find('a').first().attr('href')
    if (!href) return ''
    
    try {
      if (href.startsWith('http')) return href
      const base = new URL(baseUrl)
      return `${base.protocol}//${base.hostname}${href.startsWith('/') ? '' : '/'}${href}`
    } catch {
      return href
    }
  },

  /**
   * Check stock availability
   */
  checkStock($) {
    const stockSelectors = [
      '.stock-status',
      '.availability',
      '[itemprop="availability"]',
      '.in-stock',
      '.out-of-stock'
    ]

    for (const selector of stockSelectors) {
      const stockText = $(selector).text().toLowerCase()
      if (stockText.includes('niet op voorraad') || 
          stockText.includes('uitverkocht') || 
          stockText.includes('out of stock')) {
        return false
      }
      if (stockText.includes('op voorraad') || 
          stockText.includes('in stock') || 
          stockText.includes('beschikbaar')) {
        return true
      }
    }

    // Default: assume in stock for niszowy shops
    return true
  },

  /**
   * Extract shipping cost
   */
  extractShipping($) {
    const shippingSelectors = [
      '.shipping-cost',
      '.delivery-cost',
      '.verzendkosten',
      '[itemprop="shippingDetails"]'
    ]

    for (const selector of shippingSelectors) {
      const shippingText = $(selector).text().toLowerCase()
      if (shippingText.includes('gratis') || shippingText.includes('free')) {
        return 0
      }
      const cost = this.parsePrice(shippingText)
      if (cost > 0) return cost
    }

    return 5.95 // Default shipping for niszowy shops
  },

  /**
   * Extract rating
   */
  extractRating($) {
    const ratingSelectors = [
      '[itemprop="ratingValue"]',
      '.rating-value',
      '.star-rating',
      '.review-rating'
    ]

    for (const selector of ratingSelectors) {
      const ratingText = $(selector).text().trim()
      const rating = parseFloat(ratingText)
      if (rating > 0 && rating <= 5) return rating
    }

    return 4.2 // Default rating for niszowy shops
  },

  /**
   * Extract review count
   */
  extractReviews($) {
    const reviewSelectors = [
      '[itemprop="reviewCount"]',
      '.review-count',
      '.reviews-count',
      '.aantal-reviews'
    ]

    for (const selector of reviewSelectors) {
      const reviewText = $(selector).text().trim()
      const match = reviewText.match(/(\d+)/)
      if (match) return parseInt(match[1])
    }

    return 10 // Default review count for niszowy shops
  }
}
