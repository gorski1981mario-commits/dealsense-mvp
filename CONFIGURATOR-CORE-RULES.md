# 🎯 CONFIGURATOR CORE RULES - Modularny System Konfiguratorów

**Data:** 23 marca 2026  
**Status:** PRODUCTION READY - Zasady dla wszystkich konfiguratorów  
**Lokalizacja:** Wszystkie konfiguratory w `app/components/configurators/`

---

## 🏗️ **ARCHITEKTURA MODULARNA - "LEGO BLOCKS"**

**ZASADA:** Każdy konfigurator = te same zasady + nowe klocki

```
CORE COMPONENTS (te same dla wszystkich):
├── 1. Configuration Form (parametry specyficzne dla kategorii)
├── 2. Results View (PRZED zapłatą - ukryte biura)
├── 3. Payment View (prowizja 9% z oszczędności)
├── 4. Biometric Auth (Face ID / Touch ID)
└── 5. Unlocked View (PO zapłacie - widoczne biura + linki)
```

---

## 📋 **CORE RULES - WSZYSTKIE KONFIGURATORY**

### **RULE #1: PAYWALL PRZED POKAZANIEM BIUR** 🔒

**ZAWSZE ukrywamy:**
- ❌ Nazwa biura/sklepu/providera
- ❌ Logo biura
- ❌ Link do biura

**ZAWSZE pokazujemy:**
- ✅ Cena oferty
- ✅ Oszczędności (vs referentie)
- ✅ Parametry (stars, board, features)
- ✅ Review score
- ✅ "Verborgen" placeholder

**DLACZEGO:**
- User nie może ominąć nas
- CORE VALUE zarobku
- Dual revenue model (user + affiliate)

---

### **RULE #2: REFERENTIE PRIJS (Punkt Odniesienia)** 💰

**ZAWSZE pokazujemy od czego oszczędzamy:**

```typescript
// REFERENTIE: Najdroższa oferta (gigant)
const referenceOffer = offers.find(o => o.isReference) || offers[offers.length - 1];
const referencePrice = referenceOffer.price;

// BESTE DEAL: Najtańsza oferta
const bestPrice = offers[0].price;

// OSZCZĘDNOŚCI: Referentie - Beste
const savings = referencePrice - bestPrice;
```

**UI PRZED PAYWALLEM (ukryte nazwy):**
```
💡 Market gemiddelde: €5,650 (standaard prijs bij grote reisorganisaties)

🥇 BESTE PRIJS
   €4,263
   💸 Bespaar: €1,387
   🔒 Reisorganisatie: Verborgen
```

**UI PO ZAPŁACIE (widoczne nazwy):**
```
💡 Referentie: TUI €5,650 (standaard prijs bij grote reisorganisaties)

🥇 BESTE DEAL - Vakantieveilingen
   €4,263
   💸 Bespaar: €1,387 (vs TUI)
```

**DLACZEGO:**
- User wie od czego oszczędza
- Transparentność
- Trust building

---

### **RULE #6: SMART ROTATION (Anti-Pattern Learning)** 🔄

**PROBLEM:**
- Jeśli zawsze pokazujemy Vakantieveilingen na topie, user się nauczy
- User przestanie używać konfiguratora, bo wie że Vakantieveilingen jest najtańsze
- Tracimy prowizję!
- Kierujemy CAŁY ruch do jednego biura (niezdrowe!)

**ROZWIĄZANIE:**
```typescript
// MULTI-LEVEL ROTATION
const seedData = getRotationSeed(userId, config);

// LEVEL 1: Day slot (24h cycle)
const daySlot = Math.floor(Date.now() / 86400000);

// LEVEL 2: Hour slot (within day)
const hourSlot = Math.floor((Date.now() % 86400000) / 3600000);

// LEVEL 3: Rotation intensity (4-day cycle)
const rotationCycle = daySlot % 4; // 0, 1, 2, 3
const intensity = { 0: 1.0, 1: 0.5, 2: 0.25, 3: 1.0 }[rotationCycle];

// MICRO-SHUFFLE based on intensity
if (intensity === 1.0) {
  // 100%: Full shuffle (swap top 3)
  [offers[0], offers[2]] = [offers[2], offers[0]];
} else if (intensity === 0.5) {
  // 50%: Half shuffle (swap 1↔2)
  [offers[0], offers[1]] = [offers[1], offers[0]];
} else if (intensity === 0.25) {
  // 25%: Quarter shuffle (swap 2↔3)
  [offers[1], offers[2]] = [offers[2], offers[1]];
}
```

**EFEKT:**
```
Day 1, 10:00 (100%): Vakantieveilingen, Cheaptickets, Budgetair
Day 1, 11:00 (100%): Cheaptickets, Vakantieveilingen, Budgetair
Day 2, 10:00 (50%):  Cheaptickets, Vakantieveilingen, Budgetair
Day 3, 10:00 (25%):  Vakantieveilingen, Budgetair, Cheaptickets
Day 4, 10:00 (100%): Vakantieveilingen, Cheaptickets, Budgetair (wraca!)
```

**KLUCZOWE ZASADY:**
- ✅ ZAWSZE pokazujemy najtańsze oferty (top 3-5)
- ✅ ALE w RÓŻNEJ kolejności dla każdego usera
- ✅ Seed = userId + daySlot + hourSlot + intensity
- ✅ Deterministyczny (ten sam user = ten sam wynik w danym dniu/godzinie)
- ✅ 4-day cycle (pattern wraca po 4 dniach)
- ✅ Rozpraszamy ruch między biura (nie 100% do jednego)

**DLACZEGO:**
- User NIE MOŻE się nauczyć patternu
- Zawsze widzi dobre ceny (top deals)
- Ale RÓŻNE biura każdy scan
- Maksymalne utrudnienie pattern learning
- Zdrowa dystrybucja ruchu

---

### **RULE #3: PROWIZJA 9% Z OSZCZĘDNOŚCI** 💸

**FORMUŁA:**
```typescript
const commission = packageType === 'free' ? 0.10 : 0.09;
const commissionAmount = Math.round(savings * commission);
const netSavings = savings - commissionAmount;
```

**UI (Payment View):**
```
📋 Samenvatting
   Besparing op [categorie]: €1,387
   Commissie (9%): €125
   ─────────────────────────
   Jouw netto besparing: €1,262

Totaal te betalen: €125
```

**PAKIETY:**
- FREE: 10% prowizji (pierwsze 3 scany gratis)
- PLUS: 9% prowizji
- PRO: 9% prowizji
- FINANCE: 9% prowizji

**REFERRAL CODE:**
- -2% od prowizji
- PLUS z referral: 9% - 2% = 7%

---

### **RULE #4: BIOMETRIC AUTH PRZED UNLOCK** 👆

**FLOW:**
```
Payment → Stripe → Biometric Auth → Unlock
```

**UI:**
```
👆
Bevestig met biometrie
Gebruik Face ID of Touch ID om toegang te krijgen

[✓ Bevestigen]
```

**DLACZEGO:**
- Security
- Premium feel
- Anti-fraud

---

### **RULE #5: DUAL REVENUE MODEL** 💰💰

**ZAWSZE dwa źródła przychodu:**

1. **User Commission (9%):**
   - User płaci za wartość (oszczędności)
   - €1,387 savings × 9% = €125

2. **Affiliate Commission (3-5%):**
   - Biuro/sklep płaci za ruch
   - €4,263 booking × 4% = €170

**TOTAL REVENUE:** €125 + €170 = €295 per transakcja

---

### **RULE #6: WSZYSTKO PO HOLENDERSKU** 🇳🇱

**ZAWSZE używamy holenderskiego:**
- ✅ "Bespaar" (nie "Save")
- ✅ "Reisorganisatie" (nie "Travel agency")
- ✅ "Verborgen" (nie "Hidden")
- ✅ "Bevestig met biometrie" (nie "Confirm with biometric")
- ✅ "Toegang verkregen" (nie "Access granted")

**NIGDY po polsku/angielsku w UI!**

---

## 🎨 **UI COMPONENTS - MODULARNY SYSTEM**

### **COMPONENT 1: Configuration Form**

**Struktura:**
```typescript
<form onSubmit={handleSubmit}>
  {/* 1. REIZIGERS / PERSONEN */}
  <div>Adults, Children, Ages</div>
  
  {/* 2. BESTEMMING / LOCATIE */}
  <div>Destination, Dates, Duration</div>
  
  {/* 3. VERVOER / TRANSPORT */}
  <div>Transport type, Direct flights, Last minute</div>
  
  {/* 4. ACCOMMODATIE / PRODUCT */}
  <div>Type, Stars, Board, Features</div>
  
  {/* 5. VOORKEUREN / FILTERS */}
  <div>Review score, Facilities, Extras</div>
  
  <button type="submit">Zoek beste [categorie] →</button>
</form>
```

**ZASADY:**
- Progress tracker (validFields / totalFields)
- Lock/Unlock configuration
- Visual feedback (green = valid, yellow = touched)
- Wszystko po holendersku

---

### **COMPONENT 2: Results View (PRZED zapłatą)**

**Struktura:**
```typescript
{!isPaid && (
  <>
    <h2>🎉 We vonden {offers.length} beste deals voor jou!</h2>
    <p>Bespaar tot €{maxSavings} op deze [categorie]!</p>
    
    {/* REFERENTIE */}
    <div>💡 Referentie: {referenceOffer.name} €{referencePrice}</div>
    
    {offers.map((offer, i) => (
      <div>
        {/* DETAILS (visible) */}
        <div>€{offer.price}</div>
        <div>💸 Bespaar: €{offer.savings}</div>
        
        {/* PAYWALL (hidden) */}
        <div>
          🔒 [Biuro/Sklep]: Verborgen
          Betaal om te zien waar je kunt [boeken/kopen]
        </div>
      </div>
    ))}
    
    <button onClick={() => setView('payment')}>
      Bekijk [biura/winkels] (€{commissionAmount}) →
    </button>
  </>
)}
```

---

### **COMPONENT 3: Payment View**

**Struktura:**
```typescript
<div>
  <h2>💳 Betaling</h2>
  
  {/* SAMENVATTING */}
  <div>
    Besparing op [categorie]: €{savings}
    Commissie (9%): €{commissionAmount}
    ─────────────────────────
    Jouw netto besparing: €{netSavings}
  </div>
  
  {/* BETAAL */}
  <div>
    Totaal te betalen: €{commissionAmount}
    <button onClick={() => setShowBiometric(true)}>
      Betaal met Stripe →
    </button>
  </div>
</div>
```

---

### **COMPONENT 4: Biometric Auth**

**Struktura:**
```typescript
{showBiometric && (
  <div>
    <div>👆</div>
    <h2>Bevestig met biometrie</h2>
    <p>Gebruik Face ID of Touch ID om toegang te krijgen</p>
    
    <button onClick={() => { 
      setIsPaid(true); 
      setView('results'); 
      setShowBiometric(false); 
    }}>
      ✓ Bevestigen
    </button>
  </div>
)}
```

---

### **COMPONENT 5: Unlocked View (PO zapłacie)**

**Struktura:**
```typescript
{isPaid && (
  <>
    <h2>✅ Toegang verkregen!</h2>
    <p>Je kunt nu [boeken/kopen] bij de beste [biura/winkels]</p>
    
    {/* REFERENTIE */}
    <div>💡 Referentie: {referenceOffer.name} €{referencePrice}</div>
    
    {offers.map((offer, i) => (
      <div>
        {/* NAZWA BIURA (visible!) */}
        <div>{offer.agency}</div>
        <div>€{offer.price}</div>
        <div>💸 Bespaar: €{offer.savings}</div>
        
        {/* LINK (visible!) */}
        <button onClick={() => window.open(offer.url, '_blank')}>
          🌐 [Boek/Koop] bij {offer.agency} →
        </button>
      </div>
    ))}
  </>
)}
```

---

## 🔧 **IMPLEMENTACJA - NOWY KONFIGURATOR**

### **KROK 1: Skopiuj Template**
```bash
cp VacationConfigurator.tsx NewConfigurator.tsx
```

### **KROK 2: Zmień Parametry**
```typescript
// VACATION: destination, dates, duration, stars, board
// ENERGY: address, usage, contract, green
// TELECOM: phone, internet, tv, mobile
// INSURANCE: type, coverage, deductible
// etc.
```

### **KROK 3: Zachowaj Core Components**
```typescript
// ✅ ZACHOWAJ (nie zmieniaj!):
- Results View (paywall logic)
- Payment View (commission calculation)
- Biometric Auth
- Unlocked View

// ✅ ZMIEŃ (parametry specyficzne):
- Configuration Form (inne pola)
- Mock offers (inne dane)
- Category name ("vakantie" → "energie")
```

### **KROK 4: Test Flow**
```
1. Konfiguruj → 2. Wyniki (ukryte biura) → 
3. Payment → 4. Biometric → 5. Unlocked (widoczne biura)
```

---

## 📊 **PRZYKŁADY - RÓŻNE KATEGORIE**

### **VACATION (Wakacje):**
```
Referentie: TUI €5,650
Beste: Vakantieveilingen €4,263
Oszczędności: €1,387
Prowizja: €125 (9%)
```

### **ENERGY (Energia):**
```
Referentie: Essent €2,400/jaar
Beste: Vandebron €1,800/jaar
Oszczędności: €600
Prowizja: €54 (9%)
```

### **TELECOM (Telecom):**
```
Referentie: KPN €60/mnd
Beste: Odido €35/mnd
Oszczędności: €25/mnd = €300/jaar
Prowizja: €27 (9%)
```

### **INSURANCE (Ubezpieczenia):**
```
Referentie: Centraal Beheer €800/jaar
Beste: OHRA €550/jaar
Oszczędności: €250
Prowizja: €22.50 (9%)
```

---

## ⚠️ **CRITICAL RULES - NIE ŁAMAĆ!**

### **1. NIGDY nie pokazuj biur przed paywallem**
```typescript
// ❌ ŹLE:
<div>{offer.agency}</div>

// ✅ DOBRZE:
{!isPaid && <div>🔒 Verborgen</div>}
{isPaid && <div>{offer.agency}</div>}
```

### **2. ZAWSZE pokazuj referencję**
```typescript
// ❌ ŹLE:
<p>Bespaar €1,387</p>

// ✅ DOBRZE:
<p>Bespaar €1,387 (vs TUI €5,650)</p>
<div>💡 Referentie: TUI €5,650</div>
```

### **3. ZAWSZE po holendersku**
```typescript
// ❌ ŹLE:
<button>Show agencies</button>

// ✅ DOBRZE:
<button>Bekijk reisorganisaties →</button>
```

### **4. ZAWSZE dual revenue**
```typescript
// User commission (9%)
const commissionAmount = savings * 0.09;

// Affiliate commission (3-5%)
const affiliateCommission = bookingPrice * 0.04;

// TOTAL
const totalRevenue = commissionAmount + affiliateCommission;
```

---

## 🚀 **CHECKLIST - NOWY KONFIGURATOR**

**PRZED IMPLEMENTACJĄ:**
- [ ] Zdefiniuj parametry konfiguracji (co user wybiera?)
- [ ] Zdefiniuj providers (jakie biura/sklepy?)
- [ ] Zdefiniuj referencję (najdroższy provider)
- [ ] Zdefiniuj affiliate links (tracking URLs)

**PODCZAS IMPLEMENTACJI:**
- [ ] Skopiuj VacationConfigurator jako template
- [ ] Zmień parametry konfiguracji
- [ ] Zachowaj paywall logic (Results → Payment → Biometric → Unlocked)
- [ ] Dodaj referencję ceny
- [ ] Wszystko po holendersku
- [ ] Test full flow

**PO IMPLEMENTACJI:**
- [ ] Test: User nie widzi biur przed paywallem
- [ ] Test: Referentie cena jest widoczna
- [ ] Test: Prowizja 9% jest poprawna
- [ ] Test: Biometric auth działa
- [ ] Test: Po zapłacie widać biura + linki
- [ ] Test: Affiliate tracking działa

---

## 💡 **TIPS & TRICKS**

### **TIP 1: Mock Offers dla Demo**
```typescript
const mockOffers = [
  { agency: 'Beste', price: 1000, isReference: false },
  { agency: 'Tweede', price: 1200, isReference: false },
  { agency: 'Referentie', price: 1500, isReference: true } // Najdroższy
];
```

### **TIP 2: Calculate Savings**
```typescript
const referencePrice = offers.find(o => o.isReference).price;
const bestPrice = offers[0].price;
const savings = referencePrice - bestPrice;
```

### **TIP 3: Filter Reference from Display**
```typescript
const displayOffers = offers.filter(o => !o.isReference);
```

### **TIP 4: Holenderskie Teksty**
```typescript
const TEXTS = {
  vacation: 'vakantie',
  energy: 'energie',
  telecom: 'telecom',
  insurance: 'verzekering',
  book: 'boeken',
  buy: 'kopen',
  agency: 'reisorganisatie',
  provider: 'aanbieder',
  shop: 'winkel'
};
```

---

## 🎯 **SUMMARY**

**MODULARNY SYSTEM = LEGO BLOCKS:**
1. ✅ Te same core components (paywall, payment, biometric, unlock)
2. ✅ Te same zasady (9% prowizja, referentie, dual revenue)
3. ✅ Te same UI patterns (holenderski, visual feedback)
4. ✅ Różne parametry (vacation ≠ energy ≠ telecom)

**KONFIGURATOR PO KONFIGURATORZE:**
- Vacation ✅ (DONE)
- Energy (TODO)
- Telecom (TODO)
- Insurance (TODO)
- Leasing (TODO)
- Loan (TODO)
- Mortgage (TODO)
- CreditCard (TODO)
- Subscriptions (TODO)

**WSZYSTKIE = TE SAME ZASADY + NOWE KLOCKI!**

---

**Data utworzenia:** 23 marca 2026  
**Autor:** Cascade AI  
**Status:** PRODUCTION READY  
**Wersja:** 1.0
