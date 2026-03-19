// Alternate.nl Parser - NISZOWY sklep elektroniki
// Często 10-15% goedkoper dan giganten!

const cheerio = require('cheerio')
const CartUrlBuilder = require('../../lib/cart-url-builder')

module.exports = {
  name: 'alternate.nl',
  category: 'products',
  type: 'niszowy', // KLUCZOWE dla 50/50 strategii

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
    const mainPrice = $('.price').first().text().trim()
    const productUrl = $('link[rel="canonical"]').attr('href')
    const title = $('h1.product-name').text().trim()
    
    if (mainPrice && productUrl) {
      offers.push({
        seller: 'Alternate.nl',
        price: this.parsePrice(mainPrice),
        condition: 'new',
        shipping: this.parseShipping($),
        rating: 4.6,
        reviews: this.parseReviews($),
        inStock: this.checkStock($),
        url: productUrl,
        cartUrl: CartUrlBuilder.buildCartUrl('alternate.nl', productUrl, { quantity: 1 }),
        title,
        dealScore: 8.5 // Niszowy = często betere deals
      })
    }

    return {
      ean,
      source: 'alternate.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parseSearchResults($, searchQuery) {
    const offers = []

    $('.product-item, .listing-product').each((i, elem) => {
      const $elem = $(elem)
      const title = $elem.find('.product-name, h2').text().trim()
      const price = $elem.find('.price').text().trim()
      const url = $elem.find('a').attr('href')

      if (title && price && url) {
        const fullUrl = url.startsWith('http') ? url : `https://www.alternate.nl${url}`
        
        offers.push({
          seller: 'Alternate.nl',
          title,
          price: this.parsePrice(price),
          condition: 'new',
          shipping: 0,
          rating: 4.6,
          inStock: true,
          url: fullUrl,
          cartUrl: CartUrlBuilder.buildCartUrl('alternate.nl', fullUrl, { quantity: 1 }),
          dealScore: 8.5
        })
      }
    })

    return {
      source: 'alternate.nl',
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

  parseShipping($) {
    const shippingText = $('.shipping-info, .delivery-info').text().toLowerCase()
    if (shippingText.includes('gratis') || shippingText.includes('free')) return 0
    return 6.95 // Standard Alternate shipping
  },

  parseReviews($) {
    const reviewText = $('.reviews-count').text().trim()
    const match = reviewText.match(/(\d+)/)
    return match ? parseInt(match[1]) : 50
  },

  checkStock($) {
    const stockText = $('.availability, .stock-info').text().toLowerCase()
    return !stockText.includes('niet op voorraad') && !stockText.includes('uitverkocht')
  }
}
