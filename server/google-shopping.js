const https = require('https');

class GoogleShoppingAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'www.searchapi.io';
  }

  async searchProduct(query, options = {}) {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: query,
      api_key: this.apiKey,
      gl: options.country || 'nl',
      hl: options.language || 'nl',
      num: options.limit || 20
    });

    return new Promise((resolve, reject) => {
      const path = `/api/v1/search?${params.toString()}`;
      
      const reqOptions = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      };

      const req = https.request(reqOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            
            if (data.error) {
              return reject(new Error(data.error));
            }

            const offers = this.parseResults(data);
            resolve(offers);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  parseResults(data) {
    if (!data.shopping_results || data.shopping_results.length === 0) {
      return [];
    }

    return data.shopping_results.map(item => ({
      store: item.source || item.merchant || 'Unknown',
      price: this.parsePrice(item.price || item.extracted_price),
      rating: parseFloat(item.rating) || 0,
      reviews: parseInt(item.reviews || item.reviews_count) || 0,
      link: item.link || item.product_link || '',
      title: item.title || '',
      thumbnail: item.thumbnail || ''
    })).filter(offer => offer.price > 0);
  }

  parsePrice(priceString) {
    if (!priceString) return 0;
    
    const cleaned = priceString.replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(',', '.');
    return parseFloat(normalized) || 0;
  }
}

module.exports = GoogleShoppingAPI;
