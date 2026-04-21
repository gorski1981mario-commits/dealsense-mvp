// Amazon.nl Parser - International marketplace
// Requires careful anti-bot handling

const cheerio = require('cheerio')

module.exports = {
  name: 'amazon.nl',
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

    // Main Amazon price
    const mainPrice = $('#priceblock_ourprice, .a-price .a-offscreen, #price_inside_buybox').first().text().trim()
    const title = $('#productTitle, h1.product-title').first().text().trim()
    const rating = $('.a-icon-star .a-icon-alt, #acrPopover').first().text().trim()
    const reviews = $('#acrCustomerReviewText').text().trim()

    if (mainPrice) {
      offers.push({
        seller: 'Amazon.nl',
        price: this.parsePrice(mainPrice),
        condition: 'new',
        shipping: 0,
        rating: this.parseRating(rating),
        reviews: this.parseReviews(reviews),
        inStock: !$('#availability .a-color-state').text().toLowerCase().includes('niet beschikbaar'),
        url: $('link[rel="canonical"]').attr('href'),
        title: title.trim()
      })
    }

    // Other sellers (Buy Box)
    $('#mbc-price-1, .olp-link').each((i, el) => {
      const price = $(el).find('.a-price .a-offscreen').text().trim()
      if (price) {
        offers.push({
          seller: 'Amazon Marketplace',
          price: this.parsePrice(price),
          condition: 'new',
          shipping: 0,
          rating: 4.0,
          reviews: 0,
          inStock: true,
          url: $(el).attr('href')
        })
      }
    })

    return {
      ean,
      source: 'amazon.nl',
      offers,
      scrapedAt: Date.now()
    }
  },

  parseSearchResults($, query) {
    const products = []

    $('[data-component-type="s-search-result"], .s-result-item').each((i, el) => {
      const title = $(el).find('h2 a span, .s-title-instructions-style').text().trim()
      const price = $(el).find('.a-price .a-offscreen').first().text().trim()
      const url = $(el).find('h2 a, .s-title-instructions-style').attr('href')
      const image = $(el).find('img.s-image').attr('src')
      const rating = $(el).find('.a-icon-star-small .a-icon-alt').text().trim()

      if (title && price) {
        products.push({
          title,
          price: this.parsePrice(price),
          url: url?.startsWith('http') ? url : `https://www.amazon.nl${url}`,
          image,
          rating: this.parseRating(rating),
          seller: 'Amazon.nl'
        })
      }
    })

    return {
      query,
      source: 'amazon.nl',
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
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  },

  parseRating(ratingStr) {
    if (!ratingStr) return 0
    const match = ratingStr.match(/(\d+[.,]\d+)/)
    return match ? parseFloat(match[1].replace(',', '.')) : 0
  },

  parseReviews(reviewsStr) {
    if (!reviewsStr) return 0
    const match = reviewsStr.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }
}
