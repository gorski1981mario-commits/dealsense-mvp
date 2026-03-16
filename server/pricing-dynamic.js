class DynamicPricingEngine {
  constructor(redisClient) {
    this.redis = redisClient;
    
    this.config = {
      thresholds: {
        low: { maxPrice: 100, threshold: 0.15 },
        medium: { maxPrice: 500, threshold: 0.20 },
        high: { maxPrice: Infinity, threshold: 0.25 }
      },
      freshness: {
        minAgeMinutes: 30,
        maxUserViews: 5
      },
      anomaly: {
        dropPercentage: 35,
        timeWindowMinutes: 60,
        bypassThreshold: 0.05
      }
    };
  }

  getDynamicThreshold(basePrice) {
    if (basePrice < this.config.thresholds.low.maxPrice) {
      return this.config.thresholds.low.threshold;
    } else if (basePrice < this.config.thresholds.medium.maxPrice) {
      return this.config.thresholds.medium.threshold;
    } else {
      return this.config.thresholds.high.threshold;
    }
  }

  async trackDeal(dealId, price) {
    if (!this.redis) return;
    
    const key = `deal:${dealId}`;
    const now = Date.now();
    
    try {
      const exists = await this.redis.exists(key);
      
      if (!exists) {
        await this.redis.hset(key, {
          firstSeen: now,
          initialPrice: price,
          currentPrice: price,
          lastUpdated: now,
          viewCount: 0
        });
        await this.redis.expire(key, 86400);
      } else {
        const data = await this.redis.hgetall(key);
        await this.redis.hset(key, {
          currentPrice: price,
          lastUpdated: now
        });
      }
    } catch (error) {
      console.error('Redis tracking error:', error);
    }
  }

  async incrementViewCount(dealId) {
    if (!this.redis) return 0;
    
    const key = `deal:${dealId}`;
    try {
      return await this.redis.hincrby(key, 'viewCount', 1);
    } catch (error) {
      console.error('Redis increment error:', error);
      return 0;
    }
  }

  async checkFreshness(dealId) {
    if (!this.redis) return { isFresh: true, reason: 'redis_disabled' };
    
    const key = `deal:${dealId}`;
    
    try {
      const data = await this.redis.hgetall(key);
      
      if (!data || !data.firstSeen) {
        return { isFresh: true, reason: 'new_deal' };
      }
      
      const now = Date.now();
      const ageMinutes = (now - parseInt(data.firstSeen)) / 60000;
      const viewCount = parseInt(data.viewCount) || 0;
      
      if (ageMinutes < this.config.freshness.minAgeMinutes) {
        return { 
          isFresh: false, 
          reason: 'too_new',
          age: ageMinutes.toFixed(1)
        };
      }
      
      if (viewCount >= this.config.freshness.maxUserViews) {
        return { 
          isFresh: false, 
          reason: 'too_popular',
          views: viewCount
        };
      }
      
      return { 
        isFresh: true, 
        age: ageMinutes.toFixed(1),
        views: viewCount
      };
    } catch (error) {
      console.error('Redis freshness check error:', error);
      return { isFresh: true, reason: 'redis_error' };
    }
  }

  async detectAnomaly(dealId) {
    if (!this.redis) return { isAnomaly: false, reason: 'redis_disabled' };
    
    const key = `deal:${dealId}`;
    
    try {
      const data = await this.redis.hgetall(key);
      
      if (!data || !data.initialPrice || !data.currentPrice || !data.firstSeen) {
        return { isAnomaly: false, reason: 'insufficient_data' };
      }
      
      const initialPrice = parseFloat(data.initialPrice);
      const currentPrice = parseFloat(data.currentPrice);
      const firstSeen = parseInt(data.firstSeen);
      const now = Date.now();
      
      const ageMinutes = (now - firstSeen) / 60000;
      
      if (ageMinutes > this.config.anomaly.timeWindowMinutes) {
        return { isAnomaly: false, reason: 'outside_window' };
      }
      
      const dropPercentage = ((initialPrice - currentPrice) / initialPrice) * 100;
      
      if (dropPercentage >= this.config.anomaly.dropPercentage) {
        return {
          isAnomaly: true,
          dropPercentage: dropPercentage.toFixed(1),
          initialPrice,
          currentPrice,
          ageMinutes: ageMinutes.toFixed(1)
        };
      }
      
      return { 
        isAnomaly: false, 
        reason: 'insufficient_drop',
        dropPercentage: dropPercentage.toFixed(1)
      };
    } catch (error) {
      console.error('Redis anomaly detection error:', error);
      return { isAnomaly: false, reason: 'redis_error' };
    }
  }

  async shouldAcceptOffer(offer, basePrice, dealId) {
    if (!offer.price || offer.price <= 0) {
      return { accept: false, reason: 'invalid_price' };
    }
    
    const priceRatio = offer.price / basePrice;
    
    await this.trackDeal(dealId, offer.price);
    
    const anomaly = await this.detectAnomaly(dealId);
    
    if (anomaly.isAnomaly) {
      if (priceRatio >= this.config.anomaly.bypassThreshold) {
        return {
          accept: true,
          reason: 'anomaly_boost',
          details: {
            dropPercentage: anomaly.dropPercentage,
            threshold: this.config.anomaly.bypassThreshold,
            priceRatio: priceRatio.toFixed(3)
          }
        };
      }
    }
    
    const freshness = await this.checkFreshness(dealId);
    
    if (!freshness.isFresh) {
      return {
        accept: false,
        reason: 'freshness_filter',
        details: freshness
      };
    }
    
    const dynamicThreshold = this.getDynamicThreshold(basePrice);
    
    if (priceRatio < dynamicThreshold) {
      return {
        accept: false,
        reason: 'below_threshold',
        details: {
          priceRatio: priceRatio.toFixed(3),
          threshold: dynamicThreshold,
          basePrice
        }
      };
    }
    
    return {
      accept: true,
      reason: 'passed_all_filters',
      details: {
        priceRatio: priceRatio.toFixed(3),
        threshold: dynamicThreshold,
        freshness: freshness
      }
    };
  }

  getStats() {
    return {
      thresholds: this.config.thresholds,
      freshness: this.config.freshness,
      anomaly: this.config.anomaly,
      redis: this.redis ? 'enabled' : 'disabled'
    };
  }
}

module.exports = DynamicPricingEngine;
