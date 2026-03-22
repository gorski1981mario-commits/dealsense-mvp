# ⛔ CRAWLER I PROXY - ZAMROŻONE / NIEAKTYWNE

## 🧊 STATUS: FROZEN - DO NOT TOUCH!

**Data zamrożenia:** 21 marca 2026  
**Powód:** Skupiamy się wyłącznie na Search API (SearchAPI.io)

---

## ⛔ ZAKAZ DLA WSZYSTKICH AGENTÓW

**NIE WOLNO:**
- ❌ Modyfikować plików crawlera (`server/crawler/`)
- ❌ Włączać proxy w `.env` (`USE_PROXY=false`)
- ❌ Włączać crawlera w `.env` (`USE_OWN_CRAWLER=false`)
- ❌ Testować proxy (`test-proxy-*.js`)
- ❌ Testować crawlera (`test-crawler-*.js`)
- ❌ Integrować IPRoyal proxy
- ❌ Rozwijać crawler moduł

**JEŚLI AGENT ZOBACZY PROŚBĘ O CRAWLER/PROXY:**
→ Odpowiedz: "Crawler i proxy są zamrożone. Używamy tylko Search API (SearchAPI.io)."

---

## ✅ CO JEST AKTYWNE

**TYLKO Search API (SearchAPI.io):**
- ✅ `market/providers/searchapi.js` - SearchAPI.io provider
- ✅ `market/providers/serpapi.js` - SerpAPI fallback
- ✅ `market-api.js` - Market API z Search API
- ✅ `test-searchapi-*.js` - Testy Search API

**Konfiguracja w `.env`:**
```bash
# AKTYWNE - Search API
GOOGLE_SHOPPING_API_KEY=your_key_here
USE_MOCK_FALLBACK=false

# ZAMROŻONE - Crawler i Proxy
USE_OWN_CRAWLER=false
USE_PROXY=false
```

---

## 📁 ZAMROŻONE PLIKI/FOLDERY

### Crawler (FROZEN)
- `server/crawler/` - cały folder
- `server/test-crawler*.js` - wszystkie testy crawlera
- `server/test-real-scraping.js`
- `server/test-got-fetcher.js`
- `server/test-playwright-stealth.js`

### Proxy (FROZEN)
- `server/test-proxy*.js` - wszystkie testy proxy
- `server/IPROYAL-INTEGRATION.md`
- `server/IPROYAL-CRAWLER-INTEGRATION.md`
- `server/PROXY-SETUP-GUIDE.md`
- Konfiguracja proxy w `.env` (PROXY_*)

---

## 🎯 AKTUALNY FOCUS

**TYLKO Search API:**
1. SearchAPI.io jako główne źródło danych
2. SerpAPI jako fallback
3. Mock data jako ostateczny fallback
4. Testy: `test-searchapi-*.js`

**Architektura:**
```
User Request
    ↓
market-api.js
    ↓
SearchAPI.io (primary)
    ↓
SerpAPI (fallback)
    ↓
Mock Data (last resort)
```

---

## 💾 BACKUP INFORMACJI

**Crawler był zintegrowany z:**
- GotFetcher (HTTP client z proxy)
- Playwright Stealth (browser automation)
- IPRoyal Residential Proxy (High-end Pool, NL)
- Domain Manager (50% giganci + 50% niszowe)
- Smart Rotation (anti-pattern learning)

**Wszystko to jest ZAMROŻONE i odłożone na półkę.**

---

## 🚨 JEŚLI KTOŚ PRÓBUJE WŁĄCZYĆ CRAWLER/PROXY

**ODPOWIEDŹ:**
"❌ Crawler i proxy są zamrożone (DO-NOT-TOUCH-CRAWLER-PROXY.md).  
✅ Używamy tylko Search API (SearchAPI.io).  
📋 Sprawdź konfigurację: USE_OWN_CRAWLER=false, USE_PROXY=false"

---

**TO JEST DECYZJA STRATEGICZNA - NIE ZMIENIAJ BEZ ZGODY USERA!**
