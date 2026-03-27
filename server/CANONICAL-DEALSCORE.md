# CANONICAL DEALSCORE - KANONICZNA PRAWDA

**Data:** 27 marca 2026  
**Status:** PRODUCTION READY  
**Wersja:** 2.0 FINAL

---

## 🎯 MISJA

**Pokazujemy użytkownikowi TYLKO:**
- ✅ Sprawdzone sklepy (Trust >= 50)
- ✅ Nowe produkty (nie używane/refurbished)
- ✅ Sklepy NL/BE (nie międzynarodowe marketplace)
- ✅ Pełne produkty (nie akcesoria)
- ✅ Realne ceny (nie scam/podejrzane)

**NIE POKAZUJEMY:**
- ❌ Podejrzanych sklepów (Trust < 50)
- ❌ Używanych/refurbished
- ❌ Etsy, OnBuy, Cdiscount (międzynarodowe)
- ❌ Akcesoriów zamiast produktu
- ❌ Fejków/demo danych

---

## 📊 ARCHITEKTURA SYSTEMU

```
SearchAPI → RAW DATA (70 ofert)
    ↓
SMART BUNDLES (PRZED filtrami!)
├─ extractSmartBundles()
├─ Wyciąga akcesoria (case, screen, charger)
└─ Zwraca: mainProducts + smartBundles
    ↓
FILTRY (8 warstw)
├─ 1. Price Range (40-150% base price)
├─ 2. Banned Sellers (35+ scam/używane)
├─ 3. Banned Keywords (150+ akcesoria/używane)
├─ 4. NL+BE Filter (tylko .nl/.be + whitelist)
├─ 5. Domain Blacklist (.fr, .de, .pl, etc)
├─ 6. Price Sanity Check (max 50% oszczędności)
├─ 7. Base Seller Filter (nie pokazuj tego samego sklepu)
└─ 8. Condition Check (tylko nowe)
    ↓
CLEAN DATA (10-30 ofert)
    ↓
DEALSCORE V2
├─ Price Score (40%)
├─ Trust Score (30%) ← THRESHOLD = 50
├─ Fit Score (20%)
├─ Freshness (10%)
└─ Niche Boost (+30%)
    ↓
SCORED OFFERS (8-15 ofert)
    ↓
ROTATION ENGINE (40/30/20/10)
├─ 40% TOP (najwyższy score)
├─ 30% NICHE (niszowe + boost)
├─ 20% FRESH (< 24h)
└─ 10% EXPERIMENT (random)
    ↓
FINAL OUTPUT (3-10 ofert)
```

---

## 🛡️ TRUST ENGINE - SERCE SYSTEMU

**Lokalizacja:** `server/scoring/trustEngine.js`

### TRUSTED SELLERS (Trust = 85)
```javascript
const trustedSellers = [
  // Giganci NL
  'bol.com', 'coolblue', 'mediamarkt', 'amazon.nl', 'alternate',
  'belsimpel', 'wehkamp', 'de bijenkorf', 'expert', 'azerty',
  
  // DIY & Dom
  'gamma', 'praxis', 'karwei', 'hornbach', 'intratuin',
  'ikea', 'hema', 'blokker', 'action', 'fonq',
  
  // Sport & Moda
  'decathlon', 'intersport', 'perry sport', 'aktiesport',
  'zalando', 'aboutyou', 'douglas', 'rituals'
];
```

### TRUST SCORE CALCULATION (0-100)
```javascript
function getTrustScore(offer) {
  let score = 0;
  
  // 1. Trusted Seller = 85 punktów (GIGANCI)
  if (isTrustedSeller) score = 85;
  
  // 2. HTTPS = +20 punktów
  if (hasHTTPS(offer.url)) score += 20;
  
  // 3. Reviews = +30 punktów max
  if (rating >= 4.5 && reviews >= 10) score += 30;
  else if (rating >= 4.0 && reviews >= 5) score += 20;
  else if (rating >= 3.5 && reviews >= 1) score += 10;
  
  // 4. Wiek domeny = +20 punktów
  if (age >= 5 lat) score += 20;
  else if (age >= 2 lat) score += 10;
  
  // 5. Polityka zwrotów = +15 punktów
  if (hasReturnPolicy(offer)) score += 15;
  
  // 6. Adres NL = +15 punktów
  if (hasNLAddress(offer)) score += 15;
  
  return Math.min(100, score);
}
```

### TRUST THRESHOLD = 50 ⭐
```javascript
function isTrusted(offer) {
  return getTrustScore(offer) >= 50;
}
```

**EFEKT:**
- **Giganci:** Trust 85-100 ✅ (zawsze przechodzą)
- **Niszowe z reviews 4.0+:** Trust 50-70 ✅ (przechodzą)
- **Nowe/podejrzane:** Trust < 50 ❌ (ODRZUCONE)

---

## 🎲 ROTATION ENGINE - RÓŻNORODNOŚĆ

**Lokalizacja:** `server/scoring/rotationEngine.js`

### STANDARD MODE (40/30/20/10)
```javascript
function rotateDeals(offers, options) {
  const maxResults = 30;
  
  // Podział:
  const topCount = maxResults * 0.4;      // 40% = 12 ofert
  const nicheCount = maxResults * 0.3;    // 30% = 9 ofert
  const freshCount = maxResults * 0.2;    // 20% = 6 ofert
  const experimentCount = maxResults * 0.1; // 10% = 3 oferty
  
  // 1. TOP (40%) - najwyższy DealScore
  // 2. NICHE (30%) - niszowe sklepy z Niche Boost
  // 3. FRESH (20%) - oferty < 24h (flash sales)
  // 4. EXPERIMENT (10%) - random (odkrywanie nowych)
  
  return rotated;
}
```

**DLACZEGO?**
- **40% TOP:** Gwarantowane najlepsze deale
- **30% NICHE:** Największe przebicia (niszowe sklepy)
- **20% FRESH:** Flash sales, wyprzedaże
- **10% EXPERIMENT:** Anti-pattern learning

---

## 🔍 FILTRY - 8 WARSTW OCHRONY

### 1. PRICE RANGE (40-150%)
```javascript
const minPrice = basePrice * 0.4;  // 40% - odrzuca akcesoria
const maxPrice = basePrice * 1.5;  // 150% - odrzuca overpriced
```

### 2. BANNED SELLERS (35+)
```javascript
const bannedSellers = [
  // Używane/Second-hand
  'marktplaats', 'ebay', 'vinted', 'back market', 'swappie',
  'refurbed', 'rebuy', 'used products', 'used',
  
  // Serwisy napraw
  'reparatie', 'repair', 'iservices', 'gsm repair',
  
  // Marketplace międzynarodowe
  'etsy', 'onbuy', 'fruugo', 'aliexpress', 'joom', 'wish',
  'temu', 'cdiscount', 'rakuten',
  
  // Outlets
  'outlet', 'tvoutlet'
];
```

### 3. BANNED KEYWORDS (150+)
```javascript
const bannedKeywords = [
  // Akcesoria
  'case', 'cover', 'hoesje', 'screen protector', 'charger',
  'adapter', 'cable', 'kabel', 'stofzak', 'filter',
  
  // Używane/Refurbished
  'used', 'tweedehands', 'occasion', 'refurbished', 'renewed',
  'gereviseerd', 'gebruikt', 'zo goed als nieuw',
  
  // Condition indicators
  'damaged', 'defect', 'broken', 'kapot', 'beschadigd',
  'without box', 'zonder doos', 'incomplete', 'onderdelen'
];
```

### 4. NL+BE FILTER
```javascript
// Tylko .nl i .be domeny + whitelist (100+ sklepów)
const hasNLDomain = url.includes('.nl') || seller.includes('.nl');
const hasBEDomain = url.includes('.be') || seller.includes('.be');
const isKnownNL = knownNLShops.some(shop => seller.includes(shop));
```

### 5. DOMAIN BLACKLIST
```javascript
const bannedDomains = [
  '.fr', '.de', '.pl', '.it', '.es', '.pt', 
  '.at', '.ch', '.se', '.dk', '.no', '.fi'
];
```

### 6. PRICE SANITY CHECK
```javascript
// Max 50% oszczędności (wyjątek: trusted sellers 70%)
const savingsPercent = (basePrice - price) / basePrice * 100;

if (savingsPercent > 50) {
  // Trusted sellers: max 70%
  if (isTrustedSeller && savingsPercent <= 70) return true;
  
  // Inne: ODRZUĆ
  return false;
}
```

### 7. BASE SELLER FILTER
```javascript
// Nie pokazuj tego samego sklepu co sklep bazowy
if (baseSeller) {
  offers = offers.filter(o => {
    const seller = o.seller.toLowerCase();
    const base = baseSeller.toLowerCase();
    return !seller.includes(base) && !base.includes(seller);
  });
}
```

### 8. CONDITION CHECK
```javascript
// Tylko nowe produkty
const condition = (offer.condition || '').toLowerCase();
if (condition.includes('used') || 
    condition.includes('refurbished') ||
    condition.includes('renewed')) {
  return false; // ODRZUĆ
}
```

---

## 📦 SMART BUNDLES - PRZED FILTRAMI!

**KRYTYCZNE:** Smart Bundles MUSZĄ być wyciągnięte PRZED filtrami!

```javascript
// ❌ ŹLE (stary system):
offers = applyFilters(offers);  // Akcesoria odrzucone!
smartBundles = extractSmartBundles(offers);  // Brak akcesoriów

// ✅ DOBRZE (nowy system):
const bundleResult = extractSmartBundles(offers);  // RAW data
smartBundles = bundleResult.smartBundles;  // Akcesoria zapisane
offers = bundleResult.mainProducts;  // Tylko główne produkty
offers = applyFilters(offers);  // Filtry tylko na główne
```

**DLACZEGO?**
- Akcesoria mają słowa kluczowe "case", "screen", "charger"
- Filtry odrzucają te słowa
- Jeśli filtrujemy PRZED extractSmartBundles → brak akcesoriów!

---

## 🎯 DEALSCORE V2 - FORMULA

**Lokalizacja:** `server/scoring/dealScoreV2.js`

```javascript
function getDealScore(offer, referencePrice, options) {
  // 1. PRICE SCORE (40%)
  const priceScore = calculatePriceScore(offer.price, referencePrice);
  
  // 2. TRUST SCORE (30%)
  const trustScore = getTrustScore(offer) / 100 * 10;
  
  // 3. FIT SCORE (20%)
  const fitScore = calculateSimilarity(offer, canonical);
  
  // 4. FRESHNESS (10%)
  const freshnessScore = isFresh(offer) ? 10 : 5;
  
  // TOTAL
  let dealScore = (
    priceScore * 0.4 +
    trustScore * 0.3 +
    fitScore * 0.2 +
    freshnessScore * 0.1
  );
  
  // NICHE BOOST (+30%)
  if (isNicheShop(offer) && isTrusted(offer)) {
    dealScore *= 1.3;
  }
  
  return Math.min(10, dealScore);
}
```

**WAGI:**
- **Price (40%):** Im taniej tym lepiej
- **Trust (30%):** Tylko sprawdzone sklepy
- **Fit (20%):** Similarity do canonical product
- **Freshness (10%):** Flash sales bonus

**NICHE BOOST (+30%):**
- TYLKO dla niszowych sklepów
- TYLKO jeśli Trust >= 50
- Największe przebicia cenowe!

---

## 📋 WSPIERANE KATEGORIE (13)

### ✅ PRODUCTION READY (100% sukces)
1. **Elektronika** - 35% avg (iPhone, Samsung, laptopy)
2. **Zabawki** - 37% avg (LEGO, Playmobil)
3. **Narzędzia DIY** - 25% avg (Bosch, Makita, DeWalt)
4. **Książki** - 43% avg (Harry Potter, bestsellery)
5. **Zdrowie & Uroda** - 20% avg (Oral-B, Philips)
6. **Dziecko & Baby** - 20% avg (Bugaboo, Maxi-Cosi)
7. **Kosmetyki** - 27% avg (Estee Lauder, Chanel)

### ✅ CZĘŚCIOWO WSPIERANE (60-85% sukces)
8. **Sport & Buty** - 28% avg (Nike, Adidas)
9. **Dom & Ogród** - 30% avg (Dyson, Karcher)
10. **Rowery** - 24% avg (Gazelle, VanMoof)
11. **AGD Kuchenne** - 25% avg (KitchenAid, Nespresso)
12. **Biuro** - 30% avg (HP, Canon)
13. **Auto Akcesoria** - 27% avg (opony, wycieraczki, bagażniki)

### ❌ NIE WSPIERANE
- **Meble** (IKEA = unikalne produkty)
- **Zwierzęta** (etyczne powody)
- **Części mechaniczne** (klocki, oleje - brak dostępności)

---

## 🚀 ONBOARDING - UNIKNIĘCIE "ZONK"

### PROBLEM
User skanuje losowy produkt → brak wyników → frustracja → odinstalowanie

### ROZWIĄZANIE

**1. SMART ONBOARDING (pierwsze uruchomienie):**
```
Welkom bij DealSense! 🎯

We vinden de beste prijzen voor:
✅ Elektronica (iPhone, Samsung, laptops)
✅ Speelgoed (LEGO, Playmobil)
✅ Sport (Nike, Adidas)
✅ Huis & Tuin (Dyson, Karcher)
✅ Boeken, Fietsen, Baby, Keuken

❌ Niet ondersteund: Meubels (IKEA), auto-onderdelen

💡 TIP: Begin met een product van MediaMarkt, Coolblue of Bol.com
```

**2. CATEGORY DETECTION (przed API call):**
```javascript
if (category === 'meubels' || category === 'ikea') {
  return {
    error: 'UNSUPPORTED_CATEGORY',
    message: 'Meubels (IKEA) worden niet ondersteund - unieke producten',
    suggestion: 'Probeer: Elektronica, Speelgoed, Sport, Huis & Tuin'
  };
}
```

**3. ŻADNEGO FALLBACK DO DEMO!**
```javascript
// ❌ NIE ROBIMY TEGO:
if (offers.length === 0) {
  return demoData; // WCISKANIE KITU!
}

// ✅ ROBIMY TO:
if (offers.length === 0) {
  return {
    offers: [],
    message: 'Geen aanbiedingen gevonden voor dit product',
    suggestion: 'Probeer een ander product: iPhone, Nike, LEGO'
  };
}
```

---

## 📊 PRZYKŁADOWY OUTPUT

### ADIDAS ULTRABOOST (Bol.com €190 → Syrrakos-sport €99)

**PRZED (Trust = 0):**
```
🥇 Syrrakos-sport €99 ❌
   Trust: 35/100 (PODEJRZANY!)
   Besparing: €91 (47.9%)
```

**PO (Trust = 50):**
```
❌ Syrrakos-sport ODRZUCONY (Trust 35 < 50)

🥇 Hardloopshop €120 ✅
   Trust: 55/100 (Sprawdzony)
   Besparing: €70 (36.8%)
   Reviews: 4.2/5 (15 opinii)
```

---

## 🎯 FINALNE STATYSTYKI (z testów)

**25 produktów, 13 kategorii:**
- **Sukces:** 80% (20/25)
- **Gemiddelde besparing:** 26-28%
- **Giganten:** 19%
- **Niszowe:** 81% ⭐
- **Trust >= 50:** 100%
- **Base Seller Filter:** 100%

**NAJWIĘKSZE PRZEBICIA:**
1. Playmobil: 55.5% (Amazon.nl)
2. Harry Potter: 56.2% (Amazon.nl)
3. Adidas: 47.9% (niszowy - ODRZUCONY po Trust fix)
4. Bosch: 43.5% (Galaxus.nl)
5. Tunturi: 43.2% (Fitnessdelivery)

---

## 🔧 KONFIGURACJA

**Environment Variables:**
```bash
# Trust Engine
TRUST_THRESHOLD=50  # Minimum trust score

# Rotation Engine
USE_ROTATION_ENGINE=true
ROTATION_MODE=standard  # 40/30/20/10

# Filters
PRICE_RANGE_MIN=0.4  # 40% base price
PRICE_RANGE_MAX=1.5  # 150% base price
MAX_SAVINGS_PERCENT=50  # Max oszczędności (trusted: 70%)

# Smart Bundles
EXTRACT_BUNDLES_BEFORE_FILTERS=true  # KRYTYCZNE!
```

---

## 📁 LOKALIZACJE PLIKÓW

```
server/
├── market-api.js                    # Główny engine (filtry + flow)
├── scoring/
│   ├── dealScoreV2.js              # DealScore calculation
│   ├── trustEngine.js              # Trust Score (THRESHOLD = 50)
│   ├── rotationEngine.js           # Rotation (40/30/20/10)
│   ├── referencePrice.js           # Reference price (median)
│   └── queryGenerator.js           # Long-tail queries
├── lib/
│   ├── smartBundleExtractor.js     # Smart Bundles (PRZED filtrami!)
│   ├── categorySearchProfiles.js   # 13 kategorii
│   ├── antiPatternRotation.js      # Anti-pattern learning
│   └── mathematicalRotation.js     # Mathematical rotation
└── CANONICAL-DEALSCORE.md          # TEN DOKUMENT
```

---

## ✅ CHECKLIST PRZED DEPLOY

- [ ] Trust threshold = 50 ✅
- [ ] Smart Bundles przed filtrami ✅
- [ ] Base Seller Filter aktywny ✅
- [ ] Banned Sellers (35+) ✅
- [ ] Banned Keywords (150+) ✅
- [ ] Domain Blacklist (.fr, .de, .pl) ✅
- [ ] Etsy, OnBuy, Cdiscount zablokowane ✅
- [ ] Price Sanity Check (50%/70%) ✅
- [ ] Rotation Engine (40/30/20/10) ✅
- [ ] 13 kategorii w profilu ✅
- [ ] Onboarding (unsupported categories) ✅
- [ ] Żadnego fallback demo ✅

---

## 🎯 KANONICZNA PRAWDA

**TO JEST JEDYNA PRAWDA O DEALSCORE:**

1. **Trust >= 50** - tylko sprawdzone sklepy
2. **Smart Bundles PRZED filtrami** - akcesoria zapisane
3. **8 warstw filtrów** - eliminacja śmieci
4. **DealScore V2** - Price 40%, Trust 30%, Fit 20%, Fresh 10%
5. **Niche Boost +30%** - tylko dla Trust >= 50
6. **Rotation 40/30/20/10** - różnorodność
7. **13 kategorii** - production ready
8. **Żadnych fejków** - tylko prawdziwe dane
9. **Base Seller Filter** - nie pokazuj tego samego sklepu
10. **NL/BE only** - żadnych międzynarodowych marketplace

**KONIEC. TO JEST SYSTEM. TO JEST PRAWDA.**

---

**Ostatnia aktualizacja:** 27 marca 2026  
**Autor:** DealSense Team  
**Status:** PRODUCTION READY ✅
