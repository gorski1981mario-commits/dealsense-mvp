# 🚀 DealSense - Kompletny Deployment Guide (A do Z)

**Data:** 16 marca 2026  
**Cel:** Uruchomienie pełnej aplikacji DealSense w produkcji

---

## 📋 SPIS TREŚCI

1. [Wymagania wstępne](#wymagania-wstępne)
2. [Konfiguracja środowiska](#konfiguracja-środowiska)
3. [Deployment Crawlera](#deployment-crawlera)
4. [Deployment Backendu](#deployment-backendu)
5. [Deployment Frontendu](#deployment-frontendu)
6. [Konfiguracja zewnętrznych serwisów](#konfiguracja-zewnętrznych-serwisów)
7. [Testing](#testing)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## 1. WYMAGANIA WSTĘPNE

### **A. Konta i Klucze API**

Musisz mieć konta i klucze dla:

- [ ] **GitHub** - kod źródłowy
- [ ] **Vercel** - frontend + backend API
- [ ] **Hetzner** lub **AWS** - crawler service
- [ ] **BrightData** - residential proxies (€100-300/mies)
- [ ] **OpenAI** - GPT-4 API (€20-50/mies)
- [ ] **Grok/X.AI** - Grok Cloud API (€50-100/mies) [OPTIONAL]
- [ ] **Upstash** - Redis cloud (€0-50/mies)
- [ ] **Stripe** - płatności (już masz)
- [ ] **Sentry** - error tracking (€0-50/mies)

### **B. Narzędzia lokalne**

Zainstaluj:

```bash
# Node.js 18+
node --version  # Powinno być >= 18.0.0

# Git
git --version

# PM2 (do zarządzania procesami)
npm install -g pm2
```

---

## 2. KONFIGURACJA ŚRODOWISKA

### **A. Sklonuj Repozytoria**

```bash
# Frontend + Backend
cd c:\
git clone https://github.com/your-repo/dealsense-mvp.git dealsense-100

# Crawler (jeśli osobne repo)
cd "c:\DEALSENSE AI"
# Crawler jest już w server/crawler/
```

### **B. Zainstaluj Dependencies**

```bash
# Frontend
cd c:\dealsense-100
npm install

# Crawler
cd "c:\DEALSENSE AI\server\crawler"
npm install
```

---

## 3. DEPLOYMENT CRAWLERA

### **OPCJA A: Hetzner VPS (RECOMMENDED - €50/mies)**

#### **Krok 1: Zamów VPS**

1. Idź na https://www.hetzner.com/cloud
2. Wybierz: **CPX31** (8 vCPU, 16GB RAM) - €15.90/mies
3. Lokalizacja: **Falkenstein, Germany** (najbliżej NL)
4. OS: **Ubuntu 22.04**
5. SSH Key: Dodaj swój klucz publiczny

#### **Krok 2: Połącz się z serwerem**

```bash
ssh root@YOUR_SERVER_IP
```

#### **Krok 3: Setup środowiska**

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Redis
apt-get install -y redis-server
systemctl start redis
systemctl enable redis

# Install PM2
npm install -g pm2

# Install Git
apt-get install -y git
```

#### **Krok 4: Deploy crawlera**

```bash
# Clone repo
cd /opt
git clone https://github.com/your-repo/dealsense-crawler.git
cd dealsense-crawler/server/crawler

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env
```

#### **Krok 5: Konfiguruj .env**

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# BrightData Proxies
USE_PROXY=true
PROXY_PROVIDER=brightdata
BRIGHTDATA_USERNAME=your_brightdata_username
BRIGHTDATA_PASSWORD=your_brightdata_password
BRIGHTDATA_PORT=22225

# OpenAI (GPT-4)
OPENAI_API_KEY=sk-proj-...

# Grok Cloud (OPTIONAL)
GROK_API_KEY=xai-...
GROK_API_URL=https://api.x.ai/v1

# QuantBoost
QUANTBOOST_ENABLED=true

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Environment
NODE_ENV=production

# Internal API Token (generate random 32+ chars)
API_TOKEN=your_super_secret_token_min_32_chars_here
```

#### **Krok 6: Start crawlera**

```bash
# Test run
npm start

# Jeśli działa, zatrzymaj (Ctrl+C) i uruchom z PM2
pm2 start index.js --name dealsense-crawler
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs dealsense-crawler
```

#### **Krok 7: Setup firewall**

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 3001/tcp  # Crawler API (tylko dla Twojego backend IP)
ufw enable

# Restrict crawler API to your backend IP
ufw allow from YOUR_BACKEND_IP to any port 3001
```

#### **Krok 8: Test crawlera**

```bash
# Test endpoint
curl http://localhost:3001/api/stats

# Should return JSON with crawler stats
```

---

### **OPCJA B: AWS EC2 (Bardziej skalowalny)**

#### **Krok 1: Launch EC2 Instance**

1. AWS Console → EC2 → Launch Instance
2. AMI: **Ubuntu Server 22.04 LTS**
3. Instance type: **t3.large** (2 vCPU, 8GB RAM) - €60/mies
4. Security Group:
   - SSH (22) - Twoje IP
   - Custom TCP (3001) - Backend IP
5. Key pair: Stwórz lub użyj istniejącego

#### **Krok 2-8: Identyczne jak Hetzner**

---

## 4. DEPLOYMENT BACKENDU

### **A. Vercel Functions (RECOMMENDED)**

#### **Krok 1: Połącz z Vercel**

```bash
cd c:\dealsense-100
npm install -g vercel
vercel login
```

#### **Krok 2: Konfiguruj environment variables**

W Vercel Dashboard → Settings → Environment Variables:

```bash
# Crawler
CRAWLER_URL=http://YOUR_CRAWLER_SERVER_IP:3001
CRAWLER_TOKEN=your_super_secret_token_min_32_chars_here

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Database (jeśli używasz)
DATABASE_URL=postgresql://...

# Other
NODE_ENV=production
```

#### **Krok 3: Deploy**

```bash
vercel --prod
```

#### **Krok 4: Test API**

```bash
curl https://your-app.vercel.app/api/health
```

---

## 5. DEPLOYMENT FRONTENDU

### **A. Vercel (RECOMMENDED)**

Frontend deploy się automatycznie z backendem (Next.js).

#### **Krok 1: Sprawdź build**

```bash
cd c:\dealsense-100
npm run build
```

#### **Krok 2: Deploy**

```bash
vercel --prod
```

#### **Krok 3: Custom Domain**

W Vercel Dashboard → Domains:
1. Dodaj `dealsense.nl`
2. Dodaj `www.dealsense.nl`
3. Skonfiguruj DNS:
   ```
   A     @       76.76.21.21
   CNAME www     cname.vercel-dns.com
   ```

---

## 6. KONFIGURACJA ZEWNĘTRZNYCH SERWISÓW

### **A. BrightData (Residential Proxies)**

1. Idź na https://brightdata.com
2. Sign up → Residential Proxies
3. Wybierz plan: **Pay As You Go** (€7 per GB)
4. Country: **Netherlands**
5. Credentials:
   - Username: `brd-customer-XXX-zone-residential`
   - Password: `your_password`
6. Dodaj do `.env` crawlera

**Test proxy:**
```bash
cd /opt/dealsense-crawler/server/crawler
npm run test:proxy
```

---

### **B. OpenAI (GPT-4)**

1. Idź na https://platform.openai.com
2. API Keys → Create new secret key
3. Skopiuj klucz: `sk-proj-...`
4. Dodaj do `.env`: `OPENAI_API_KEY=sk-proj-...`
5. Dodaj billing: $20-50/mies

**Test GPT:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### **C. Grok Cloud (OPTIONAL)**

1. Idź na https://x.ai
2. Sign up → API Access
3. Skopiuj klucz: `xai-...`
4. Dodaj do `.env`: `GROK_API_KEY=xai-...`

---

### **D. Upstash Redis (Cloud)**

1. Idź na https://upstash.com
2. Create Database → Redis
3. Region: **EU-West-1** (Ireland - najbliżej NL)
4. Copy connection string
5. Dodaj do `.env` crawlera:
   ```
   REDIS_HOST=your-redis.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your_password
   ```

---

### **E. Sentry (Error Tracking)**

1. Idź na https://sentry.io
2. Create Project → Node.js
3. Copy DSN: `https://...@sentry.io/...`
4. Dodaj do `.env` crawlera: `SENTRY_DSN=...`
5. Dodaj do Vercel env variables

---

### **F. Stripe (Płatności)**

Już masz setup, ale sprawdź:

1. Stripe Dashboard → API Keys
2. Publishable key: `pk_live_...`
3. Secret key: `sk_live_...`
4. Webhook: `https://your-app.vercel.app/api/webhook/stripe`
5. Webhook secret: `whsec_...`

---

## 7. TESTING

### **A. Test Crawlera**

```bash
# SSH do crawlera
ssh root@YOUR_CRAWLER_IP

# Test crawl
curl -X POST http://localhost:3001/api/enqueue \
  -H "Authorization: Bearer YOUR_CRAWLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.bol.com/nl/s/?searchtext=1234567890123",
    "category": "products",
    "ean": "1234567890123"
  }'

# Check stats
curl http://localhost:3001/api/stats \
  -H "Authorization: Bearer YOUR_CRAWLER_TOKEN"
```

---

### **B. Test Backend API**

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test scan
curl -X POST https://your-app.vercel.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"ean": "1234567890123"}'
```

---

### **C. Test Frontend**

1. Otwórz: `https://your-app.vercel.app`
2. Zarejestruj test account
3. Skanuj produkt (EAN)
4. Sprawdź czy wyniki się pokazują
5. Test płatności (Stripe test mode)

---

## 8. MONITORING

### **A. Crawler Monitoring**

```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs dealsense-crawler --lines 100

# Restart jeśli potrzeba
pm2 restart dealsense-crawler
```

---

### **B. Sentry Dashboard**

1. Idź na https://sentry.io
2. Sprawdź errors
3. Setup alerts (Slack/Email)

---

### **C. Vercel Analytics**

1. Vercel Dashboard → Analytics
2. Sprawdź:
   - Response times
   - Error rates
   - Traffic

---

### **D. Daily Health Check**

Setup cron job na crawlerze:

```bash
# Dodaj do crontab
crontab -e

# Add line:
0 9 * * * curl http://localhost:3001/api/health || echo "Crawler down!" | mail -s "Alert" your@email.com
```

---

## 9. TROUBLESHOOTING

### **Problem: Crawler nie działa**

```bash
# Check logs
pm2 logs dealsense-crawler

# Check Redis
redis-cli ping  # Should return PONG

# Restart
pm2 restart dealsense-crawler

# Check ports
netstat -tulpn | grep 3001
```

---

### **Problem: Proxy errors (403/blocked)**

1. Sprawdź BrightData balance
2. Sprawdź credentials w `.env`
3. Test proxy:
   ```bash
   npm run test:proxy
   ```
4. Zmień proxy provider na SmartProxy (backup)

---

### **Problem: GPT errors**

1. Sprawdź OpenAI balance
2. Sprawdź API key
3. Test:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

---

### **Problem: Frontend nie łączy się z crawlerem**

1. Sprawdź `CRAWLER_URL` w Vercel env
2. Sprawdź `CRAWLER_TOKEN`
3. Sprawdź firewall na crawlerze:
   ```bash
   ufw status
   ```
4. Test connection:
   ```bash
   curl http://YOUR_CRAWLER_IP:3001/api/stats \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 10. CHECKLIST PRZED LAUNCH

### **Crawler:**
- [ ] VPS/EC2 uruchomiony
- [ ] Redis działa
- [ ] PM2 uruchomiony
- [ ] BrightData proxy działa
- [ ] OpenAI API key dodany
- [ ] Sentry DSN dodany
- [ ] Firewall skonfigurowany
- [ ] Health check działa

### **Backend:**
- [ ] Vercel deployed
- [ ] Environment variables ustawione
- [ ] CRAWLER_URL poprawny
- [ ] CRAWLER_TOKEN poprawny
- [ ] Stripe keys dodane
- [ ] API endpoints działają

### **Frontend:**
- [ ] Vercel deployed
- [ ] Custom domain skonfigurowany
- [ ] SSL certificate aktywny
- [ ] Scan flow działa
- [ ] Payment flow działa
- [ ] Biometric auth działa

### **Monitoring:**
- [ ] Sentry alerts setup
- [ ] PM2 monitoring aktywny
- [ ] Daily health checks setup
- [ ] Slack webhooks (optional)

---

## 11. KOSZTY MIESIĘCZNE

| Serwis | Koszt |
|--------|-------|
| **Hetzner VPS** | €50 |
| **BrightData Proxies** | €100-300 |
| **OpenAI GPT-4** | €20-50 |
| **Grok Cloud** | €50-100 (optional) |
| **Upstash Redis** | €20 |
| **Sentry** | €0-50 |
| **Vercel** | €0 (hobby) |
| **Stripe** | 9% commission |
| **TOTAL** | **€240-570/mies** |

---

## 12. KONTAKTY SUPPORT

- **BrightData:** support@brightdata.com
- **OpenAI:** help.openai.com
- **Vercel:** vercel.com/support
- **Hetzner:** support.hetzner.com
- **Stripe:** support.stripe.com

---

## 13. BACKUP & RECOVERY

### **Backup Crawlera:**

```bash
# Backup Redis data
redis-cli --rdb /backup/dump.rdb

# Backup code
cd /opt
tar -czf dealsense-crawler-backup.tar.gz dealsense-crawler/

# Upload to S3/Backblaze
```

### **Restore:**

```bash
# Restore Redis
redis-cli --rdb /backup/dump.rdb

# Restore code
tar -xzf dealsense-crawler-backup.tar.gz
pm2 restart dealsense-crawler
```

---

## 14. SCALING (Przyszłość)

Gdy masz >100k users:

1. **Crawler:** Dodaj więcej VPS (load balancer)
2. **Redis:** Upgrade do Redis Cluster
3. **Proxies:** Zwiększ BrightData plan
4. **Backend:** Vercel auto-scale (unlimited)

---

## ✅ GOTOWE!

Aplikacja powinna działać na:
- **Frontend:** `https://dealsense.nl`
- **Backend API:** `https://dealsense.nl/api/*`
- **Crawler:** `http://YOUR_SERVER_IP:3001`

**Powodzenia z launch! 🚀**

---

**Ostatnia aktualizacja:** 16 marca 2026  
**Wersja:** 1.0.0  
**Autor:** DealSense Team
