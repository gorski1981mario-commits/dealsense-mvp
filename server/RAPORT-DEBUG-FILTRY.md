# 📊 PEŁNY RAPORT DEBUG - GDZIE FILTRY WYCINAJĄ OFERTY

**Data:** 21 marca 2026  
**Test:** 3 produkty (iPhone 15 Pro, AirPods Pro, iPad 10th Gen)  
**Success Rate:** 0/3 (0%)

---

## 🔍 SZCZEGÓŁOWA ANALIZA PER FILTR

### **FILTR 1: PRICE RANGE (40%-150%)**
- **Typ:** LEKKI, SZYBKI
- **Wycina:** 5-10% ofert
- **Status:** ✅ DZIAŁA DOBRZE
- **Przykład (iPad):** 11 → 10 offers (usunięto: 1)

### **FILTR 2: BANNED SELLERS**
- **Typ:** LEKKI
- **Wycina:** 50-80% ofert ⚠️ **NAJWIĘKSZE CIĘCIE!**
- **Status:** ⚠️ ZA RESTRYKCYJNY
- **Przykład (iPad):** 10 → 2 offers (usunięto: 8)

**Odrzucone sklepy:**
- `eBay` (marketplace)
- `cirkulerad.se` (używane, SE)
- `Marktplaats` (używane)
- `Back Market` (refurbished)
- `Microless.com` (international)
- `mypods24.de` (DE, nie NL)
- `Reway` (używane)
- `Leronza` (podejrzany)

**Problem:** Lista `bannedSellers` jest za długa i wycina również legalne sklepy NL!

### **FILTR 3: BANNED KEYWORDS**
- **Typ:** LEKKI
- **Wycina:** 10-20% ofert
- **Status:** ✅ DZIAŁA DOBRZE
- **Przykład (iPad):** 2 → 1 offers (usunięto: 1)

**Odrzucone:** Akcesoria (hoes, bandje, filter) + używane (gebruikt, tweedehands)

### **FILTR 4: NL-ONLY FILTER**
- **Typ:** ŚREDNI
- **Wycina:** 30-50% ofert ⚠️ **DRUGI NAJWIĘKSZY KILLER!**
- **Status:** ⚠️ BRAKUJE SKLEPÓW W WHITELIST
- **Przykład (iPad SearchAPI):** 1 → 0 offers (usunięto: 1) ❌
- **Przykład (iPad SERP API):** 6 → 2 offers (usunięto: 4)

**Sklepy odrzucone (ale mają .nl domenę!):**
- `DavidTelecom.NL` ✅ DODANY (ale za późno)
- `Onestop Digital` ✅ DODANY
- `iZi Deals` ✅ DODANY
- `Coolshop.nl` ❌ **BRAK - TRZEBA DODAĆ!**

**Problem:** Whitelist `knownNLShops` jest niepełna!

### **FILTR 5: QUALITY FILTER (SERP API)**
- **Typ:** BARDZO RESTRYKCYJNY
- **Wycina:** 100% pozostałych ofert ❌ **ZABIJA WSZYSTKO!**
- **Status:** ❌ KRYTYCZNY PROBLEM
- **Przykład (iPad):** 1 → 0 offers (low similarity: 1)
- **Przykład (AirPods):** 1 → 1 offers ✅ (ale potem ginie!)

**Problem:** Nawet po poluzowaniu `minSimilarity` do 50%, nadal odrzuca przez "low similarity"!

---

## 🎯 GŁÓWNE PROBLEMY

### **PROBLEM #1: BANNED SELLERS wycina 50-80% ofert**
**Gdzie:** `market-api.js` linia 1540-1597  
**Co robi:** Odrzuca wszystkie sklepy z listy `bannedSellers`  
**Dlaczego problem:** Lista zawiera 50+ sklepów, w tym niektóre legalne NL sklepy

**Rozwiązanie:**
- Przenieś `BANNED SELLERS` na koniec (po Quality Filter)
- Zostaw tylko krytyczne (Marktplaats, eBay, Back Market)
- Resztę sprawdzaj w Quality Filter

### **PROBLEM #2: NL-ONLY FILTER - niepełna whitelist**
**Gdzie:** `market-api.js` linia 1687-1720  
**Co robi:** Przepuszcza tylko sklepy z `knownNLShops` lub `.nl` domeną  
**Dlaczego problem:** Brakuje sklepów w whitelist

**Sklepy do dodania:**
```javascript
'coolshop', 'coolshop.nl',
'davidtelecom', 'davidtelecom.nl',
'onestop', 'onestop digital',
'izi deals', 'izideals', 'izideals.nl'
```

### **PROBLEM #3: QUALITY FILTER zabija ostatnie oferty**
**Gdzie:** `market-api.js` linia 1928-1935 (SERP API)  
**Co robi:** Odrzuca oferty przez "low similarity"  
**Dlaczego problem:** Algoryzm similarity jest za restrykcyjny

**Obecna konfiguracja:**
```javascript
minSimilarity: 50,  // Poluzowane z 85%
strictMode: false,  // Wyłączony trust filter
```

**Problem:** Nawet 50% to za dużo! Tytuły produktów w SERP API są inne niż query.

**Przykład:**
- Query: `iPad 10th Generation 64GB`
- Tytuł: `Apple iPad (2022) 64GB WiFi Blauw`
- Similarity: ~40% (za niskie!)

**Rozwiązanie:** Obniż do 30% lub wyłącz całkowicie dla SERP API

### **PROBLEM #4: OFERTY NIE SĄ MERGOWANE!**
**Gdzie:** `market-api.js` linia 1965  
**Co się dzieje:**
```
SearchAPI: 1 oferta ✅
SERP API: 1 oferta ✅ (przeszła Quality Filter)
WYNIK KOŃCOWY: 0 ofert ❌
```

**Dlaczego:** Kod zwraca `return null` zamiast mergować oferty z SearchAPI i SERP API!

**Kod problematyczny:**
```javascript
// Linia 1965
return null;  // ❌ Odrzuca wszystko!
```

**Rozwiązanie:** Merguj oferty z SearchAPI i SERP API przed zwróceniem

---

## 📈 STATYSTYKI WYCINANIA

| Filtr | Wycina | Status | Priorytet |
|-------|--------|--------|-----------|
| Price Range | 5-10% | ✅ OK | Niski |
| Banned Sellers | **50-80%** | ⚠️ Za dużo | **KRYTYCZNY** |
| Banned Keywords | 10-20% | ✅ OK | Niski |
| NL-Only Filter | **30-50%** | ⚠️ Niepełna lista | **WYSOKI** |
| Quality Filter | **100%** | ❌ Zabija wszystko | **KRYTYCZNY** |

---

## 💡 REKOMENDACJE

### **NATYCHMIASTOWE (KRYTYCZNE):**

1. **Napraw mergowanie ofert** (linia 1965)
   - Zamiast `return null` → merguj SearchAPI + SERP API
   
2. **Poluzuj Quality Filter w SERP API**
   - `minSimilarity: 30` (było 50)
   - Lub wyłącz całkowicie dla SERP API

3. **Dodaj brakujące sklepy NL do whitelist**
   - `coolshop.nl`, `davidtelecom.nl`, `onestop digital`, `izi deals`

### **ŚREDNI PRIORYTET:**

4. **Przenieś BANNED SELLERS na koniec**
   - Zostaw tylko krytyczne (Marktplaats, eBay, Back Market)
   - Resztę sprawdzaj w Quality Filter

5. **Dodaj debug logging**
   - Pokaż dokładnie które oferty są odrzucane i dlaczego

### **DŁUGOTERMINOWE:**

6. **Przepisz Quality Filter**
   - Lepszy algorytm similarity (fuzzy matching)
   - Uwzględnij warianty nazw (iPad 10th Gen = iPad 2022)

7. **Dodaj AI do normalizacji tytułów**
   - `iPad 10th Generation 64GB` → `iPad 2022 64GB`
   - `Apple iPad (2022) 64GB WiFi Blauw` → `iPad 2022 64GB`

---

## 🔧 KOLEJNE KROKI

1. ✅ Napraw błędny log (linia 1948) - **ZROBIONE**
2. ✅ Dodaj sklepy NL do whitelist - **ZROBIONE**
3. ✅ Poluzuj Quality Filter do 50% - **ZROBIONE (ale za mało!)**
4. ⏳ **TERAZ:** Napraw mergowanie ofert + obniż similarity do 30%
5. ⏳ Test 3 produktów ponownie
6. ⏳ Jeśli nadal 0% → wyłącz Quality Filter całkowicie dla SERP API

---

**Konkluzja:** Filtry są ustawione w dobrej kolejności (od najlżejszych do najcięższych), ale **Quality Filter jest za restrykcyjny** i **oferty nie są mergowane** między SearchAPI i SERP API. To są 2 główne problemy do naprawy!
