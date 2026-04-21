// MediaMarkt.nl Parser - Electronics & Appliances
// Major electronics retailer in NL

const cheerio = require('cheerio')

module.exports = {
  name: 'mediamarkt.nl',
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
    const price = $('.price-box__price, [data-test="mms-product-price"]').first().text().trim()
    const title = $('h1[data-test="mms-product-title"], h1.product-title').first().text().trim()
    const rating = $('.rating-stars__value, [data-test="mms-rating"]').text().trim()
    const inStock = $('.availability-status, [data-test="mms-stock"]').text().toLowerCase().includes('voorraad')

    if (price) {
      offers.push({
        seller: 'MediaMarkt',
        price: this.parsePrice(price),
        condition: 'new',
        shipping: 0,
        rating: parseFloat(rating) || 4.0,
        reviews: 0,
        inStock,
        url: $('link[rel="canonical"]').attr('href'),
        title
      })
    }

    // Marketplace offers (if any)
    $('.marketplace-offer').each((i, el) => {
      const seller = $(el).find('.seller-name').text().trim()
      const offerPrice = $(el).find('.offer-price').text().trim()

      if (seller && offerPrice) {
        offers.push({
          seller,
          price: this.parsePrice(offerPrice),
          condition: 'new',
          shipping: 0,
          rating: 4.0,
          reviews: 0,
          inStock: true,
          url: $(el).find('a').attr('href')
        })
      }
    })

    return {
      ean,
      source: 'mediamarkt.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parseSearchResults($, query) {
    const products = []

    $('.product-wrapper, [data-test="mms-product-item"]').each((i, el) => {
      const title = $(el).find('.product-title, h3').text().trim()
      const price = $(el).find('.price, [data-test="mms-product-price"]').text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')

      if (title && price) {
        products.push({
          title,
          price: this.parsePrice(price),
          url: url?.startsWith('http') ? url : `https://www.mediamarkt.nl${url}`,
          image,
          rating: 0,
          seller: 'MediaMarkt'
        })
      }
    })

    return {
      query,
      source: 'mediamarkt.nl',
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
