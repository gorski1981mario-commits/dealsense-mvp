// Decathlon.nl Parser - Sports & Outdoor #1 NL
// Sport, Fitness, Outdoor

const cheerio = require('cheerio')

module.exports = {
  name: 'decathlon.nl',
  category: 'products',
  subcategory: 'sports',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { searchQuery, filters } = jobData

    return this.parseSearchResults($, searchQuery, filters)
  },

  parseSearchResults($, query, filters = {}) {
    const products = []

    $('.product-card, [data-testid="product-card"]').each((i, el) => {
      const title = $(el).find('.product-title, h3').text().trim()
      const price = $(el).find('.price, [data-testid="price"]').text().trim()
      const originalPrice = $(el).find('.original-price, .was-price').text().trim()
      const discount = $(el).find('.discount-percentage').text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')
      const rating = $(el).find('.rating-value, [data-rating]').text().trim()
      const reviews = $(el).find('.review-count').text().trim()
      
      // Sports specific
      const sport = $(el).find('.sport-category, [data-sport]').text().trim()
      const sizes = this.extractSizes($, el)
      const colors = this.extractColors($, el)
      const inStock = !$(el).find('.out-of-stock, .niet-beschikbaar').length

      if (title && price) {
        const product = {
          title,
          price: this.parsePrice(price),
          originalPrice: this.parsePrice(originalPrice),
          discount: this.parseDiscount(discount),
          url: url?.startsWith('http') ? url : `https://www.decathlon.nl${url}`,
          image,
          rating: parseFloat(rating) || 0,
          reviews: this.parseReviews(reviews),
          seller: 'Decathlon',
          // Sports specific
          sport,
          sizes: sizes.length > 0 ? sizes : null,
          colors: colors.length > 0 ? colors : null,
          inStock
        }

        if (this.matchesFilters(product, filters)) {
          products.push(product)
        }
      }
    })

    return {
      query,
      source: 'decathlon.nl',
      products: products.slice(0, 20),
      filters: this.extractAvailableFilters($),
      scrapedAt: Date.now()
    }
  },

  extractSizes($, element) {
    const sizes = []
    $(element).find('.size-option, [data-size]').each((i, el) => {
      const size = $(el).text().trim() || $(el).attr('data-size')
      if (size) sizes.push(size)
    })
    return sizes
  },

  extractColors($, element) {
    const colors = []
    $(element).find('.color-option, [data-color]').each((i, el) => {
      const color = $(el).attr('data-color') || $(el).attr('title')
      if (color) colors.push(color)
    })
    return colors
  },

  extractAvailableFilters($) {
    return {
      sports: ['Hardlopen', 'Fietsen', 'Zwemmen', 'Fitness', 'Voetbal', 'Tennis', 'Wandelen'],
      brands: ['Decathlon', 'Kalenji', 'Domyos', 'Quechua', 'B\'Twin'],
      priceRanges: [
        { min: 0, max: 25, label: '€0 - €25' },
        { min: 25, max: 50, label: '€25 - €50' },
        { min: 50, max: 100, label: '€50 - €100' },
        { min: 100, max: 200, label: '€100 - €200' },
        { min: 200, max: 99999, label: '€200+' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [],
      gender: ['Heren', 'Dames', 'Kinderen', 'Unisex'],
      inStock: true,
      onSale: false
    }
  },

  matchesFilters(product, filters) {
    if (filters.minPrice && product.price < filters.minPrice) return false
    if (filters.maxPrice && product.price > filters.maxPrice) return false
    if (filters.sport && product.sport !== filters.sport) return false
    if (filters.size && product.sizes && !product.sizes.includes(filters.size)) return false
    if (filters.color && product.colors && !product.colors.includes(filters.color)) return false
    if (filters.inStock && !product.inStock) return false
    if (filters.onSale && !product.discount) return false

    return true
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  },

  parseDiscount(discountStr) {
    if (!discountStr) return 0
    const match = discountStr.match(/(\d+)%/)
    return match ? parseInt(match[1]) : 0
  },

  parseReviews(reviewsStr) {
    if (!reviewsStr) return 0
    const match = reviewsStr.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }
}
