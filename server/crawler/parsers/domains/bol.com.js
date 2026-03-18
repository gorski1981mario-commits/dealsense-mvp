// Bol.com Parser - Największy marketplace NL
// Handles product pages and search results

const cheerio = require('cheerio')

module.exports = {
  name: 'bol.com',
  category: 'products',

  /**
   * Parse Bol.com product/search page
   */
  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { ean, searchQuery } = jobData

    // If EAN provided, parse product page
    if (ean) {
      return this.parseProductPage($, ean)
    }

    // Otherwise parse search results
    return this.parseSearchResults($, searchQuery)
  },

  /**
   * Parse single product page
   */
  parseProductPage($, ean) {
    const offers = []

    // Main offer (Bol.com direct)
    const mainPrice = $('.promo-price, .price-block__highlight').first().text().trim()
    const productUrl = $('link[rel="canonical"]').attr('href')
    
    if (mainPrice && productUrl) {
      offers.push({
        seller: 'Bol.com',
        price: this.parsePrice(mainPrice),
        condition: 'new',
        shipping: 0, // Free shipping on Bol
        rating: 4.5,
        reviews: 1000,
        inStock: true,
        url: productUrl,
        cartUrl: CartUrlBuilder.buildCartUrl('bol.com', productUrl, { quantity: 1 })
      })
    }

    // Marketplace offers
    $('.offer-list__item').each((i, el) => {
      const seller = $(el).find('.offer-seller__name').text().trim()
      const price = $(el).find('.offer-price').text().trim()
      const condition = $(el).find('.offer-condition').text().trim()
      const shipping = $(el).find('.offer-shipping').text().trim()
      const offerUrl = $(el).find('a').attr('href')

      if (seller && price && offerUrl) {
        offers.push({
          seller,
          price: this.parsePrice(price),
          condition: condition.toLowerCase().includes('nieuw') ? 'new' : 'used',
          shipping: this.parsePrice(shipping) || 0,
          rating: 4.0,
          reviews: 0,
          inStock: true,
          url: offerUrl,
          cartUrl: CartUrlBuilder.buildCartUrl('bol.com', offerUrl, { quantity: 1 })
        })
      }
    })

    return {
      ean,
      source: 'bol.com',
      offers: offers.slice(0, 10), // Max 10 offers
      scrapedAt: Date.now()
    }
  },

  /**
   * Parse search results
   */
  parseSearchResults($, query) {
    const products = []

    $('.product-item, .js_item_root').each((i, el) => {
      const title = $(el).find('.product-title, h2 a').text().trim()
      const price = $(el).find('.promo-price, .product-price').text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')
      const rating = $(el).find('.rating__value').text().trim()

      if (title && price && url) {
        const fullUrl = url?.startsWith('http') ? url : `https://www.bol.com${url}`
        products.push({
          title,
          price: this.parsePrice(price),
          url: fullUrl,
          cartUrl: CartUrlBuilder.buildCartUrl('bol.com', fullUrl, { quantity: 1 }),
          image,
          rating: parseFloat(rating) || 0,
          seller: 'Bol.com'
        })
      }
    })

    return {
      query,
      source: 'bol.com',
      products: products.slice(0, 20), // Max 20 products
      scrapedAt: Date.now()
    }
  },

  /**
   * Parse price string to number
   */
  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    // Remove currency symbols and text
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/gratis|free/gi, '0')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  }
}
