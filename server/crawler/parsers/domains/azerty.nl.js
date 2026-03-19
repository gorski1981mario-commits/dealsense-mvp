// Azerty.nl Parser - NISZOWY IT/Gaming specialist
// Vaak 15-20% goedkoper voor gaming gear!

const cheerio = require('cheerio')
const CartUrlBuilder = require('../../lib/cart-url-builder')

module.exports = {
  name: 'azerty.nl',
  category: 'products',
  type: 'niszowy',

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
    const mainPrice = $('.product-price, .price-current').first().text().trim()
    const productUrl = $('link[rel="canonical"]').attr('href')
    const title = $('h1.product-title').text().trim()
    
    if (mainPrice && productUrl) {
      offers.push({
        seller: 'Azerty.nl',
        price: this.parsePrice(mainPrice),
        condition: 'new',
        shipping: 0, // Free shipping > €20
        rating: 4.7,
        reviews: this.parseReviews($),
        inStock: this.checkStock($),
        url: productUrl,
        cartUrl: CartUrlBuilder.buildCartUrl('azerty.nl', productUrl, { quantity: 1 }),
        title,
        dealScore: 8.8 // Gaming specialist = betere prijzen
      })
    }

    return {
      ean,
      source: 'azerty.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parseSearchResults($, searchQuery) {
    const offers = []

    $('.product-grid-item, .product-card').each((i, elem) => {
      const $elem = $(elem)
      const title = $elem.find('.product-name, h3').text().trim()
      const price = $elem.find('.price').text().trim()
      const url = $elem.find('a').attr('href')

      if (title && price && url) {
        const fullUrl = url.startsWith('http') ? url : `https://azerty.nl${url}`
        
        offers.push({
          seller: 'Azerty.nl',
          title,
          price: this.parsePrice(price),
          condition: 'new',
          shipping: 0,
          rating: 4.7,
          inStock: true,
          url: fullUrl,
          cartUrl: CartUrlBuilder.buildCartUrl('azerty.nl', fullUrl, { quantity: 1 }),
          dealScore: 8.8
        })
      }
    })

    return {
      source: 'azerty.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    const cleaned = priceStr.replace(/[€\s]/g, '').replace(',', '.').trim()
    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  },

  parseReviews($) {
    const reviewText = $('.review-count').text().trim()
    const match = reviewText.match(/(\d+)/)
    return match ? parseInt(match[1]) : 30
  },

  checkStock($) {
    const stockText = $('.stock-status').text().toLowerCase()
    return stockText.includes('op voorraad') || stockText.includes('in stock')
  }
}
