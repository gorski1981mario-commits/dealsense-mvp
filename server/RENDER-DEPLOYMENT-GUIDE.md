# 🚀 RENDER.COM - DEPLOYMENT GUIDE

**Data:** 21 marca 2026  
**Wersja:** Deal Score V2 + Cost Optimization

---

## ⚠️ **WAŻNE: CZYSZCZENIE STARYCH ZMIENNYCH**

Render.com ma pełno **starych, nieaktywnych zmiennych** związanych z crawlerem i starym systemem pricing. **Musimy je usunąć!**

---

## 🗑️ **KROK 1: USUŃ TE ZMIENNE Z RENDER.COM**

### **Crawler (ZAMROŻONY - nie używamy):**
```
❌ CRAWLER_HEADLESS
❌ CRAWLER_MAX_DOMAINS
❌ CRAWLER_TIMEOUT
```

### **Pricing (STARY SYSTEM - mamy Deal Score V2):**
```
❌ PRICING_NICHE_EXCEPTION_ENABLED
❌ PRICING_NICHE_EXCLUDE_DOMAINS
❌ PRICING_NICHE_MIN_RATING
❌ PRICING_NICHE_MIN_REVIEWS
❌ PRICING_SCAM_MIN_PRICE_RATIO
❌ PRICING_SCAM_MIN_RATING
❌ PRICING_SCAM_MIN_REVIEWS
❌ PRICING_SELLER_BLACKLIST_JSON
❌ PRICING_SELLER_RULES_ENABLED
❌ PRICING_SELLER_WHITELIST_JSON
```

### **Google Shopping (DUPLIKATY):**
```
❌ GOOGLE_SHOPPING_NUM_* (wszystkie duplikaty)
```
**Zostaw tylko:**
- ✅ `GOOGLE_SHOPPING_API_KEY`
- ✅ `GOOGLE_SHOPPING_NUM_RESULTS`
- ✅ `GOOGLE_SHOPPING_NUM_PAGES`

### **Market Cache (NIEAKTYWNE):**
```
❌ MARKET_DISK_CACHE_ENABLED
❌ MARKET_DISK_CACHE_PATH
```

### **Proxy (ZAMROŻONE - nie używamy):**
```
❌ PROXY_COUNTRY
❌ PROXY_HOST
❌ PROXY_PASSWORD
❌ PROXY_PORT
❌ PROXY_PROVIDER
❌ PROXY_USERNAME
❌ USE_PROXY
```

---

## ✅ **KROK 2: DODAJ TYLKO TE ZMIENNE**

### **1. Google Shopping API (SearchAPI.io) - GŁÓWNE ŹRÓDŁO**
```bash
GOOGLE_SHOPPING_API_KEY=your_searchapi_key_here
GOOGLE_SHOPPING_NUM_RESULTS=100
GOOGLE_SHOPPING_NUM_PAGES=1
```

### **2. SerpAPI (Fallback)**
```bash
SERPAPI_API_KEY=your_serpapi_key_here
```

### **3. Crawler & Proxy (WYŁĄCZONE)**
```bash
USE_OWN_CRAWLER=false
USE_PROXY=false
```

### **4. Mock Fallback**
```bash
USE_MOCK_FALLBACK=false
```

### **5. Deal Score V2**
```bash
USE_DEAL_SCORE_V2=true
USE_ROTATION_ENGINE=true
USE_LONG_TAIL_QUERIES=false
MAX_QUERY_VARIANTS=30
```

### **6. Cost Optimization (NAJWIĘKSZA OSZCZĘDNOŚĆ!)**
```bash
USE_CACHE_FIRST=true
USE_QUERY_SCORING=true
USE_ADAPTIVE_FETCH=true
USE_SOURCE_PRIORITY=true
USE_ADAPTIVE_THRESHOLD=true
```

### **7. Cache Configuration**
```bash
MARKET_CACHE_BYPASS=false
MARKET_LOG_SILENT=false
```

### **8. Upstash Redis (opcjonalny)**
```bash
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### **9. Node Environment**
```bash
NODE_ENV=production
PORT=3000
```

---

## 📊 **PODSUMOWANIE**

### **PRZED (STARE):**
- 30+ zmiennych środowiskowych
- Crawler (nieaktywny)
- Proxy (nieaktywne)
- Stary pricing system
- Duplikaty i nieużywane zmienne

### **PO (NOWE):**
- ~15 zmiennych środowiskowych
- Tylko aktywne funkcje
- Deal Score V2
- Cost Optimization
- Czysta konfiguracja

---

## 🎯 **INSTRUKCJA KROK PO KROKU**

### **1. Otwórz Render.com Dashboard**
- Przejdź do swojego Web Service
- Kliknij "Environment"

### **2. Usuń stare zmienne**
- Kliknij ikonę kosza (🗑️) przy każdej zmiennej z listy "DO USUNIĘCIA"
- Potwierdź usunięcie

### **3. Dodaj nowe zmienne**
- Kliknij "Add Environment Variable"
- Skopiuj nazwę i wartość z listy "DO DODANIA"
- Powtórz dla wszystkich zmiennych

### **4. Uzupełnij API Keys**
- `GOOGLE_SHOPPING_API_KEY`: pobierz z https://www.searchapi.io/
- `SERPAPI_API_KEY`: pobierz z https://serpapi.com/

### **5. Zapisz i Deploy**
- Kliknij "Save Changes"
- Render automatycznie zrobi redeploy
- Poczekaj ~2-3 minuty

### **6. Sprawdź logi**
- Otwórz "Logs"
- Szukaj:
  ```
  ✅ Znaleziono X ofert z Google Shopping
  [CacheFirst] HIT! Saved API call
  [QueryScoring] Selected X best queries
  ```

---

## ✅ **WERYFIKACJA**

Po deploymencie sprawdź:

1. **API działa:**
   ```bash
   curl https://your-app.onrender.com/api/market?product=iPhone+15
   ```

2. **Cache działa:**
   - Pierwsze zapytanie: cache MISS
   - Drugie zapytanie (w ciągu 5-15min): cache HIT

3. **Cost Optimization działa:**
   - Sprawdź logi: `[CacheFirst]`, `[QueryScoring]`, `[RotationEngine]`

---

## 🚨 **TROUBLESHOOTING**

### **Problem: Brak wyników**
- Sprawdź czy `GOOGLE_SHOPPING_API_KEY` jest poprawny
- Sprawdź czy `USE_MOCK_FALLBACK=false`
- Sprawdź logi: szukaj błędów API

### **Problem: Za wysokie koszty**
- Sprawdź czy `USE_CACHE_FIRST=true`
- Sprawdź czy `USE_QUERY_SCORING=true`
- Sprawdź statystyki: `/api/stats/cost-optimization`

### **Problem: Crawler próbuje działać**
- Upewnij się że `USE_OWN_CRAWLER=false`
- Upewnij się że `USE_PROXY=false`

---

## 📞 **WSPARCIE**

Jeśli coś nie działa:
1. Sprawdź logi w Render.com
2. Sprawdź `.env.production` (ten plik)
3. Sprawdź `COST-OPTIMIZATION.md`
4. Sprawdź `DEAL-SCORE-CORE-VALUES.md`

---

**GOTOWE! System jest czysty i zoptymalizowany!** 🎉
