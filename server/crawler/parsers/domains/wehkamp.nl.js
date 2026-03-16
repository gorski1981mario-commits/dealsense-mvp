// Wehkamp.nl Parser - Largest fashion retailer NL
// Mode, Schoenen, Wonen

const cheerio = require('cheerio')

module.exports = {
  name: 'wehkamp.nl',
  category: 'products',
  subcategories: ['fashion', 'shoes', 'home'],

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { searchQuery, filters } = jobData

    return this.parseSearchResults($, searchQuery, filters)
  },

  parseSearchResults($, query, filters = {}) {
    const products = []

    $('.product-item, .product-card, [data-test="product"]').each((i, el) => {
      const title = $(el).find('.product-title, h3, [data-test="product-title"]').text().trim()
      const price = $(el).find('.price, [data-test="price"]').text().trim()
      const originalPrice = $(el).find('.original-price, .was-price').text().trim()
      const discount = $(el).find('.discount, .sale-percentage').text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')
      const brand = $(el).find('.brand, [data-test="brand"]').text().trim()
      const rating = $(el).find('.rating, .stars').attr('data-rating')
      const sizes = this.extractSizes($, el)
      const colors = this.extractColors($, el)

      if (title && price) {
        const product = {
          title,
          price: this.parsePrice(price),
          originalPrice: this.parsePrice(originalPrice),
          discount: this.parseDiscount(discount),
          url: url?.startsWith('http') ? url : `https://www.wehkamp.nl${url}`,
          image,
          brand,
          rating: parseFloat(rating) || 0,
          seller: 'Wehkamp',
          // Fashion-specific
          sizes: sizes.length > 0 ? sizes : null,
          colors: colors.length > 0 ? colors : null,
          inStock: !$(el).find('.out-of-stock').length
        }

        // Apply filters
        if (this.matchesFilters(product, filters)) {
          products.push(product)
        }
      }
    })

    return {
      query,
      source: 'wehkamp.nl',
      products: products.slice(0, 20),
      filters: this.extractAvailableFilters($),
      scrapedAt: Date.now()
    }
  },

  extractSizes($, element) {
    const sizes = []
    $(element).find('.size-option, [data-test="size"]').each((i, el) => {
      const size = $(el).text().trim()
      if (size) sizes.push(size)
    })
    return sizes
  },

  extractColors($, element) {
    const colors = []
    $(element).find('.color-option, [data-test="color"]').each((i, el) => {
      const color = $(el).attr('data-color') || $(el).attr('title')
      if (color) colors.push(color)
    })
    return colors
  },

  extractAvailableFilters($) {
    const filters = {
      brands: [],
      sizes: [],
      colors: [],
      priceRanges: [],
      categories: []
    }

    // Extract from filter sidebar
    $('.filter-brand option, .brand-filter input').each((i, el) => {
      const brand = $(el).val() || $(el).text().trim()
      if (brand) filters.brands.push(brand)
    })

    $('.filter-size option').each((i, el) => {
      const size = $(el).val()
      if (size) filters.sizes.push(size)
    })

    return filters
  },

  matchesFilters(product, filters) {
    // Brand filter
    if (filters.brand && product.brand !== filters.brand) {
      return false
    }

    // Price range filter
    if (filters.minPrice && product.price < filters.minPrice) {
      return false
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false
    }

    // Size filter
    if (filters.size && product.sizes && !product.sizes.includes(filters.size)) {
      return false
    }

    // Color filter
    if (filters.color && product.colors && !product.colors.includes(filters.color)) {
      return false
    }

    // Discount filter
    if (filters.onSale && !product.discount) {
      return false
    }

    return true
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
  },

  parseDiscount(discountStr) {
    if (!discountStr) return 0
    const match = discountStr.match(/(\d+)%/)
    return match ? parseInt(match[1]) : 0
  }
}
