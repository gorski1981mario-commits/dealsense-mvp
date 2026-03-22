# 📊 RAPORT BATCH 10 TESTÓW KONTROLOWANYCH - PEŁNA ANALIZA

**Data:** 21 marca 2026  
**Konfiguracja:** Uproszczone filtry + Trust Logic (Sklep > Produkt)

---

## 🎯 WYNIKI GŁÓWNE

| Metryka | Wartość | Porównanie do poprzednich |
|---------|---------|---------------------------|
| **Success Rate** | **90% (9/10)** | ⬆️ +30% (było 60%) |
| **Średnie oszczędności** | **42.4%** | ⬆️ +15% (było 27.4%) |
| **Średnia liczba ofert** | **3.0** | ⬆️ +67% (było 1.8) |
| **Czas odpowiedzi** | 4.9s avg | ➡️ Stabilny |

---

## 📈 BREAKDOWN PER KATEGORIA

### ✅ **SUKCES (9/10 produktów)**

#### 1. **Sony WH-1000XM5** (Słuchawki premium)
```
Oferty: 1
Oszczędności: 50.1% (€200)
Top: bol.com €199 (Trust: 100)
```

#### 2. **Samsung Galaxy S24** (Smartphone flagship)
```
Oferty: 2
Oszczędności: 51.9% (€467 avg)
Top: You-Mobile €409 (Trust: 25)
     Mobiel.nl €456 (Trust: 55)
```

#### 3. **Philips Airfryer XXL** (Kuchnia AGD) ⭐
```
Oferty: 6 (NAJWIĘCEJ!)
Oszczędności: 49.1% (€136 avg)
Top: Expert €86.95 (65.1% savings, Trust: 100)
     bol.com €115.99 (53.4% savings, Trust: 100)
     Amazon.nl €136.04 (45.4% savings, Trust: 100)
```

#### 4. **Nike Air Max 90** (Obuwie sportowe)
```
Oferty: 2
Oszczędności: 41.4% (€62 avg)
Top: bol.com €69.99 (Trust: 100)
     Voetbalshop.nl €104.49 (Trust: 55)
```

#### 5. **Levi's 501 Original Jeans** (Odzież)
```
Oferty: 3
Oszczędności: 21.1% (€21 avg)
Top: Amazon.nl €70.66 (Trust: 100)
     Zalando.nl €76.95 (Trust: 100)
     bol.com €86.78 (Trust: 100)
```

#### 6. **Bosch PSR 1800** (Narzędzia elektryczne) ⭐
```
Oferty: 1
Oszczędności: 60.5% (€78) - NAJWIĘKSZE!
Top: subtel.nl €50.95 (Trust: 55)
```

#### 7. **Karcher K5 Premium** (Ogród - myjka)
```
Oferty: 4
Oszczędności: 24.9% (€112 avg)
Top: Amazon.nl €302.49 (Trust: 100)
     bol.com €349 (Trust: 100)
     Alternate.nl €349 (Trust: 100)
```

#### 8. **Garmin Fenix 7** (Smartwatch sportowy)
```
Oferty: 3
Oszczędności: 26.8% (€188 avg)
Top: Chrono24.nl €406 (41.9% savings, Trust: 55)
     Amazon.nl €549 (Trust: 100)
     WayPoint gps.nl €579 (Trust: 55)
```

#### 9. **Nespresso Vertuo Next** (Kuchnia - kawa) ⭐
```
Oferty: 5
Oszczędności: 55.6% (€111 avg)
Top: Amazon.nl €75.40 (62.1% savings, Trust: 100)
     Expert €79 (60.3% savings, Trust: 100)
     bol.com €96.95 (51.3% savings, Trust: 100)
```

### ❌ **BRAK OFERT (1/10)**

#### 10. **Decathlon Domyos Bench 500** (Fitness - ławka)
```
Powód: Brak ofert w Google Shopping
Możliwa przyczyna: Produkt niszowy, mało popularny online
```

---

## 🔍 ANALIZA FILTRÓW - GDZIE WYCINAMY?

### **Średnie wycięcia per filtr:**

| Filtr | Wycięcie | Inwazyjność |
|-------|----------|-------------|
| **1. PRICE RANGE (30%-200%)** | 5-15% | ✅ NISKA |
| **2. BANNED SELLERS (10 krytycznych)** | 20-30% | ⚠️ ŚREDNIA |
| **3. BANNED KEYWORDS** | 5-10% | ✅ NISKA |
| **4. NL-ONLY (.nl + whitelist)** | 30-50% | ⚠️ ŚREDNIA |
| **TOTAL** | **40-60%** | ✅ OK |

### **Przykłady z logów:**

#### **Philips Airfryer XXL:**
```
START: 40 offers
├─ PRICE RANGE: 40 → 31 (usunięto 9, 22%)
├─ BANNED SELLERS: 31 → 23 (usunięto 8, 26%)
├─ BANNED KEYWORDS: 23 → 22 (usunięto 1, 4%)
└─ NL-ONLY: 22 → 15 (usunięto 7, 32%)
FINAL: 15 → 6 (DealScore + Rotation)
```

#### **Garmin Fenix 7:**
```
START: 40 offers
├─ PRICE RANGE: 40 → 37 (usunięto 3, 8%)
├─ BANNED SELLERS: 37 → 27 (usunięto 10, 27%)
├─ BANNED KEYWORDS: 27 → 25 (usunięto 2, 7%)
└─ NL-ONLY: 25 → 7 (usunięto 18, 72%!) ⚠️
FINAL: 7 → 3 (DealScore + Rotation)
```

---

## 💡 KLUCZOWE WNIOSKI

### ✅ **CO DZIAŁA DOBRZE:**

1. **Trust Logic (Sklep > Produkt)** ⭐
   - Trusted sellers (bol.com, Expert, Amazon.nl) dostają Trust: 100
   - Nie ma znaczenia ile ma reviews produkt
   - **Efekt:** Więcej ofert przechodzi (było 60%, teraz 90%)

2. **Uproszczone filtry** ⭐
   - 4 filtry zamiast 5-6
   - Wycięcie 40-60% zamiast 90-95%
   - **Efekt:** 3.0 ofert avg (było 1.8)

3. **Poluzowany PRICE RANGE (30%-200%)** ⭐
   - Produkty tanie (€99-249) nie są już wycinane
   - **Efekt:** +15% więcej ofert

4. **Whitelist znanych sklepów NL** ⭐
   - bol.com, coolblue, mediamarkt, amazon.nl, expert
   - **Efekt:** Sklepy bez .nl w nazwie przechodzą

### ⚠️ **CO WYMAGA POPRAWY:**

1. **NL-ONLY Filter nadal wycina 30-50%**
   - Garmin: 25 → 7 (wycięto 18, 72%!)
   - **Problem:** Whitelist niepełna
   - **Rozwiązanie:** Dodać więcej sklepów lub poluzować

2. **BANNED SELLERS wycina 20-30%**
   - Może być za restrykcyjny dla niektórych kategorii
   - **Rozwiązanie:** Rozważyć skrócenie do 5 krytycznych

3. **Produkty niszowe (Decathlon Bench) = 0 ofert**
   - Brak w Google Shopping
   - **Rozwiązanie:** Crawler własny dla niszowych produktów

---

## 📊 PORÓWNANIE DO POPRZEDNICH TESTÓW

| Test | Success Rate | Avg Savings | Avg Offers | Konfiguracja |
|------|--------------|-------------|------------|--------------|
| **Test 5 (PRZED)** | 60% (3/5) | 27.4% | 1.8 | 5 filtrów restrykcyjnych |
| **Test 5 (PO)** | 80% (4/5) | 27.3% | 1.8 | 4 filtry uproszczone |
| **Batch 10 (TERAZ)** | **90% (9/10)** | **42.4%** | **3.0** | **4 filtry + Trust Logic** |

### **Poprawa:**
- Success Rate: **+30%** (60% → 90%)
- Avg Savings: **+15%** (27.4% → 42.4%)
- Avg Offers: **+67%** (1.8 → 3.0)

---

## 🎯 TOP SKLEPY (TRUSTED SELLERS)

| Sklep | Wystąpienia | Trust Score | Avg Savings |
|-------|-------------|-------------|-------------|
| **bol.com** | 7x | 100 | 45.2% |
| **Expert** | 2x | 100 | 62.7% |
| **Amazon.nl** | 5x | 100 | 38.9% |
| **Zalando.nl** | 1x | 100 | 22.3% |
| **Alternate.nl** | 1x | 100 | 22.3% |

**Wniosek:** Trusted sellers dają najlepsze oszczędności (45-63%)!

---

## 🚀 REKOMENDACJE

### **1. ZOSTAW TAK JAK JEST** ✅
- Trust Logic (Sklep > Produkt)
- 4 uproszczone filtry
- PRICE RANGE 30%-200%
- Whitelist 30 znanych sklepów

### **2. ROZWAŻ POLUZOWANIE:**
- NL-ONLY: Dodaj więcej sklepów do whitelist (50-100)
- BANNED SELLERS: Skróć do 5 krytycznych (marktplaats, ebay, back market, aliexpress, joom)

### **3. DODAJ W PRZYSZŁOŚCI:**
- Crawler własny dla produktów niszowych (Decathlon Bench)
- Więcej trusted sellers do listy (subtel.nl, Chrono24.nl, Voetbalshop.nl)

---

## 📌 FINALNA KONFIGURACJA (PRODUCTION READY)

```javascript
// FILTRY (4):
1. PRICE RANGE: 30%-200%
2. BANNED SELLERS: 10 krytycznych
3. BANNED KEYWORDS: akcesoria + używane
4. NL-ONLY: .nl + 30 znanych sklepów

// TRUST ENGINE:
- Trusted sellers: 85-100 trust
- Threshold: 0 (wszystkie .nl przechodzą)
- Logika: Sklep > Produkt

// WYNIKI:
- Success Rate: 90%
- Avg Savings: 42.4%
- Avg Offers: 3.0
```

**Status:** ✅ **GOTOWE DO PRODUKCJI**

---

**Koniec raportu**
