// Coolblue.nl Parser - Premium electronics retailer
// Known for excellent service and competitive prices

const cheerio = require('cheerio')
const CartUrlBuilder = require('../../lib/cart-url-builder')

module.exports = {
  name: 'coolblue.nl',
  category: 'products',

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

    // Main price
    const price = $('.sales-price__current, .product-order-summary__price').first().text().trim()
    const title = $('h1.product-title, h1').first().text().trim()
    const rating = $('.review-rating__score').text().trim()
    const reviews = $('.review-rating__count').text().trim()
    const inStock = !$('.out-of-stock, .not-available').length

    const productUrl = $('link[rel="canonical"]').attr('href')
    
    if (price && productUrl) {
      offers.push({
        seller: 'Coolblue',
        price: this.parsePrice(price),
        condition: 'new',
        shipping: 0, // Free shipping
        rating: parseFloat(rating) || 4.5,
        reviews: parseInt(reviews) || 0,
        inStock,
        url: productUrl,
        cartUrl: CartUrlBuilder.buildCartUrl('coolblue.nl', productUrl, { quantity: 1 }),
        title
      })
    }

    // Check for "Tweedehands" (used) offers
    $('.used-product-item').each((i, el) => {
      const usedPrice = $(el).find('.used-price').text().trim()
      const condition = $(el).find('.condition-label').text().trim()

      const usedUrl = $(el).find('a').attr('href')
      
      if (usedPrice && usedUrl) {
        offers.push({
          seller: 'Coolblue Tweedehands',
          price: this.parsePrice(usedPrice),
          condition: 'used',
          shipping: 0,
          rating: 4.0,
          reviews: 0,
          inStock: true,
          url: usedUrl,
          cartUrl: CartUrlBuilder.buildCartUrl('coolblue.nl', usedUrl, { quantity: 1 })
        })
      }
    })

    return {
      ean,
      source: 'coolblue.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parseSearchResults($, query) {
    const products = []

    $('.product-card, .product').each((i, el) => {
      const title = $(el).find('.product-title, h3').text().trim()
      const price = $(el).find('.sales-price, .product-price').text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')
      const rating = $(el).find('.review-rating__score').text().trim()

      if (title && price && url) {
        const fullUrl = url?.startsWith('http') ? url : `https://www.coolblue.nl${url}`
        products.push({
          title,
          price: this.parsePrice(price),
          url: fullUrl,
          cartUrl: CartUrlBuilder.buildCartUrl('coolblue.nl', fullUrl, { quantity: 1 }),
          image,
          rating: parseFloat(rating) || 0,
          seller: 'Coolblue'
        })
      }
    })

    return {
      query,
      source: 'coolblue.nl',
      products: products.slice(0, 20),
      scrapedAt: Date.now()
    }
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .replace(/\.-$/, '')
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  }
}
