// Crawler Configuration - DealSense NL
// Optimized for 400+ NL domains across all categories

module.exports = {
  // Queue settings
  queue: {
    name: 'dealsense-crawler',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    },
    // Concurrency per category
    concurrency: {
      products: 10,    // 10 parallel workers for products
      diensten: 5,     // 5 for diensten (slower sites)
      finance: 3       // 3 for finance (rate-limited)
    },
    // Retry settings
    retry: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000  // Start with 2s, then 4s, 8s
      }
    }
  },

  // Cache settings
  cache: {
    ttl: {
      products: 3600,      // 1 hour for products
      diensten: 86400,     // 24 hours for diensten
      finance: 172800,     // 48 hours for finance
      fallback: 604800     // 7 days fallback cache
    }
  },

  // Rate limiting (requests per minute per domain)
  rateLimit: {
    default: 30,           // 30 req/min default
    aggressive: 50,        // 50 for fast sites (Bol, Coolblue)
    conservative: 15,      // 15 for slow/protected sites
    finance: 10            // 10 for finance sites (very conservative)
  },

  // Proxy settings
  proxy: {
    enabled: process.env.USE_PROXY === 'true',
    provider: process.env.PROXY_PROVIDER || 'brightdata', // or 'smartproxy'
    rotation: true,
    pool: {
      residential: true,   // Use residential IPs
      country: 'NL',       // Netherlands only
      sticky: 300          // Keep same IP for 5 min
    }
  },

  // User agents rotation
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ],

  // Timeout settings
  timeout: {
    request: 30000,        // 30s per request
    parse: 5000,           // 5s for parsing
    total: 60000           // 60s total per job
  },

  // Domain priorities (1 = highest, 5 = lowest)
  domainPriority: {
    // Top tier - most reliable, fast
    'bol.com': 1,
    'coolblue.nl': 1,
    'mediamarkt.nl': 1,
    'amazon.nl': 1,
    
    // Second tier - good quality
    'wehkamp.nl': 2,
    'alternate.nl': 2,
    'azerty.nl': 2,
    
    // Third tier - slower but reliable
    'gaslicht.com': 3,
    'independer.nl': 3,
    
    // Default for unknown
    default: 3
  },

  // Categories configuration
  categories: {
    products: {
      enabled: true,
      domains: [], // Will be loaded from domains/products.json
      parser: 'generic-product'
    },
    energie: {
      enabled: true,
      domains: [], // Will be loaded from domains/energie.json
      parser: 'diensten-energie'
    },
    internet: {
      enabled: true,
      domains: [],
      parser: 'diensten-telecom'
    },
    verzekeringen: {
      enabled: true,
      domains: [],
      parser: 'diensten-insurance'
    },
    hypotheken: {
      enabled: true,
      domains: [],
      parser: 'finance-mortgage'
    },
    leningen: {
      enabled: true,
      domains: [],
      parser: 'finance-loan'
    },
    leasing: {
      enabled: true,
      domains: [],
      parser: 'finance-leasing'
    },
    creditcards: {
      enabled: true,
      domains: [],
      parser: 'finance-creditcard'
    },
    vakanties: {
      enabled: true,
      useAPI: true, // Use Booking.com API
      parser: 'api-booking'
    }
  },

  // Monitoring
  monitoring: {
    sentry: {
      enabled: process.env.SENTRY_DSN ? true : false,
      dsn: process.env.SENTRY_DSN
    },
    metrics: {
      enabled: true,
      interval: 60000  // Report every minute
    }
  }
}
