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

    // Otherwise parse search results (pass raw HTML for regex fallback)
    return this.parseSearchResults($, searchQuery, html)
  },

  /**
   * Parse single product page
   */
  parseProductPage($, ean) {
    const offers = []

    // Main offer (Bol.com direct) - zaktualizowane selektory
    const mainPrice = $('.js-price-amount, [data-test="price-amount"], .promo-price, .price-block__highlight').first().text().trim()
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
   * Parse search results page
   */
  parseSearchResults($, searchQuery, html = '') {
    const offers = []

    // Product cards
    $('.product-item, .product-card, [data-test="product-item"]').each((i, el) => {
      const title = $(el).find('.product-title, h2, h3').first().text().trim()
      const price = $(el).find('.promo-price, .price-block__highlight, .product-price').first().text().trim()
      const url = $(el).find('a').first().attr('href')
      const image = $(el).find('img').first().attr('src')
      const rating = $(el).find('.rating, [data-test="rating"]').first().text().trim()

      if (title && price && url) {
        offers.push({
          seller: 'Bol.com',
          title,
          price: this.parsePrice(price),
          url: url.startsWith('http') ? url : `https://www.bol.com${url}`,
          thumbnail: image,
          rating: this.parseRating(rating),
          reviews: 0,
          condition: 'new',
          shipping: 0,
          inStock: true
        })
      }
    })

    // REGEX FALLBACK - if CSS selectors found nothing
    if (offers.length === 0 && html) {
      console.log('[bol.com] CSS failed, trying REGEX with context...')
      
      // INTELIGENTNY REGEX - tylko ceny w kontekście produktu
      const productKeywords = (searchQuery || '').toLowerCase().split(' ');
      const contextualPrices = [];
      
      // Szukaj fragmentów HTML z ceną + słowem kluczowym w promieniu 200 znaków
      const chunks = html.split(/€\s*\d+[,.]?\d*/);
      const priceMatches = html.match(/€\s*\d+[,.]?\d*/g) || [];
      
      for (let i = 0; i < priceMatches.length; i++) {
        const price = priceMatches[i];
        const contextBefore = chunks[i] ? chunks[i].slice(-100) : '';
        const contextAfter = chunks[i + 1] ? chunks[i + 1].slice(0, 100) : '';
        const context = (contextBefore + contextAfter).toLowerCase();
        
        // Sprawdź czy w kontekście jest słowo kluczowe (np. "iphone")
        const hasKeyword = productKeywords.some(kw => kw.length > 3 && context.includes(kw));
        
        if (hasKeyword) {
          const priceNum = parseFloat(price.replace('€', '').replace(',', '.').trim());
          if (priceNum > 100 && priceNum < 2000) { // Zakres produktów elektronicznych
            contextualPrices.push(priceNum);
          }
        }
      }
      
      if (contextualPrices.length > 0) {
        const uniquePrices = [...new Set(contextualPrices)].sort((a, b) => a - b);
        
        uniquePrices.slice(0, 10).forEach(price => {
          offers.push({
            seller: 'Bol.com',
            title: searchQuery || 'Product',
            price,
            url: 'https://www.bol.com',
            thumbnail: '',
            rating: 0,
            reviews: 0,
            condition: 'new',
            shipping: 0,
            inStock: true,
            _regexParsed: true
          })
        })
        console.log(`[bol.com] REGEX found ${offers.length} contextual offers`)
      } else {
        console.log('[bol.com] REGEX found 0 contextual offers')
      }
    }

    return {
      query: searchQuery,
      source: 'bol.com',
      offers: offers.slice(0, 20),
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
