// Generic Parser for Niszowe Shops (NL)
// Works for 80%+ of small/medium NL e-commerce sites
// Simpler HTML structures = easier parsing = better coverage

const cheerio = require('cheerio')

module.exports = {
  name: 'generic-niszowe',
  category: 'products',
  
  /**
   * Parse product page from niszowe shop
   * Uses common selectors found in most NL e-commerce platforms
   */
  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { ean, searchQuery, url } = jobData
    
    // Try to detect page type
    const isProductPage = this.isProductPage($)
    
    if (isProductPage) {
      return this.parseProductPage($, ean, url)
    } else {
      return this.parseSearchResults($, searchQuery)
    }
  },
  
  /**
   * Detect if this is a product page
   */
  isProductPage($) {
    // Common indicators of product page
    const indicators = [
      $('.product-detail').length > 0,
      $('.product-info').length > 0,
      $('[itemtype*="Product"]').length > 0,
      $('.add-to-cart, .toevoegen').length > 0,
      $('.product-price').length > 0 && $('.product-title, h1.product').length > 0
    ]
    
    return indicators.filter(Boolean).length >= 2
  },
  
  /**
   * Parse single product page
   * Uses multiple selector strategies for maximum compatibility
   */
  parseProductPage($, ean, url) {
    const product = {
      ean: ean || this.extractEAN($),
      source: this.extractDomain(url),
      offers: []
    }
    
    // Extract price - try multiple common selectors
    const price = this.extractPrice($, [
      '.product-price',
      '.price',
      '[itemprop="price"]',
      '.prijs',
      '.product-prijs',
      '.sale-price',
      '.current-price',
      '.bedrag'
    ])
    
    // Extract title
    const title = this.extractText($, [
      'h1.product-title',
      'h1.product-name',
      '[itemprop="name"]',
      'h1',
      '.product-title',
      '.productnaam'
    ])
    
    // Extract availability
    const inStock = this.checkAvailability($)
    
    // Extract shipping cost
    const shipping = this.extractShipping($)
    
    // Extract seller name (usually shop name for niszowe)
    const seller = this.extractSeller($, url)
    
    // Extract rating if available
    const rating = this.extractRating($)
    
    // Extract image
    const image = this.extractImage($)
    
    if (price && title) {
      product.offers.push({
        seller,
        price,
        title,
        condition: 'new',
        shipping,
        inStock,
        rating,
        image,
        url
      })
    }
    
    return {
      ...product,
      scrapedAt: Date.now()
    }
  },
  
  /**
   * Parse search results page
   */
  parseSearchResults($, query) {
    const products = []
    
    // Common product list selectors
    const productSelectors = [
      '.product-item',
      '.product',
      '[itemtype*="Product"]',
      '.product-grid-item',
      '.product-list-item',
      '.artikel'
    ]
    
    let $products = $()
    for (const selector of productSelectors) {
      $products = $(selector)
      if ($products.length > 0) break
    }
    
    $products.each((i, el) => {
      const $el = $(el)
      
      const title = this.extractText($el, ['h2', 'h3', '.product-name', '.product-title', 'a'])
      const price = this.extractPrice($el, ['.price', '.prijs', '[itemprop="price"]'])
      const url = $el.find('a').first().attr('href')
      const image = $el.find('img').first().attr('src')
      
      if (title && price) {
        products.push({
          title,
          price,
          url: this.normalizeUrl(url),
          image,
          seller: this.extractDomain(url)
        })
      }
    })
    
    return {
      query,
      source: 'generic-niszowe',
      products: products.slice(0, 20),
      scrapedAt: Date.now()
    }
  },
  
  /**
   * Extract price from multiple possible selectors
   */
  extractPrice($context, selectors) {
    for (const selector of selectors) {
      const text = $context.find(selector).first().text().trim()
      if (text) {
        const price = this.parsePrice(text)
        if (price > 0) return price
      }
    }
    return 0
  },
  
  /**
   * Extract text from multiple possible selectors
   */
  extractText($context, selectors) {
    for (const selector of selectors) {
      const text = $context.find(selector).first().text().trim()
      if (text && text.length > 0) return text
    }
    return ''
  },
  
  /**
   * Parse price string to number
   */
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
   * Extract EAN from page
   */
  extractEAN($) {
    // Try multiple common locations
    const eanSelectors = [
      '[itemprop="gtin13"]',
      '[itemprop="ean"]',
      '.ean',
      '.product-ean'
    ]
    
    for (const selector of eanSelectors) {
      const ean = $(selector).text().trim()
      if (ean && /^\d{13}$/.test(ean)) return ean
    }
    
    return null
  },
  
  /**
   * Check product availability
   */
  checkAvailability($) {
    const stockIndicators = [
      $('.in-stock, .op-voorraad').length > 0,
      $('.out-of-stock, .niet-op-voorraad').length === 0,
      $('.add-to-cart, .toevoegen').length > 0,
      $('button[type="submit"]').text().toLowerCase().includes('bestel')
    ]
    
    return stockIndicators.filter(Boolean).length >= 2
  },
  
  /**
   * Extract shipping cost
   */
  extractShipping($) {
    const shippingText = this.extractText($, [
      '.shipping-cost',
      '.verzendkosten',
      '[itemprop="shippingDetails"]',
      '.delivery-cost'
    ])
    
    if (!shippingText) return 0
    
    if (/gratis|free|inclusief/i.test(shippingText)) return 0
    
    return this.parsePrice(shippingText)
  },
  
  /**
   * Extract seller name
   */
  extractSeller($, url) {
    // Try to get from page
    const seller = this.extractText($, [
      '.seller-name',
      '.shop-name',
      '[itemprop="seller"]'
    ])
    
    if (seller) return seller
    
    // Fallback to domain name
    return this.extractDomain(url)
  },
  
  /**
   * Extract rating
   */
  extractRating($) {
    const ratingText = this.extractText($, [
      '[itemprop="ratingValue"]',
      '.rating-value',
      '.beoordeling',
      '.stars'
    ])
    
    if (!ratingText) return 0
    
    const rating = parseFloat(ratingText.replace(',', '.'))
    return isNaN(rating) ? 0 : Math.min(rating, 5)
  },
  
  /**
   * Extract main product image
   */
  extractImage($) {
    const img = $('[itemprop="image"], .product-image img, .main-image').first()
    return img.attr('src') || img.attr('data-src') || ''
  },
  
  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0] // Get shop name
    } catch {
      return 'unknown'
    }
  },
  
  /**
   * Normalize relative URLs
   */
  normalizeUrl(url) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    if (url.startsWith('//')) return 'https:' + url
    return url // Will be handled by crawler
  }
}
