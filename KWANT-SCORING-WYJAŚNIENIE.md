# 🎯 KWANT SCORING - WYJAŚNIENIE I OPTYMALIZACJA

**Data:** 2026-03-15  
**Pytanie:** Jak działa scoring i jak go zoptymalizować?

---

## 📊 **JAK DZIAŁA SCORING (0.6 × reviewRatio + 0.4 × ratingScore)?**

### **To jest TYLKO do PRIORYTETYZACJI TOP 3, NIE do filtrowania!**

**KROK 1: FILTROWANIE (wejście do KWANT):**
```javascript
✅ Rating ≥4.0 (WSZYSCY muszą mieć min 4.0★)
✅ Recenzje ≥30 (WSZYSCY muszą mieć min 30 recenzji)
✅ Cena ≤ queryPrice (WSZYSCY muszą być tańsi od bazowej)
✅ Cena ≥35% średniej (BEZ scam €15.95 dla Nintendo)

❌ Sklep 3.9★ → ODRZUCONY (za niski rating)
❌ Sklep 25 recenzji → ODRZUCONY (za mało recenzji)
❌ Sklep €1250 (baza €1199) → ODRZUCONY (droższy od bazy)
```

**KROK 2: SCORING (kolejność TOP 3):**
```javascript
// WSZYSCY którzy przeszli filtr mają ≥4.0★ i ≥30 recenzji
// Teraz sortujemy ich po JAKOŚCI:

finalScore = 0.6 × reviewRatio + 0.4 × ratingScore

reviewRatio = positive_reviews / total_reviews
  ↳ Ile % recenzji jest pozytywnych
  ↳ 4.5★ ≈ 90% pozytywnych
  ↳ 4.0★ ≈ 80% pozytywnych

ratingScore = rating / 5.0
  ↳ Normalizacja ratingu do 0-1
  ↳ 4.5★ → 0.90
  ↳ 4.0★ → 0.80
```

**PRZYKŁAD (WSZYSCY ≥4.0★, ≥30 recenzji):**

**Sklep A:** 4.5★, 35 recenzji
- reviewRatio = 0.90 (90% pozytywnych)
- ratingScore = 0.90 (4.5/5)
- finalScore = 0.6×0.90 + 0.4×0.90 = **0.90**

**Sklep B:** 4.0★, 30 recenzji
- reviewRatio = 0.80 (80% pozytywnych)
- ratingScore = 0.80 (4.0/5)
- finalScore = 0.6×0.80 + 0.4×0.80 = **0.80**

**Sklep C:** 4.3★, 50 recenzji
- reviewRatio = 0.86
- ratingScore = 0.86
- finalScore = **0.86**

**TOP 3 (po cenie i score):**
1. **Najtańszy** (ZAWSZE pierwszy, niezależnie od score)
2. **Sklep A** (score 0.90 - najwyższy)
3. **Sklep C** (score 0.86 - drugi najwyższy)

---

## ⚠️ **PROBLEM: ZA WYSOKIE WYMAGANIA**

### **OBECNE (za restrykcyjne):**
```
MIN_REVIEWS: 50 (w przykładach było 100/50)
  ↳ Odrzuca dobre małe sklepy z 30-40 recenzjami
  ↳ MAŁO ofert z rynku
```

### **OPTYMALNE (więcej ofert):**
```
MIN_REVIEWS: 30
  ↳ Wystarczająco do wiarygodności
  ↳ WIĘCEJ ofert z rynku
  ↳ Spójne z SCAM_MIN_REVIEWS
```

---

## 🆕 **BRAKUJĄCA FUNKCJA: WIEK DOMENY**

### **Wymaganie:**
```
Domain Age ≥12 miesięcy (≥1 rok na rynku)
  ↳ Odrzuca nowe/podejrzane sklepy
  ↳ Chroni przed scam
```

### **Problem:**
```
❌ SearchAPI NIE ZWRACA wieku domeny
❌ KWANT NIE MA tej informacji
❌ Trzeba dodać external API (WHOIS lookup)
```

### **Rozwiązanie:**
```
OPCJA 1: Dodać WHOIS API lookup (kosztowne, wolne)
OPCJA 2: Whitelist znanych sklepów (bol.com, coolblue.nl, mediamarkt.nl)
OPCJA 3: Heurystyka: sklepy z >100 recenzji = prawdopodobnie >1 rok
```

---

## ✅ **OPTYMALNE PARAMETRY (WIĘCEJ OFERT Z RYNKU):**

### **FILTROWANIE (minimum requirements):**
```
PRICING_SCAM_MIN_RATING = 4.0
  ↳ Minimum 4.0★ (nie 3.5, nie 4.6)

PRICING_SCAM_MIN_REVIEWS = 30
  ↳ Minimum 30 recenzji (nie 50, nie 100)
  ↳ WIĘCEJ sklepów przejdzie filtr

PRICING_V2_MIN_RATING = 4.0
  ↳ Spójne z SCAM

PRICING_V2_MIN_REVIEWS = 30
  ↳ Spójne z SCAM
  ↳ BYŁO 50 → ZMIANA na 30

PRICING_V2_MAX_RATING = 4.8
  ↳ Pozwala na bardzo dobre sklepy 4.5-4.8
```

### **SCORING (priorytetyzacja TOP 3):**
```
finalScore = 0.6 × reviewRatio + 0.4 × ratingScore
  ↳ 60% waga na pozytywne recenzje
  ↳ 40% waga na rating
  ↳ OPTYMALNE (zostaje bez zmian)
```

### **SELEKCJA TOP 3:**
```
1️⃣ NAJTAŃSZA oferta (PRIORYTET)
2️⃣ NAJWYŻSZY finalScore
3️⃣ DRUGI najwyższy finalScore
```

---

## 📊 **PRZYKŁAD Z OPTYMALNYMI PARAMETRAMI:**

**Produkt:** iPhone 15 Pro, cena bazowa €1199

**Oferty po filtracji (≥4.0★, ≥30 recenzji, ≤€1199):**

| Sklep | Cena | Rating | Recenzje | finalScore |
|-------|------|--------|----------|------------|
| Bol.com | €1120 | 4.3★ | 45 | 0.86 |
| Coolblue | €1180 | 4.6★ | 35 | 0.92 |
| MediaMarkt | €1150 | 4.5★ | 40 | 0.90 |
| Amazon | €1190 | 4.4★ | 50 | 0.88 |
| BCC | €1170 | 4.2★ | 30 | 0.84 |

**TOP 3 (w kolejności):**
1. **Bol.com** €1120 (najtańsza) ← PRIORYTET
2. **Coolblue** €1180 (score 0.92 - najwyższy)
3. **MediaMarkt** €1150 (score 0.90 - drugi)

**Oszczędności:** €79 (6.6%)  
**Deal Score:** 6/10

---

## 🎯 **PODSUMOWANIE:**

### **SCORING to NIE filtrowanie:**
- ✅ Filtrowanie: ≥4.0★, ≥30 recenzji (WSZYSCY)
- ✅ Scoring: Kolejność TOP 3 (najlepsi z najlepszych)

### **Optymalizacja (WIĘCEJ ofert):**
- ✅ MIN_REVIEWS: 50 → **30** (więcej sklepów)
- ✅ MIN_RATING: 3.5 → **4.0** (średnia)
- ✅ MAX_RATING: 4.2 → **4.8** (pozwala na bardzo dobre)

### **Wiek domeny:**
- ❌ Obecnie NIE obsługiwane (SearchAPI nie zwraca)
- ⏳ Możliwe rozwiązania: WHOIS API, whitelist, heurystyka

---

## ❓ **PYTANIE DO CIEBIE:**

**1. Czy rozumiesz scoring?**
- Filtrowanie: ≥4.0★, ≥30 recenzji (minimum)
- Scoring: Kolejność TOP 3 (priorytet)

**2. Wiek domeny - która opcja?**
- A) Dodać WHOIS API (kosztowne, wolne)
- B) Whitelist znanych sklepów (bol.com, coolblue.nl, etc.)
- C) Heurystyka: >100 recenzji = prawdopodobnie >1 rok
- D) Pominąć (30 recenzji + 4.0★ wystarczy)

**3. Czy mam zaktualizować parametry na 30 recenzji?**

**Odpowiedz co mam zrobić.** 🎯
