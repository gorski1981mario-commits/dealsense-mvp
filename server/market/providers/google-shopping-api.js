/**
 * Google Shopping API - Płatne ale NIKT NIE ODRZUCI!
 * Rozwiązanie Gemini - stabilne i pewne źródło danych
 * Czas implementacji: 10 minut ⚡
 */

const axios = require('axios');

class GoogleShoppingAPI {
  constructor() {
    this.apiKey = process.env.GOOGLE_SHOPPING_PAID_API_KEY || '';
    this.baseURL = 'https://shoppingcontent.googleapis.com';
    this.searchURL = 'https://www.googleapis.com/customsearch/v1';
  }

  async searchProducts(query, options = {}) {
    try {
      // Google Custom Search API dla produktów
      const params = {
        key: this.apiKey,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID || '', // Custom Search Engine ID
        q: `${query} buy online price`,
        num: options.limit || 20,
        sort: 'price',
        filter: '1',
        safe: 'off'
      };

      const response = await axios.get(this.searchURL, {
        params,
        timeout: 15000
      });

      if (response.data && response.data.items) {
        return this.formatOffers(response.data.items, query);
      }

      return [];
    } catch (error) {
      console.error('Google Shopping API error:', error.message);
      return [];
    }
  }

  async searchShoppingDirect(query, options = {}) {
    try {
      // Google Shopping Content API (jeśli masz dostęp)
      const params = {
        key: this.apiKey,
        query: query,
        maxResults: options.limit || 20
      };

      const response = await axios.get(`${this.baseURL}/v2.1/products`, {
        params,
        timeout: 15000
      });

      if (response.data && response.data.resources) {
        return this.formatContentOffers(response.data.resources);
      }

      return [];
    } catch (error) {
      console.error('Google Shopping Content API error:', error.message);
      return [];
    }
  }

  formatOffers(items, query) {
    return items.map(item => {
      // Ekstrakcja ceny z title lub snippet
      const price = this.extractPrice(item.title, item.snippet);
      const shop = this.extractShop(item.title, item.snippet, item.displayLink);
      
      return {
        id: this.generateId(item.link),
        title: this.cleanTitle(item.title),
        price: price,
        originalPrice: price * 1.2, // Szacowana cena bazowa
        currency: 'EUR',
        shop: shop,
        shopUrl: item.link,
        imageUrl: this.extractImage(item.pagemap?.metatags),
        availability: 'in_stock',
        condition: 'new',
        delivery: '2-3 dagen',
        trust: this.calculateTrustScore(shop),
        source: 'google_shopping_paid',
        ean: this.extractEAN(item.title, item.snippet),
        category: 'unknown',
        brand: this.extractBrand(item.title),
        description: item.snippet
      };
    }).filter(offer => offer.price > 0);
  }

  formatContentOffers(resources) {
    return resources.map(product => ({
      id: product.productId || this.generateId(product.link),
      title: product.title || product.product?.title,
      price: parseFloat(product.price?.value || '0'),
      originalPrice: parseFloat(product.originalPrice?.value || product.price?.value || '0'),
      currency: product.price?.currency || 'EUR',
      shop: product.author?.name || 'Google Shopping',
      shopUrl: product.link || product.product?.link,
      imageUrl: product.imageLink || product.product?.imageLink,
      availability: product.availability === 'in_stock' ? 'in_stock' : 'out_of_stock',
      condition: product.condition || 'new',
      delivery: product.delivery?.label || '2-3 dagen',
      trust: 85, // Google Shopping ma wysoki trust
      source: 'google_shopping_content',
      ean: product.gtin || product.product?.gtin,
      category: product.productType || 'unknown',
      brand: product.brand || 'unknown'
    })).filter(offer => offer.price > 0);
  }

  extractPrice(title, snippet) {
    const text = `${title} ${snippet}`;
    const priceRegex = /€\s*(\d+(?:[.,]\d+)?)/g;
    const matches = text.match(priceRegex);
    
    if (matches && matches.length > 0) {
      const price = matches[0].replace(/[€\s]/g, '').replace(',', '.');
      return parseFloat(price);
    }
    
    // Szukaj cen bez €
    const genericPriceRegex = /(\d+(?:[.,]\d+)?)\s*(?:eur|euro|e)/i;
    const genericMatch = text.match(genericPriceRegex);
    
    if (genericMatch) {
      return parseFloat(genericMatch[1].replace(',', '.'));
    }
    
    return 0;
  }

  extractShop(title, snippet, displayLink) {
    // Ekstrakcja nazwy sklepu z różnych źródeł
    if (displayLink && !displayLink.includes('google')) {
      return displayLink.split('.')[0];
    }
    
    const text = `${title} ${snippet}`;
    const shopRegex = /\b(at|van|bij|from)\s+([A-Za-z0-9]+\.[A-Za-z]{2,})/i;
    const match = text.match(shopRegex);
    
    if (match) {
      return match[2].split('.')[0];
    }
    
    return 'Unknown Shop';
  }

  extractImage(metatags) {
    if (metatags) {
      const imageTag = metatags.find(tag => 
        tag.property === 'og:image' || 
        tag.name === 'image' || 
        tag.property === 'twitter:image'
      );
      if (imageTag) return imageTag.content;
    }
    return '';
  }

  cleanTitle(title) {
    return title.replace(/\b(at|van|bij|from|buy|price|€)\b/gi, '').trim();
  }

  generateId(link) {
    return Buffer.from(link).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  calculateTrustScore(shop) {
    const trustedShops = [
      'bol', 'coolblue', 'mediamarkt', 'wehkamp', 'fonq', 
      'amazon', 'apple', 'samsung', 'aldi', 'lidl', 'ah'
    ];
    
    if (trustedShops.some(trusted => shop.toLowerCase().includes(trusted))) {
      return 90;
    }
    
    return 70; // Bazowy trust score
  }

  extractEAN(title, snippet) {
    const text = `${title} ${snippet}`;
    const eanRegex = /\b(\d{13})\b/;
    const match = text.match(eanRegex);
    return match ? match[1] : null;
  }

  extractBrand(title) {
    const brands = [
      'Apple', 'Samsung', 'Sony', 'LG', 'Philips', 'Bosch', 'Siemens',
      'Nike', 'Adidas', 'Puma', 'Dyson', 'Miele', 'Bosch', 'Canon'
    ];
    
    for (const brand of brands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    
    return 'Unknown';
  }

  isConfigured() {
    return !!(this.apiKey && process.env.GOOGLE_SEARCH_ENGINE_ID);
  }

  async getApiInfo() {
    return {
      configured: this.isConfigured(),
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'missing',
      searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID ? 'configured' : 'missing'
    };
  }
}

module.exports = GoogleShoppingAPI;
