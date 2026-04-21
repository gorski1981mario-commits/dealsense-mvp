# DealSense Crawler

Optimized multi-source web crawler for Dutch market (NL).

## Features

✅ **Multi-Category Support:**
- Products (400+ NL e-commerce sites)
- Diensten (Energie, Internet, Verzekeringen)
- Finance (Hypotheken, Leningen, Leasing, Creditcards)

✅ **Anti-Bot Protection:**
- Residential proxy rotation (NL IPs)
- Smart request headers
- Rate limiting per domain
- Cookie & session management

✅ **Performance:**
- Bull queue system (parallel workers)
- Redis caching (1-48h TTL)
- Retry logic with exponential backoff
- 90-95% success rate

✅ **Monitoring:**
- Sentry error tracking
- Real-time metrics
- Success rate tracking
- Performance analytics

## Architecture

```
User Request → Cache Check → Queue → Worker → Parser → Cache → Response
                    ↓                    ↓
                  Hit?              Proxy + Rate Limit
                    ↓                    ↓
                 Return            Anti-Bot Headers
```

## Installation

```bash
cd server/crawler
npm install
cp .env.example .env
# Edit .env with your credentials
```

## Configuration

### 1. Redis (Required)

```bash
# Local Redis
redis-server

# Or use Upstash (cloud)
REDIS_HOST=your-redis.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

### 2. Residential Proxies (Required for production)

**Option A: BrightData (Recommended)**
- Sign up: https://brightdata.com
- Get credentials
- Add to .env:

```env
USE_PROXY=true
PROXY_PROVIDER=brightdata
BRIGHTDATA_USERNAME=your_username
BRIGHTDATA_PASSWORD=your_password
```

**Option B: SmartProxy**
- Sign up: https://smartproxy.com
- Get credentials
- Add to .env:

```env
USE_PROXY=true
PROXY_PROVIDER=smartproxy
SMARTPROXY_USERNAME=your_username
SMARTPROXY_PASSWORD=your_password
```

### 3. Sentry (Optional but recommended)

```env
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
```

## Usage

### Start Crawler

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### Test Proxy Connection

```bash
npm run test:proxy
```

### Test Parser

```bash
npm run test:parser bol.com
```

## API Usage

```javascript
const crawler = require('./crawler')

// Enqueue product scan
const result = await crawler.enqueue('https://www.bol.com/product/123', {
  category: 'products',
  ean: '1234567890123',
  priority: 1
})

// Check if cached
if (result.cached) {
  console.log('Data from cache:', result.data)
} else {
  console.log('Job queued:', result.jobId)
}

// Get stats
const stats = await crawler.getStats()
console.log('Success rate:', stats.metrics.successRate)
```

## Adding New Parsers

### Domain-Specific Parser

Create `parsers/domains/example.com.js`:

```javascript
const cheerio = require('cheerio')

module.exports = {
  name: 'example.com',
  category: 'products',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    
    // Extract data
    const price = $('.price').text()
    const title = $('h1').text()
    
    return {
      ean: jobData.ean,
      source: 'example.com',
      offers: [{
        seller: 'Example',
        price: parseFloat(price),
        title
      }],
      scrapedAt: Date.now()
    }
  }
}
```

Parser will be auto-loaded on crawler start.

## Performance Tuning

### Concurrency

Edit `config.js`:

```javascript
concurrency: {
  products: 10,    // 10 parallel workers
  diensten: 5,     // 5 for slower sites
  finance: 3       // 3 for rate-limited sites
}
```

### Rate Limiting

```javascript
rateLimit: {
  'bol.com': 50,        // 50 req/min (fast)
  'gaslicht.com': 15,   // 15 req/min (slow)
  default: 30           // 30 req/min default
}
```

### Cache TTL

```javascript
cache: {
  ttl: {
    products: 3600,      // 1 hour
    diensten: 86400,     // 24 hours
    finance: 172800      // 48 hours
  }
}
```

## Monitoring

### Dashboard

```bash
# Get real-time stats
curl http://localhost:3000/crawler/stats

# Response:
{
  "requests": {
    "total": 1523,
    "success": 1445,
    "failed": 78,
    "cached": 342
  },
  "successRate": "94.88%",
  "avgDuration": "1234ms",
  "topDomains": [...]
}
```

### Sentry

All errors automatically sent to Sentry with context:
- Domain
- Category
- Error type
- Stack trace

## Cost Estimation

### Small Scale (1,000-10,000 users)

```
Server (Hetzner):        €50/mies
Proxies (BrightData):    €100/mies
Redis (Upstash):         €20/mies
TOTAL:                   €170/mies
```

### Medium Scale (10,000-100,000 users)

```
Server (Hetzner):        €150/mies
Proxies (BrightData):    €300/mies
Redis (Upstash Pro):     €50/mies
TOTAL:                   €500/mies
```

### Large Scale (100,000-1M users)

```
AWS ECS (3x):            €500/mies
Proxies (BrightData):    €800/mies
Redis Cluster:           €200/mies
TOTAL:                   €1,500/mies
```

**vs Google Shopping API:** €5,000-50,000/mies 🎯

## Troubleshooting

### High Failure Rate

1. Check proxy connection: `npm run test:proxy`
2. Reduce rate limits in `config.js`
3. Check Sentry for error patterns

### Slow Performance

1. Increase concurrency
2. Add more workers
3. Optimize parsers (avoid Puppeteer if possible)

### Blocked by Cloudflare

1. Verify residential proxies are enabled
2. Check User-Agent rotation
3. Reduce request rate

## Support

For issues or questions:
- Check logs: `tail -f crawler.log`
- Check Sentry dashboard
- Review metrics: `/crawler/stats`

## License

Proprietary - DealSense © 2026
