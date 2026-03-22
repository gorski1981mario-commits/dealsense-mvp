# CANONICAL CONFIGURATION - BASELINE

**Data:** 21 marca 2026  
**Status:** Optymalna Kanoniczna Wersja (do rollback)  
**Success Rate:** 67% (2/3 produktów)  
**Średnie oszczędności:** 39.5%

---

## KONFIGURACJA:

### 1. PRICE RANGE CHECK
- **Status:** ON
- **Zakres:** 30%-200% base price
- **Pozycja:** PRZED Quality Filter
- **Cel:** Odrzucenie tanich akcesoriów

### 2. QUALITY FILTER
- **Status:** ON
- **Mode:** Adaptive (strict → balanced fallback)
- **Min similarity:** Category-specific
- **Trust minimum:** Category-specific

### 3. CANONICAL FILTER
- **Status:** ON
- **Tiers:** 1-3 (EAN + Exact + Fuzzy)
- **Tier 1:** EAN match (100%)
- **Tier 2:** Exact match (95%)
- **Tier 3:** Fuzzy match (85%)

### 4. DEALSCORE V2
- **Status:** ON
- **Trust threshold:** 30 (poluzowany z 50)
- **Reference price:** Fallback do userBasePrice
- **Filter blocked:** true

### 5. ROTATION ENGINE
- **Status:** ON
- **Mode:** STANDARD (40/30/20/10)
- **Mathematical:** OFF (wymaga metadata)
- **Anti-pattern:** OFF (wymaga userId)

### 6. DEAL TRUTH
- **Status:** OFF (tymczasowo)

---

## WYNIKI TESTÓW:

### iPhone 15 Pro 128GB (€1329)
- **Oferty:** 1
- **Top offer:** Marktplaats €500
- **Oszczędności:** 62.4%
- **Problem:** ETUI nie telefon

### Dyson V12 Detect Slim (€599)
- **Oferty:** 1
- **Top offer:** Marktplaats €500
- **Oszczędności:** 16.5%
- **Problem:** AKCESORIA nie odkurzacz

### Garmin Forerunner 255 (€349)
- **Oferty:** 0
- **Problem:** DealScore zablokował (trust < 30)

---

## PROBLEMY:

1. **Canonical Filter nie odróżnia akcesoriów**
   - Etui iPhone ma brand "Apple" + model "iPhone 15 Pro" → Fuzzy match ✅
   - Ale to nie jest telefon!

2. **Brak EAN matching**
   - Tier 1 (EAN): 0 matches dla wszystkich produktów
   - Oferty z SearchAPI nie mają EAN

3. **Fuzzy matching za słaby**
   - Tier 3: 0 matches dla większości produktów
   - Algorytm matching nie rozpoznaje wariantów

4. **Drogie akcesoria przechodzą**
   - Price range 30%-200% = €398-€2658 dla iPhone
   - Etui za €500 przechodzi ✅

---

## FLOW:

```
SearchAPI (13-40 ofert)
    ↓
PRICE RANGE CHECK (30%-200%) → odrzuca 50-60% tanich akcesoriów
    ↓
Quality Filter (strict/balanced) → odrzuca untrusted sellers
    ↓
Canonical Filter (Tier 1-3) → 0-2 oferty (bardzo restrykcyjny)
    ↓
DealScore V2 (trust 30) → 0-1 valid
    ↓
STANDARD Rotation (40/30/20/10) → 0-1 final
```

---

## ROLLBACK INSTRUCTIONS:

Jeśli RECOMMENDED config nie działa lepiej, przywróć tę konfigurację:

```javascript
// market-api.js linie 1519-1575

// 1. PRICE RANGE CHECK (przed Quality Filter)
if (userBasePrice && userBasePrice > 0) {
  const minPrice = userBasePrice * 0.3;
  const maxPrice = userBasePrice * 2.0;
  offers = offers.filter(o => o.price >= minPrice && o.price <= maxPrice);
}

// 2. Quality Filter: ON (adaptive)
// 3. Canonical Filter: ON (Tier 1-3)
// 4. DealScore V2: ON (trust 30)
// 5. STANDARD Rotation: ON
```

---

## NEXT STEPS:

Test RECOMMENDED config:
- Węższy price range (40%-150%)
- Category-specific banned keywords
- Wyłączenie Canonical Filter (za restrykcyjny)
- Poluzowanie DealScore trust (30 → 25)

Jeśli RECOMMENDED lepsze → keep  
Jeśli RECOMMENDED gorsze → rollback do CANONICAL
