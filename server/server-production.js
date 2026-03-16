const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    environment: process.env.NODE_ENV || 'production',
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dealsense-pricing-engine' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });
  
  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });
}

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  GOOGLE_SHOPPING_API_KEY: process.env.GOOGLE_SHOPPING_API_KEY,
  USE_MOCK_FALLBACK: process.env.USE_MOCK_FALLBACK === 'true',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  
  PRICING_NICHE_EXCEPTION_ENABLED: process.env.PRICING_NICHE_EXCEPTION_ENABLED === 'true',
  PRICING_NICHE_EXCL: parseFloat(process.env.PRICING_NICHE_EXCL) || 4.0,
  PRICING_NICHE_MIN_RATING: parseFloat(process.env.PRICING_NICHE_MIN_RATING) || 4.0,
  PRICING_NICHE_MIN_REVIEWS: parseInt(process.env.PRICING_NICHE_MIN_REVIEWS) || 30,
  
  PRICING_SCAM_MIN_R: parseFloat(process.env.PRICING_SCAM_MIN_R) || 4.0,
  PRICING_V2_MAX_RAT: parseFloat(process.env.PRICING_V2_MAX_RAT) || 4.6,
  PRICING_V2_MIN_RAT: parseFloat(process.env.PRICING_V2_MIN_RAT) || 4.0,
  PRICING_V2_MIN_REV: parseInt(process.env.PRICING_V2_MIN_REV) || 30,
  
  MARKET_DISK_CACHE: process.env.MARKET_DISK_CACHE === '1',
  MARKET_LOG_SILENT: process.env.MARKET_LOG_SILENT === '1',
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://dealsense.nl',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(compression());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ENV.CORS_ORIGIN.split(',').map(o => o.trim());
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(ENV.RATE_LIMIT_WINDOW_MS / 1000)
    });
  }
});

app.use('/api/', limiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function getCachedData(key) {
  if (!redisClient) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
}

async function setCachedData(key, data, ttl = ENV.CACHE_TTL) {
  if (!redisClient) return;
  
  try {
    await redisClient.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    logger.error('Redis SET error:', error);
  }
}

function filterOffersByPricingRules(offers, basePrice) {
  if (!offers || offers.length === 0) return [];
  
  return offers.filter(offer => {
    if (!offer.price || offer.price <= 0) return false;
    
    const rating = parseFloat(offer.rating) || 0;
    const reviews = parseInt(offer.reviews) || 0;
    
    if (ENV.PRICING_NICHE_EXCEPTION_ENABLED) {
      if (rating < ENV.PRICING_NICHE_MIN_RATING) return false;
      if (reviews < ENV.PRICING_NICHE_MIN_REVIEWS) return false;
    }
    
    if (rating < ENV.PRICING_SCAM_MIN_R) return false;
    
    if (rating > ENV.PRICING_V2_MAX_RAT) return false;
    if (rating < ENV.PRICING_V2_MIN_RAT) return false;
    if (reviews < ENV.PRICING_V2_MIN_REV) return false;
    
    const priceRatio = offer.price / basePrice;
    if (priceRatio < ENV.PRICING_NICHE_EXCL) return false;
    
    return true;
  });
}

function sortOffersByPrice(offers) {
  return [...offers].sort((a, b) => a.price - b.price);
}

function getTopOffers(offers, count = 3) {
  const sorted = sortOffersByPrice(offers);
  return sorted.slice(0, count);
}

app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: ENV.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    redis: redisClient ? 'connected' : 'disabled',
    stripe: stripe ? 'configured' : 'disabled',
    config: {
      niche_exception_enabled: ENV.PRICING_NICHE_EXCEPTION_ENABLED,
      niche_min_rating: ENV.PRICING_NICHE_MIN_RATING,
      niche_min_reviews: ENV.PRICING_NICHE_MIN_REVIEWS,
      scam_min_rating: ENV.PRICING_SCAM_MIN_R,
      v2_max_rating: ENV.PRICING_V2_MAX_RAT,
      v2_min_rating: ENV.PRICING_V2_MIN_RAT,
      v2_min_reviews: ENV.PRICING_V2_MIN_REV,
      rate_limit: `${ENV.RATE_LIMIT_MAX_REQUESTS} req/${ENV.RATE_LIMIT_WINDOW_MS}ms`
    }
  };
  
  if (redisClient) {
    try {
      await redisClient.ping();
      health.redis = 'healthy';
    } catch (error) {
      health.redis = 'error';
      logger.error('Redis health check failed:', error);
    }
  }
  
  res.json(health);
});

app.post('/api/compare', async (req, res) => {
  try {
    const { product, basePrice, offers } = req.body;
    
    if (!product || !basePrice || !offers) {
      return res.status(400).json({ 
        error: 'Missing required fields: product, basePrice, offers' 
      });
    }
    
    const cacheKey = `compare:${product}:${basePrice}:${offers.length}`;
    const cached = await getCachedData(cacheKey);
    
    if (cached) {
      logger.info(`Cache hit for: ${cacheKey}`);
      return res.json({ ...cached, cached: true });
    }
    
    const filteredOffers = filterOffersByPricingRules(offers, basePrice);
    const topOffers = getTopOffers(filteredOffers, 3);
    
    const savings = topOffers.length > 0 
      ? basePrice - topOffers[0].price 
      : 0;
    
    const savingsPercent = topOffers.length > 0
      ? ((savings / basePrice) * 100).toFixed(1)
      : 0;
    
    const result = {
      product,
      basePrice,
      totalOffers: offers.length,
      filteredOffers: filteredOffers.length,
      topOffers,
      savings: {
        amount: savings,
        percent: savingsPercent
      },
      timestamp: new Date().toISOString(),
      cached: false
    };
    
    await setCachedData(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    logger.error('Error processing compare request:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/test', async (req, res) => {
  try {
    const { testData } = req.body;
    
    if (!testData || !Array.isArray(testData)) {
      return res.status(400).json({ error: 'Invalid testData format' });
    }
    
    const results = testData.map(item => {
      const filtered = filterOffersByPricingRules(item.offers, item.basePrice);
      const top = getTopOffers(filtered, 3);
      
      return {
        product: item.product,
        basePrice: item.basePrice,
        totalOffers: item.offers.length,
        filteredOffers: filtered.length,
        topOffers: top,
        bestPrice: top.length > 0 ? top[0].price : null,
        savings: top.length > 0 ? item.basePrice - top[0].price : 0
      };
    });
    
    const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
    
    res.json({
      results,
      summary: {
        totalProducts: results.length,
        totalSavings: totalSavings.toFixed(2),
        averageSavings: (totalSavings / results.length).toFixed(2)
      }
    });
  } catch (error) {
    logger.error('Error processing test request:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/token', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    const token = jwt.sign(
      { type: 'api', issued: Date.now() },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, expiresIn: '24h' });
  } catch (error) {
    logger.error('Error generating token:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

if (stripe) {
  app.post('/api/stripe/checkout', verifyToken, async (req, res) => {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;
      
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card', 'ideal'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      logger.error('Stripe checkout error:', error);
      Sentry.captureException(error);
      res.status(500).json({ error: 'Payment processing error' });
    }
  });
}

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const server = app.listen(PORT, () => {
  logger.info(`Dealsense Pricing Engine running on port ${PORT}`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);
  logger.info(`Redis: ${redisClient ? 'enabled' : 'disabled'}`);
  logger.info(`Stripe: ${stripe ? 'enabled' : 'disabled'}`);
  logger.info(`Sentry: ${process.env.SENTRY_DSN ? 'enabled' : 'disabled'}`);
  logger.info(`CORS Origin: ${ENV.CORS_ORIGIN}`);
  logger.info(`Rate Limit: ${ENV.RATE_LIMIT_MAX_REQUESTS} req/${ENV.RATE_LIMIT_WINDOW_MS}ms`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  Sentry.captureException(reason);
});
