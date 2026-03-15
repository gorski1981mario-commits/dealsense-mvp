# 🎯 KWANT - WSZYSTKIE PARAMETRY PRODUKCYJNE

**Data:** 2026-03-15  
**Cel:** Średnia 4.0 (nie 3.5, nie 4.6) - optymalne dla produkcji

---

## 📊 **KATEGORIA 1: ANTI-SCAM FILTERING**

### **Podstawowe (dla wszystkich sklepów):**
```
PRICING_SCAM_MIN_RATING = 4.0
  ↳ Minimalna ocena sklepu (było 3.5 → ZMIANA na 4.0)
  ↳ Odrzuca sklepy <4.0 gwiazdek
  ↳ Chroni przed scam (€15.95 dla Nintendo)

PRICING_SCAM_MIN_REVIEWS = 30
  ↳ Minimum recenzji dla wiarygodności
  ↳ Odrzuca nowe/podejrzane sklepy
  ↳ OPTYMALNE (zostaje 30)

PRICING_SCAM_MIN_PRICE_RATIO = 0.35
  ↳ Cena nie może być <35% średniej rynkowej
  ↳ Odrzuca oferty typu "€15.95 dla Nintendo €350"
  ↳ OPTYMALNE (zostaje 0.35)
```

### **Niche Shops (małe sklepy z dobrą opinią):**
```
PRICING_NICHE_EXCEPTION_ENABLED = true
  ↳ Pozwala małym sklepom z wysoką oceną

PRICING_NICHE_MIN_RATING = 4.0
  ↳ Minimalna ocena dla niche shops (było 4.6 → ZMIANA na 4.0)
  ↳ Spójne ze średnią 4.0

PRICING_NICHE_MIN_REVIEWS = 10
  ↳ Mniej recenzji OK jeśli rating wysoki
  ↳ OPTYMALNE (zostaje 10)

PRICING_NICHE_EXCLUDE_SELLERS = 1
  ↳ Wykluczanie podejrzanych sprzedawców
```

---

## 📊 **KATEGORIA 2: PRICING V2 ENGINE**

### **Quality Shops Filtering:**
```
PRICING_V2_MIN_RATING = 4.0
  ↳ Minimalna ocena dla "quality shops" (było 3.5/3.8 → ZMIANA na 4.0)
  ↳ Spójne ze średnią 4.0

PRICING_V2_MAX_RATING = 4.8
  ↳ Maksymalna ocena (było 4.2 → ZMIANA na 4.8)
  ↳ Odrzuca podejrzanie idealne 5.0
  ↳ Ale pozwala na bardzo dobre sklepy 4.5-4.8

PRICING_V2_MIN_REVIEWS = 30
  ↳ Minimum recenzji dla quality shops (było 50 → ZMIANA na 30)
  ↳ Spójne z SCAM_MIN_REVIEWS
  ↳ Więcej sklepów przejdzie filtr

PRICING_V2_MAX_RATING_DEVIATION = 1.5
  ↳ Maksymalne odchylenie od średniej
  ↳ OPTYMALNE (zostaje 1.5)
```

### **Soft Review Penalty (opcjonalne):**
```
PRICING_V2_SOFT_REVIEW_PENALTY = false
  ↳ Wyłączone (nie karać za mało recenzji jeśli rating OK)

PRICING_V2_PENALTY_REVIEWS_TARGET = 200
  ↳ Target recenzji (jeśli penalty włączone)

PRICING_V2_PENALTY_STRENGTH = 0.25
  ↳ Siła kary (jeśli penalty włączone)
```

---

## 📊 **KATEGORIA 3: DEAL SCORE**

### **Scoring Thresholds (NIE ZMIENIAĆ - optymalne):**
```
≥15% oszczędności → Score 9 (ŚWIETNY DEAL)
≥10% oszczędności → Score 8 (BARDZO DOBRY)
≥7%  oszczędności → Score 7 (DOBRY)
≥5%  oszczędności → Score 6 (OK)
≥3%  oszczędności → Score 5 (SŁABY)
<3%  oszczędności → Score 3 (ZŁY)
```

### **Confidence Level:**
```
≥3 oferty → "hoog" (wysoka pewność)
≥1 oferta → "medium" (średnia pewność)
0 ofert  → "laag" (niska pewność)
```

---

## 📊 **KATEGORIA 4: MARKET API**

### **Google Shopping API:**
```
GOOGLE_SHOPPING_API_KEY = [TWÓJ KLUCZ]
  ↳ SearchAPI.io klucz

GOOGLE_SHOPPING_NUM_RESULTS = 100
  ↳ Ile ofert pobierać z API

GOOGLE_SHOPPING_NUM_PAGES = 1
  ↳ Ile stron wyników
```

### **Fallback:**
```
USE_MOCK_FALLBACK = false
  ↳ Tylko prawdziwe oferty (bez mock)
  ↳ PRODUKCJA: false

SERPAPI_API_KEY = [OPCJONALNY]
  ↳ Backup API jeśli SearchAPI down
```

---

## 📊 **KATEGORIA 5: CACHE & PERFORMANCE**

```
MARKET_DISK_CACHE_ENABLED = 1
  ↳ Cache ofert na dysku

MARKET_LOG_SILENT = 1
  ↳ Ciche logi (bez spamu)

KWANT_ALLOW_NET = true
  ↳ Pozwól na requesty sieciowe

DEALSENSE_ALLOW_LIVE = true
  ↳ Pozwól na live testy
```

---

## 📊 **KATEGORIA 6: SELLER RULES (opcjonalne)**

```
PRICING_SELLER_RULES_ENABLED = false
  ↳ Wyłączone (nie używamy whitelist/blacklist)

PRICING_SELLER_WHITELIST_JSON = []
  ↳ Lista zaufanych sprzedawców (pusta)

PRICING_SELLER_BLACKLIST_JSON = []
  ↳ Lista zablokowanych sprzedawców (pusta)
```

---

## 🎯 **PODSUMOWANIE ZMIAN (ŚREDNIA 4.0):**

### **BYŁO (stare):**
- SCAM_MIN_RATING: 3.5 ❌
- NICHE_MIN_RATING: 4.6 ❌
- V2_MIN_RATING: 3.5/3.8 ❌
- V2_MAX_RATING: 4.2 ❌
- V2_MIN_REVIEWS: 50 ❌

### **BĘDZIE (nowe - ŚREDNIA 4.0):**
- SCAM_MIN_RATING: **4.0** ✅
- NICHE_MIN_RATING: **4.0** ✅
- V2_MIN_RATING: **4.0** ✅
- V2_MAX_RATING: **4.8** ✅
- V2_MIN_REVIEWS: **30** ✅

---

## 📋 **PEŁNA LISTA ENV DLA RENDER:**

```bash
# ANTI-SCAM
PRICING_SCAM_MIN_RATING=4.0
PRICING_SCAM_MIN_REVIEWS=30
PRICING_SCAM_MIN_PRICE_RATIO=0.35

# NICHE SHOPS
PRICING_NICHE_EXCEPTION_ENABLED=true
PRICING_NICHE_MIN_RATING=4.0
PRICING_NICHE_MIN_REVIEWS=10
PRICING_NICHE_EXCLUDE_SELLERS=1

# PRICING V2
PRICING_V2_MIN_RATING=4.0
PRICING_V2_MAX_RATING=4.8
PRICING_V2_MIN_REVIEWS=30
PRICING_V2_MAX_RATING_DEVIATION=1.5
PRICING_V2_SOFT_REVIEW_PENALTY=false

# MARKET API
GOOGLE_SHOPPING_API_KEY=[TWÓJ_KLUCZ]
GOOGLE_SHOPPING_NUM_RESULTS=100
GOOGLE_SHOPPING_NUM_PAGES=1
USE_MOCK_FALLBACK=false

# CACHE
MARKET_DISK_CACHE_ENABLED=1
MARKET_LOG_SILENT=1
KWANT_ALLOW_NET=true
DEALSENSE_ALLOW_LIVE=true

# NODE
NODE_ENV=production
PORT=10000
```

---

## ✅ **NASTĘPNE KROKI:**

1. Zaktualizować ENV na Render (zmienić 3.5→4.0, 4.6→4.0, 4.2→4.8, 50→30)
2. Naprawić `/api/market` żeby używał anti-scam
3. Redeploy backend
4. Test z prawdziwymi produktami

**Status:** GOTOWE DO WDROŻENIA 🚀
