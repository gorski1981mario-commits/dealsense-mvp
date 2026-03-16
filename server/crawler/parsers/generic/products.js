// Generic Product Parser - Fallback for unknown domains
// Uses common patterns found across e-commerce sites

const cheerio = require('cheerio')

module.exports = {
  name: 'generic-product',
  category: 'products',

  parse(html, jobData) {
    const $ = cheerio.load(html)

    // Try common selectors for product data
    const offers = []

    // Common price selectors
    const priceSelectors = [
      '.price',
      '.product-price',
      '.sale-price',
      '.current-price',
      '[itemprop="price"]',
      '.price-current',
      '.product__price'
    ]

    // Common title selectors
    const titleSelectors = [
      'h1',
      '.product-title',
      '.product-name',
      '[itemprop="name"]',
      '.product__title'
    ]

    // Try to find price
    let price = null
    for (const selector of priceSelectors) {
      const priceEl = $(selector).first()
      if (priceEl.length) {
        price = this.parsePrice(priceEl.text())
        if (price > 0) break
      }
    }

    // Try to find title
    let title = null
    for (const selector of titleSelectors) {
      const titleEl = $(selector).first()
      if (titleEl.length) {
        title = titleEl.text().trim()
        if (title) break
      }
    }

    // If we found price, create offer
    if (price && price > 0) {
      const domain = new URL(jobData.url).hostname.replace('www.', '')
      
      offers.push({
        seller: domain,
        price,
        condition: 'new',
        shipping: 0,
        rating: 0,
        reviews: 0,
        inStock: true,
        url: jobData.url,
        title
      })
    }

    return {
      ean: jobData.ean,
      source: 'generic',
      offers,
      scrapedAt: Date.now(),
      warning: 'Parsed with generic parser - may be incomplete'
    }
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    // Remove all non-numeric except comma and dot
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/[^\d,.-]/g, '')
      .replace(',', '.')
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  }
}
