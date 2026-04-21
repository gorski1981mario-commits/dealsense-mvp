/**
 * Bol.com Partner API Provider
 * Darmowy, 40% rynku NL, 3-7% prowizji
 * Czas implementacji: 20 minut ⚡
 */

const axios = require('axios');

class BolComAPI {
  constructor() {
    this.baseURL = 'https://api.bol.com';
    this.partnerId = process.env.BOL_COM_PARTNER_ID || '';
    this.apiKey = process.env.BOL_COM_API_KEY || '';
  }

  async searchProducts(query, options = {}) {
    try {
      const params = {
        q: query,
        limit: options.limit || 20,
        offset: options.offset || 0,
        'api-key': this.apiKey,
        'format': 'json'
      };

      const response = await axios.get(`${this.baseURL}/catalog/v4/search`, {
        params,
        timeout: 10000
      });

      if (response.data && response.data.products) {
        return this.formatOffers(response.data.products);
      }

      return [];
    } catch (error) {
      console.error('Bol.com API error:', error.message);
      return [];
    }
  }

  formatOffers(products) {
    return products.map(product => ({
      id: product.id,
      title: product.title,
      price: parseFloat(product.offerData?.offers?.[0]?.price || '0'),
      originalPrice: parseFloat(product.offerData?.offers?.[0]?.listPrice || '0'),
      currency: 'EUR',
      shop: 'Bol.com',
      shopUrl: `https://www.bol.com/nl/p/${product.id}`,
      imageUrl: product.images?.[0]?.url || '',
      availability: product.offerData?.offers?.[0]?.availability === 'available' ? 'in_stock' : 'out_of_stock',
      condition: 'new',
      delivery: product.offerData?.offers?.[0]?.deliveryTime || '2-3 dagen',
      trust: 95, // Bol.com ma wysoki trust score
      source: 'bolcom',
      ean: product.ean || product.identifiers?.ean || null,
      category: product.categoryId || 'unknown',
      brand: product.brand || 'unknown'
    })).filter(offer => offer.price > 0);
  }

  async getCategoryProducts(categoryId, options = {}) {
    try {
      const params = {
        'ids': categoryId,
        'include-attributes': true,
        'api-key': this.apiKey,
        'format': 'json'
      };

      const response = await axios.get(`${this.baseURL}/catalog/v4/lists`, {
        params,
        timeout: 10000
      });

      if (response.data && response.data.products) {
        return this.formatOffers(response.data.products);
      }

      return [];
    } catch (error) {
      console.error('Bol.com category error:', error.message);
      return [];
    }
  }

  async getProductDetails(productId) {
    try {
      const params = {
        'ids': productId,
        'include-attributes': true,
        'include-offers': true,
        'api-key': this.apiKey,
        'format': 'json'
      };

      const response = await axios.get(`${this.baseURL}/catalog/v4/products`, {
        params,
        timeout: 10000
      });

      if (response.data && response.data.products?.length > 0) {
        const products = this.formatOffers(response.data.products);
        return products[0] || null;
      }

      return null;
    } catch (error) {
      console.error('Bol.com product details error:', error.message);
      return null;
    }
  }

  isConfigured() {
    return !!(this.partnerId && this.apiKey);
  }
}

module.exports = BolComAPI;
