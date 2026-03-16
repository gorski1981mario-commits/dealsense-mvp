# Dealsense Production Architecture - 1M+ Users

## Stack Overview

### Core Infrastructure
- **Runtime**: Node.js 18+ with PM2 cluster mode (multi-core)
- **Framework**: Express.js with production middleware
- **Reverse Proxy**: Nginx with load balancing
- **SSL/TLS**: Let's Encrypt (auto-renewal) via Certbot
- **CDN**: Cloudflare (optional, recommended for DDoS protection)

### Security Layer
- **Helmet**: Security headers (CSP, HSTS, X-Frame-Options)
- **CORS**: Restricted to `https://dealsense.nl`
- **Rate Limiting**: 100 req/min per IP (configurable)
- **JWT**: Token-based authentication
- **HTTPS**: Enforced via Nginx redirect

### Caching & Performance
- **Redis**: Session storage + API response cache (5min TTL)
- **Compression**: Gzip for all text responses
- **Keep-Alive**: Connection pooling via Nginx
- **Cluster Mode**: PM2 runs on all CPU cores

### Logging & Monitoring
- **Winston**: Structured JSON logs with daily rotation
- **Sentry**: Real-time error tracking + performance monitoring
- **PM2 Logs**: Process management logs
- **Nginx Logs**: Access + error logs

### Payment Processing
- **Stripe**: Subscription billing (iDEAL + Card)
- **Webhook**: Secure payment event handling

## Architecture Diagram

```
Internet
    ↓
Cloudflare (CDN + DDoS Protection)
    ↓
Nginx (Port 80/443)
    ├─ SSL Termination (Let's Encrypt)
    ├─ Rate Limiting (100 req/min)
    ├─ Gzip Compression
    ├─ Load Balancing (least_conn)
    └─ Static Files Cache
        ↓
PM2 Cluster (All CPU Cores)
    ├─ Instance 1 (Port 3000)
    ├─ Instance 2 (Port 3000)
    ├─ Instance N (Port 3000)
    └─ Auto-restart on crash
        ↓
Express.js Application
    ├─ Helmet (Security Headers)
    ├─ CORS (dealsense.nl only)
    ├─ Rate Limiter (express-rate-limit)
    ├─ JWT Auth
    ├─ Winston Logger → Files + Sentry
    └─ Pricing Engine Logic
        ↓
    ┌───┴───┐
Redis Cache    Stripe API
(5min TTL)     (Payments)
```

## Scalability Features

### Horizontal Scaling
- **PM2 Cluster**: Utilizes all CPU cores automatically
- **Stateless Design**: No session data in memory (Redis only)
- **Load Balancing**: Nginx distributes traffic evenly

### Vertical Scaling
- **Memory**: Auto-restart at 1GB per instance
- **CPU**: Cluster mode scales with cores
- **Redis**: External managed service (Render addon or AWS ElastiCache)

### Performance Optimizations
- **Response Caching**: Redis cache for identical requests (5min)
- **Connection Pooling**: Nginx keepalive connections
- **Gzip Compression**: 60-80% bandwidth reduction
- **Static Asset Caching**: 1 year browser cache

## Deployment Options

### Option 1: Render (Recommended for MVP)
- **Web Service**: Auto-deploy from GitHub
- **Redis Addon**: Managed Redis instance
- **SSL**: Automatic Let's Encrypt
- **Scaling**: Manual/auto-scaling available
- **Cost**: ~$25-50/month for starter

### Option 2: AWS ECS (For 1M+ users)
- **ECS Fargate**: Serverless containers
- **ElastiCache**: Managed Redis cluster
- **ALB**: Application Load Balancer
- **CloudFront**: CDN + DDoS protection
- **Cost**: ~$200-500/month at scale

### Option 3: Self-Hosted (Max control)
- **VPS**: DigitalOcean/Hetzner/Linode
- **Nginx**: Reverse proxy + SSL
- **PM2**: Process management
- **Redis**: Self-hosted or managed
- **Cost**: ~$50-100/month

## Environment Variables (Production)

### Required
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<min-32-chars-random-string>
CORS_ORIGIN=https://dealsense.nl,https://www.dealsense.nl
```

### Optional but Recommended
```bash
REDIS_URL=redis://...
SENTRY_DSN=https://...
STRIPE_SECRET_KEY=sk_live_...
API_KEY=<internal-api-key>
```

### Performance Tuning
```bash
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=300
LOG_LEVEL=info
```

## Monitoring & Alerts

### Health Checks
- **Endpoint**: `GET /health`
- **Frequency**: Every 30s
- **Alerts**: Slack/Email on failure

### Metrics to Track
- **Response Time**: p50, p95, p99
- **Error Rate**: 5xx responses
- **Cache Hit Rate**: Redis performance
- **Memory Usage**: Per PM2 instance
- **CPU Usage**: Overall server load

### Sentry Integration
- **Error Tracking**: All uncaught exceptions
- **Performance**: 10% transaction sampling
- **Alerts**: Critical errors → Slack

## Security Checklist

- [x] HTTPS enforced (301 redirect)
- [x] HSTS header (1 year)
- [x] CSP headers configured
- [x] Rate limiting enabled
- [x] CORS restricted to domain
- [x] JWT token expiration (24h)
- [x] Helmet security headers
- [x] Input validation on all endpoints
- [x] Error messages sanitized
- [x] Secrets in environment variables

## Disaster Recovery

### Backups
- **Redis**: Daily snapshots (Render auto-backup)
- **Logs**: 14-day retention
- **Code**: Git repository (GitHub)

### Rollback Strategy
- **Git**: Revert to previous commit
- **Render**: One-click rollback to previous deploy
- **PM2**: `pm2 reload` for zero-downtime

### Incident Response
1. Check `/health` endpoint
2. Review Sentry errors
3. Check PM2 logs: `pm2 logs`
4. Check Nginx logs: `/var/log/nginx/error.log`
5. Restart if needed: `pm2 restart all`

## Performance Benchmarks (Expected)

### With Redis Cache
- **Response Time**: <50ms (cached)
- **Throughput**: 1000+ req/s per core
- **Concurrent Users**: 10k+ per instance

### Without Cache
- **Response Time**: 100-200ms
- **Throughput**: 500 req/s per core
- **Concurrent Users**: 5k+ per instance

### At 1M Users Scale
- **Daily Active**: ~100k users
- **Peak Traffic**: ~1000 req/s
- **Instances Needed**: 4-8 PM2 workers
- **Redis Memory**: 2-4GB
- **Server RAM**: 8-16GB

## Next Steps

1. **Deploy to Render**: Push code to GitHub
2. **Add Redis**: Enable Render Redis addon
3. **Configure Sentry**: Create Sentry project
4. **Setup Stripe**: Add webhook endpoint
5. **Configure Cloudflare**: Point DNS to Render
6. **Load Testing**: Use Artillery/k6 for stress tests
7. **Monitoring**: Setup alerts in Sentry + Render

## Cost Estimation (1M Users)

### Render (Managed)
- Web Service: $25/month (starter) → $85/month (pro)
- Redis: $10/month (256MB) → $50/month (2GB)
- **Total**: ~$35-135/month

### AWS (Self-Managed)
- ECS Fargate: $100-200/month
- ElastiCache: $50-100/month
- ALB: $20/month
- CloudFront: $50-100/month
- **Total**: ~$220-420/month

### Hybrid (Recommended)
- Render Web Service: $85/month
- AWS ElastiCache: $50/month
- Cloudflare Free: $0/month
- **Total**: ~$135/month
