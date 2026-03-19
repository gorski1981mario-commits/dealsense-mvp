// Beslist.nl Parser - NISZOWY price comparison aggregator
// Aggregeert 1000+ kleine shops = MEGA przebicia!

const cheerio = require('cheerio')
const CartUrlBuilder = require('../../lib/cart-url-builder')

module.exports = {
  name: 'beslist.nl',
  category: 'products',
  type: 'niszowy-aggregator', // Aggreguje małe sklepy!

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { ean, searchQuery } = jobData

    if (ean) {
      return this.parseProductPage($, ean)
    }

    return this.parseSearchResults($, searchQuery)
  },

  parseProductPage($, ean) {
    const offers = []
    
    // Beslist shows multiple shop offers
    $('.shop-offer, .product-offer').each((i, elem) => {
      const $elem = $(elem)
      const seller = $elem.find('.shop-name').text().trim()
      const price = $elem.find('.price').text().trim()
      const url = $elem.find('a').attr('href')
      const shipping = $elem.find('.shipping-cost').text().trim()

      if (seller && price && url) {
        offers.push({
          seller: seller || 'Onbekende shop',
          price: this.parsePrice(price),
          condition: 'new',
          shipping: this.parseShipping(shipping),
          rating: 4.2, // Gemiddeld voor kleine shops
          reviews: 10,
          inStock: true,
          url,
          cartUrl: url, // Direct shop URL
          dealScore: 9.0 // Aggregator = vaak beste prijzen!
        })
      }
    })

    return {
      ean,
      source: 'beslist.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parseSearchResults($, searchQuery) {
    const offers = []

    $('.product-item').each((i, elem) => {
      const $elem = $(elem)
      const title = $elem.find('.product-title, h2').text().trim()
      const price = $elem.find('.price').text().trim()
      const url = $elem.find('a').attr('href')
      const shopCount = $elem.find('.shop-count').text().trim()

      if (title && price && url) {
        offers.push({
          seller: `Beslist.nl (${shopCount || '10+'} shops)`,
          title,
          price: this.parsePrice(price),
          condition: 'new',
          shipping: 0,
          rating: 4.2,
          inStock: true,
          url,
          cartUrl: url,
          dealScore: 9.0
        })
      }
    })

    return {
      source: 'beslist.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    const cleaned = priceStr.replace(/[€\s]/g, '').replace(',', '.').replace(/vanaf|from/gi, '').trim()
    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  },

  parseShipping(shippingStr) {
    if (!shippingStr) return 0
    if (shippingStr.toLowerCase().includes('gratis') || shippingStr.toLowerCase().includes('free')) return 0
    const cleaned = shippingStr.replace(/[€\s]/g, '').replace(',', '.').trim()
    const cost = parseFloat(cleaned)
    return isNaN(cost) ? 5.95 : cost
  }
}
