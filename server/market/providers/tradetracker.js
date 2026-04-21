/**
 * TradeTracker API Provider
 * #1 w NL, 15% prowizji, darmowy
 * Czas implementacji: 20 minut ⚡
 */

const axios = require('axios');

class TradeTrackerAPI {
  constructor() {
    this.baseURL = 'https://api.tradetracker.com';
    this.customerId = process.env.TRADETRACKER_CUSTOMER_ID || '';
    this.passphrase = process.env.TRADETRACKER_PASSPHRASE || '';
    this.affiliateSiteId = process.env.TRADETRACKER_AFFILIATE_SITE_ID || '';
  }

  async searchProducts(query, options = {}) {
    try {
      // TradeTracker używa campaign-based search
      const campaigns = await this.getActiveCampaigns();
      const allOffers = [];

      for (const campaign of campaigns) {
        const offers = await this.searchCampaignProducts(campaign.id, query, options);
        allOffers.push(...offers);
      }

      // Usuń duplikaty i sortuj
      const uniqueOffers = this.deduplicateOffers(allOffers);
      return uniqueOffers.slice(0, options.limit || 20);
    } catch (error) {
      console.error('TradeTracker API error:', error.message);
      return [];
    }
  }

  async getActiveCampaigns() {
    try {
      const response = await axios.get(`${this.baseURL}/rest/campaigns`, {
        auth: {
          username: this.customerId,
          password: this.passphrase
        },
        params: {
          affiliateSiteId: this.affiliateSiteId,
          assignmentStatus: 'accepted'
        },
        timeout: 10000
      });

      return response.data.campaigns || [];
    } catch (error) {
      console.error('TradeTracker campaigns error:', error.message);
      return [];
    }
  }

  async searchCampaignProducts(campaignId, query, options = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/rest/products`, {
        auth: {
          username: this.customerId,
          password: this.passphrase
        },
        params: {
          campaignId,
          query,
          limit: options.limit || 10
        },
        timeout: 10000
      });

      if (response.data.products) {
        return this.formatOffers(response.data.products, campaignId);
      }

      return [];
    } catch (error) {
      console.error('TradeTracker campaign search error:', error.message);
      return [];
    }
  }

  formatOffers(products, campaignId) {
    return products.map(product => ({
      id: product.id,
      title: product.name,
      price: parseFloat(product.price || '0'),
      originalPrice: parseFloat(product.previousPrice || product.price || '0'),
      currency: product.currency || 'EUR',
      shop: product.campaign?.name || 'TradeTracker',
      shopUrl: product.url || '',
      imageUrl: product.imageUrl || '',
      availability: product.inStock ? 'in_stock' : 'out_of_stock',
      condition: 'new',
      delivery: product.deliveryTime || '2-5 dagen',
      trust: this.calculateTrustScore(product),
      source: 'tradetracker',
      campaignId,
      ean: product.ean || null,
      category: product.category || 'unknown',
      brand: product.brand || 'unknown',
      commission: product.commission || 0.15
    })).filter(offer => offer.price > 0);
  }

  calculateTrustScore(product) {
    let score = 70; // Bazowy score

    // Boost za znane sklepy
    if (product.campaign?.name) {
      const knownShops = ['bol.com', 'coolblue', 'mediamarkt', 'wehkamp', 'fonq'];
      if (knownShops.some(shop => product.campaign.name.toLowerCase().includes(shop))) {
        score += 20;
      }
    }

    // Boost za dostępność
    if (product.inStock) {
      score += 10;
    }

    return Math.min(100, score);
  }

  deduplicateOffers(offers) {
    const seen = new Set();
    return offers.filter(offer => {
      const key = `${offer.title}-${offer.price}-${offer.shop}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async getTopDeals(category = null, limit = 20) {
    try {
      const campaigns = await this.getActiveCampaigns();
      const allDeals = [];

      for (const campaign of campaigns) {
        const deals = await this.getCampaignDeals(campaign.id, category);
        allDeals.push(...deals);
      }

      // Sortuj po rabacie
      const sortedDeals = allDeals.sort((a, b) => {
        const discountA = a.originalPrice - a.price;
        const discountB = b.originalPrice - b.price;
        return discountB - discountA;
      });

      return sortedDeals.slice(0, limit);
    } catch (error) {
      console.error('TradeTracker deals error:', error.message);
      return [];
    }
  }

  async getCampaignDeals(campaignId, category = null) {
    try {
      const response = await axios.get(`${this.baseURL}/rest/deals`, {
        auth: {
          username: this.customerId,
          password: this.passphrase
        },
        params: {
          campaignId,
          category,
          limit: 10
        },
        timeout: 10000
      });

      if (response.data.deals) {
        return this.formatOffers(response.data.deals, campaignId);
      }

      return [];
    } catch (error) {
      console.error('TradeTracker campaign deals error:', error.message);
      return [];
    }
  }

  isConfigured() {
    return !!(this.customerId && this.passphrase && this.affiliateSiteId);
  }
}

module.exports = TradeTrackerAPI;
