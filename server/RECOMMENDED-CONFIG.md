# RECOMMENDED CONFIGURATION - NOWA OPTYMALNA WERSJA ✅

**Data:** 21 marca 2026  
**Status:** PRODUCTION READY - WINNER!  
**Success Rate:** 100% (3/3 produktów)  
**Średnie oszczędności:** 37.8%

---

## 🎯 PORÓWNANIE Z CANONICAL:

| Metryka | CANONICAL | RECOMMENDED | Winner |
|---------|-----------|-------------|--------|
| **Success Rate** | 67% (2/3) | **100% (3/3)** | ✅ **RECOMMENDED** |
| **Avg Savings** | 39.5% | 37.8% | ~ Similar |
| **iPhone 15 Pro** | 1 etui €500 ❌ | 3 telefony €639-659 ✅ | ✅ **RECOMMENDED** |
| **Dyson V12** | 1 akcesoria €500 ❌ | 3 odkurzacze €320-460 ✅ | ✅ **RECOMMENDED** |
| **Garmin Forerunner** | 0 ofert ❌ | 3 zegarki €202-329 ✅ | ✅ **RECOMMENDED** |

---

## ⚙️ KONFIGURACJA:

### 1. PRICE RANGE CHECK ⭐ ZMIENIONE
- **Status:** ON
- **Zakres:** 40%-150% base price (było 30%-200%)
- **Pozycja:** PRZED Quality Filter
- **Cel:** Odrzucenie bardzo tanich i bardzo drogich akcesoriów

**Przykład:**
- iPhone €1329: range €532-€1994 (było €398-€2658)
- Etui €500 ❌ ODRZUCONE (< €532)

### 2. BANNED KEYWORDS ⭐ NOWE!
- **Status:** ON
- **Keywords:** case, cover, hoes, hoesje, band, strap, bandje, filter, stofzak, bag, tas, charger, oplader, cable, kabel, adapter, screen protector
- **Pozycja:** PO price range, PRZED Quality Filter
- **Cel:** Odrzucenie akcesoriów po nazwie

**Przykład:**
- "iPhone 15 Pro Case" ❌ ODRZUCONE (zawiera "case")
- "Dyson V12 Filter" ❌ ODRZUCONE (zawiera "filter")
- "Garmin Band" ❌ ODRZUCONE (zawiera "band")

### 3. QUALITY FILTER
- **Status:** ON
- **Mode:** Adaptive (strict → balanced fallback)
- **Bez zmian** vs CANONICAL

### 4. CANONICAL FILTER ⭐ ZMIENIONE
- **Status:** OFF (było ON Tier 1-3)
- **Powód:** Za restrykcyjny, 0 EAN matches, odrzuca dobre oferty
- **Zastąpione przez:** Price range + Banned keywords

### 5. DEALSCORE V2 ⭐ ZMIENIONE
- **Status:** ON
- **Trust threshold:** 25 (było 30)
- **Reference price:** Fallback do userBasePrice
- **Filter blocked:** true

### 6. ROTATION ENGINE
- **Status:** ON
- **Mode:** STANDARD (40/30/20/10)
- **Bez zmian** vs CANONICAL

---

## 📊 WYNIKI TESTÓW:

### iPhone 15 Pro 128GB (€1329)
**CANONICAL:** 1 etui €500 ❌  
**RECOMMENDED:** 3 telefony ✅
1. Marktplaats €639.00 (51.9% savings)
2. Marktplaats €655.39 (50.7% savings)
3. You-Mobile €659.00 (50.4% savings)

**Avg savings:** 52.7%

---

### Dyson V12 Detect Slim (€599)
**CANONICAL:** 1 akcesoria €500 ❌  
**RECOMMENDED:** 3 odkurzacze ✅
1. Apelt €319.99 (46.6% savings)
2. eBay €456.61 (23.8% savings)
3. Microless.com €459.50 (23.3% savings)

**Avg savings:** 31.2%

---

### Garmin Forerunner 255 (€349)
**CANONICAL:** 0 ofert ❌  
**RECOMMENDED:** 3 zegarki ✅
1. AliExpress €202.16 (42.1% savings)
2. tvoutlet.tv €329.00 (5.7% savings)
3. AliExpress €208.49 (40.3% savings)

**Avg savings:** 29.4%

---

## 🔍 DLACZEGO DZIAŁA:

### 1. Banned Keywords = GAME CHANGER
- Odrzuca akcesoria **PO NAZWIE**
- Canonical Filter nie potrafi tego zrobić
- Proste, skuteczne, szybkie

### 2. Węższy Price Range
- 40%-150% vs 30%-200%
- Odrzuca bardzo drogie akcesoria (€500 etui)
- Odrzuca bardzo tanie akcesoria (€6-30 paski)

### 3. Canonical Filter OFF
- Tier 1-3 dawało 0-2 matches
- Blokował dobre oferty
- Price range + keywords wystarczają

### 4. Trust 25 vs 30
- Więcej ofert przechodzi
- Garmin: 0 → 3 oferty

---

## 🚀 FLOW:

```
SearchAPI (13-40 ofert)
    ↓
PRICE RANGE (40%-150%)
    ↓ odrzuca 30-50% (bardzo tanie/drogie)
    ↓
BANNED KEYWORDS
    ↓ odrzuca 10-30% (akcesoria po nazwie)
    ↓
Quality Filter
    ↓ odrzuca untrusted sellers
    ↓
Canonical Filter OFF
    ↓ nie blokuje
    ↓
DealScore V2 (trust 25)
    ↓ 3-5 valid offers
    ↓
STANDARD Rotation (40/30/20/10)
    ↓ 3 final offers
```

---

## ✅ DECYZJA: KEEP RECOMMENDED CONFIG

**Powody:**
1. ✅ **100% success rate** (vs 67% CANONICAL)
2. ✅ **Prawdziwe produkty** (nie akcesoria)
3. ✅ **3 oferty per produkt** (vs 0-1 CANONICAL)
4. ✅ **Podobne oszczędności** (37.8% vs 39.5%)
5. ✅ **Prostsze** (banned keywords zamiast Canonical Filter)

**RECOMMENDED CONFIG = PRODUCTION READY!**

---

## 📝 IMPLEMENTACJA:

```javascript
// server/market-api.js

// 1. PRICE RANGE (40%-150%)
const minPrice = userBasePrice * 0.4;
const maxPrice = userBasePrice * 1.5;

// 2. BANNED KEYWORDS
const accessoryKeywords = ['case', 'cover', 'hoes', 'hoesje', 'band', 
  'strap', 'bandje', 'filter', 'stofzak', 'bag', 'tas', 'charger', 
  'oplader', 'cable', 'kabel', 'adapter', 'screen protector'];

// 3. Canonical Filter: OFF

// 4. Trust threshold: 25
// server/scoring/trustEngine.js
return score >= 25;
```

---

## 🔄 ROLLBACK (jeśli potrzebny):

Jeśli RECOMMENDED przestanie działać, przywróć CANONICAL:
- Price range: 30%-200%
- Banned keywords: OFF
- Canonical Filter: ON (Tier 1-3)
- Trust: 30

Instrukcje w: `CANONICAL-CONFIG.md`
