// IKEA.nl Parser - Furniture & Home #1 NL
// Meubels, Wonen, Keuken

const cheerio = require('cheerio')

module.exports = {
  name: 'ikea.nl',
  category: 'products',
  subcategory: 'furniture',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { searchQuery, filters } = jobData

    return this.parseSearchResults($, searchQuery, filters)
  },

  parseSearchResults($, query, filters = {}) {
    const products = []

    $('.product-fragment, .plp-product-list__item, [data-testid="plp-product-card"]').each((i, el) => {
      const title = $(el).find('.plp-product__name, h3').text().trim()
      const price = $(el).find('.plp-price__integer, .price').text().trim()
      const priceDecimal = $(el).find('.plp-price__decimal').text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')
      const category = $(el).find('.plp-product__category').text().trim()
      const inStock = !$(el).find('.out-of-stock, .niet-beschikbaar').length
      
      // IKEA specific
      const articleNumber = $(el).find('[data-article-number]').attr('data-article-number')
      const dimensions = $(el).find('.dimensions, .afmetingen').text().trim()
      const colors = this.extractColors($, el)

      if (title && price) {
        const fullPrice = this.parsePrice(price + (priceDecimal ? `.${priceDecimal}` : ''))
        
        const product = {
          title,
          price: fullPrice,
          url: url?.startsWith('http') ? url : `https://www.ikea.com/nl${url}`,
          image,
          category,
          seller: 'IKEA',
          articleNumber,
          dimensions,
          colors: colors.length > 0 ? colors : null,
          inStock,
          rating: 0 // IKEA doesn't show ratings on listing
        }

        if (this.matchesFilters(product, filters)) {
          products.push(product)
        }
      }
    })

    return {
      query,
      source: 'ikea.nl',
      products: products.slice(0, 20),
      filters: this.extractAvailableFilters($),
      scrapedAt: Date.now()
    }
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
      categories: [],
      priceRanges: [
        { min: 0, max: 50, label: '€0 - €50' },
        { min: 50, max: 100, label: '€50 - €100' },
        { min: 100, max: 250, label: '€100 - €250' },
        { min: 250, max: 500, label: '€250 - €500' },
        { min: 500, max: 99999, label: '€500+' }
      ],
      rooms: ['Woonkamer', 'Slaapkamer', 'Keuken', 'Badkamer', 'Kantoor'],
      colors: [],
      inStock: true
    }
  },

  matchesFilters(product, filters) {
    if (filters.minPrice && product.price < filters.minPrice) return false
    if (filters.maxPrice && product.price > filters.maxPrice) return false
    if (filters.category && product.category !== filters.category) return false
    if (filters.inStock && !product.inStock) return false
    if (filters.color && product.colors && !product.colors.includes(filters.color)) return false

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
  }
}
