# 📦 PACKAGES CONFIGURATION - FINALNA STRUKTURA

**STATUS:** ZATWIERDZONA - DO IMPLEMENTACJI  
**DATA:** 15.03.2026  
**AGENT ECHO BRANDING:** E(#15803d) ch(#3b82f6) ●(#000, 29px)

---

## 🎯 STRUKTURA 4 PAKIETÓW

### **1. FREE - Darmowy (€0/miesiąc)**

**Funkcjonalności:**
- ✅ 3 darmowe scany QR
- ✅ TOP 3 oferty z rynku
- ✅ **PEŁNE szczegóły PRZED paywallem** (nazwy firm)
- ✅ Prowizja 10% za każdy scan
- ❌ Po 3 scanach → paywall

**Branże:**
- Shopping (wszystkie produkty)

---

### **2. PLUS - Podstawowy (€19.99/miesiąc)**

**Funkcjonalności:**
- ✅ Unlimited scany QR
- ✅ TOP 3 oferty z rynku
- ✅ Ghost Mode 24h
- ✅ Referal kod (3% bonus)
- ✅ Prowizja 10% za każdy scan

**Branże:**
- Shopping (wszystkie produkty)

---

### **3. PRO - Professional (€29.99/miesiąc)**

**Funkcjonalności:**
- ✅ Unlimited scany QR
- ✅ **TOP 10 ofert** (zamiast 3!)
- ✅ Ghost Mode 7 dni
- ✅ Referal kod (3% bonus)
- ✅ Prowizja 10% za każdy scan
- ✅ **4 Konfiguratory Services**

**Konfiguratory:**

#### **1. 🏖️ WAKACJE**
```typescript
interface VacationConfig {
  destination: 'Europa' | 'Azja' | 'Ameryka' | 'Afrika' | 'Oceania'
  departureDate: Date
  persons: number // 1-10
  budget: number // €500-€10.000
  type: 'All-inclusive' | 'Hotel' | 'Apartament' | 'Camping'
  duration: number // 3-21 dni
}
```
**Wyniki:** TOP 10 wakacji (TUI, Corendon, Sunweb, D-reizen)  
**Oszczędności:** €200-€1000

#### **2. 🛡️ UBEZPIECZENIA**
```typescript
interface InsuranceConfig {
  type: 'Auto' | 'Zdrowie' | 'Dom' | 'Życie'
  coverage: 'WA' | 'WA+Casco' | 'Volledig'
  age: number // 18-80
  postcode: string
  bonusMalus: number // 0-10
}
```
**Wyniki:** TOP 10 ubezpieczeń (OHRA, Centraal, FBTO, Ditzo)  
**Oszczędności:** €50-€500/rok

#### **3. ⚡ ENERGIA**
```typescript
interface EnergyConfig {
  type: 'Stroom' | 'Gas' | 'Stroom+Gas'
  consumption: number // 1000-10.000 kWh/jaar
  contract: 'Vast 1 jaar' | 'Vast 3 jaar' | 'Variabel'
  postcode: string
  greenEnergy: boolean
}
```
**Wyniki:** TOP 10 dostawców (Vattenfall, Essent, Eneco, Budget Energie)  
**Oszczędności:** €100-€800/rok

#### **4. 📱 TELECOM**
```typescript
interface TelecomConfig {
  type: 'Mobiel' | 'Internet' | 'TV' | 'Bundel'
  data: number // 1GB-Unlimited
  speed: number // 50-1000 Mb/s
  contract: '1 jaar' | '2 jaar' | 'Sim-only'
  lines: number // 1-5
}
```
**Wyniki:** TOP 10 pakietów (KPN, Vodafone, T-Mobile, Ziggo)  
**Oszczędności:** €100-€600/rok

---

### **4. FINANCE - AGI Assistant (€39.99/miesiąc)**

**Funkcjonalności:**
- ✅ Wszystko z PRO +
- ✅ Ghost Mode 30 dni
- ✅ 4 Konfiguratory Services (z PRO)
- ✅ **4 Konfiguratory Finance**
- ✅ **Agent Echo AGI** - optymalizacja rachunków

**Konfiguratory Finance:**

#### **5. 🏠 HYPOTHEEK**
```typescript
interface MortgageConfig {
  amount: number // €100.000-€1.000.000
  duration: number // 10-30 jaar
  interestType: 'Vast' | 'Variabel' | 'Mix'
  nhg: boolean
  interestOnly: number // 0-50%
}
```
**Wyniki:** TOP 10 hypotheken (ING, Rabobank, ABN AMRO, Obvion)  
**Oszczędności:** €5.000-€50.000 over looptijd

#### **6. 🚗 LEASING**
```typescript
interface LeasingConfig {
  type: 'Auto' | 'Fiets' | 'Equipment'
  amount: number // €10.000-€100.000
  duration: number // 12-60 maanden
  kilometers: number // 10.000-50.000/jaar
  leasingType: 'Operational' | 'Financial'
}
```
**Wyniki:** TOP 10 leasing (Athlon, LeasePlan, Alphabet)  
**Oszczędności:** €500-€5.000/jaar

#### **7. 💳 KREDYTY**
```typescript
interface LoanConfig {
  amount: number // €1.000-€50.000
  duration: number // 12-120 maanden
  purpose: 'Verbouwing' | 'Auto' | 'Studie' | 'Vrij'
  income: number // €20.000-€100.000/jaar
  bkr: boolean
}
```
**Wyniki:** TOP 10 kredytów (ING, Rabobank, Santander, Moneyou)  
**Oszczędności:** €200-€2.000 over looptijd

#### **8. 💳 KARTY KREDYTOWE**
```typescript
interface CreditCardConfig {
  type: 'Visa' | 'Mastercard' | 'American Express'
  limit: number // €500-€10.000
  rewards: 'Cashback' | 'Miles' | 'Punten'
  annualFee: number // €0-€200
  travelInsurance: boolean
}
```
**Wyniki:** TOP 10 kart (ICS, ABN AMRO, ING, Bunq)  
**Oszczędności:** €50-€500/jaar

---

## 🤖 AGENT ECHO AGI - OPTYMALIZACJA RACHUNKÓW

### **AGENT ECHO BRANDING (BETONOWY):**
```
E ch●  Je persoonlijke AI agent
↑  ↑ ↑
│  │ └─ czarne kółko (#000, 29px)
│  └─── niebieskie "ch" (#3b82f6, 20-24px)
└────── zielone "E" (#15803d, 24-28px)
```

### **Flow:**

**1. Upload rachunków:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  Echo  Je persoonlijke AI agent             │
│                                             │
├─────────────────────────────────────────────┤
│ 📄 Wrzuć wszystkie swoje rachunki:         │
│ [Upload PDF/Zdjęcie]                        │
│                                             │
│ Dodane:                                     │
│ ✓ Rachunek 1 - Energia (€100/mies)         │
│ ✓ Rachunek 2 - Telefon (€50/mies)          │
│                                             │
│ RAZEM: €150/mies = €1.800/rok               │
└─────────────────────────────────────────────┘
```

**2. Potwierdzenie:**
```
⚠️ Czy to WSZYSTKIE rachunki?
[✓] Tak, to wszystkie
[POTWIERDŹ I SZUKAJ OPTYMALIZACJI]
```

**3. Agent Echo analizuje:**
```
┌─────────────────────────────────────────────┐
│  Echo  Je persoonlijke AI agent             │
├─────────────────────────────────────────────┤
│              [⟳ SPINNER]                    │
│      Zoekt beste aanbiedingen...            │
│                                             │
│  ✓ Energie - contract analyseren           │
│  ⏳ Telefoon - aanbiedingen zoeken...       │
└─────────────────────────────────────────────┘
```

**4. Wyniki PRE-PAYWALL (BEZ NAZW FIRM!):**
```
┌─────────────────────────────────────────────┐
│  Echo  Je persoonlijke AI agent             │
├─────────────────────────────────────────────┤
│ 💰 Optimalisatie gevonden!                  │
│                                             │
│ 1️⃣ ENERGIA                                 │
│ Huidige kosten:    €100/mnd                 │
│ Nieuwe kosten:     €75/mnd                  │
│ Besparing:         €25/mnd                  │
│ Boete:             €0 (inbegrepen)          │
│                                             │
│ 📊 TOTAAL:                                  │
│ Besparing netto:   €300/jaar                │
│ 💳 PROWIZJA (10%): €30/jaar                 │
│                                             │
│ [BEVESTIG - BETAAL €30]                     │
└─────────────────────────────────────────────┘
```

**5. POST-PAYWALL - Agent Echo działa:**
```
┌─────────────────────────────────────────────┐
│  Echo  Je persoonlijke AI agent             │
├─────────────────────────────────────────────┤
│              [⟳ SPINNER]                    │
│      Regelt alles voor je...                │
│                                             │
│  ✓ Essent - opzegging verstuurd             │
│  ✓ Vattenfall - contract getekend           │
│                                             │
│  Voortgang: ████████░░░░ 65%               │
└─────────────────────────────────────────────┘
```

---

## 📊 PORÓWNANIE PAKIETÓW

| Feature | FREE | PLUS | PRO | FINANCE |
|---------|------|------|-----|---------|
| **Cena** | €0 | €19.99/m | €29.99/m | €39.99/m |
| **Scany** | 3 | ∞ | ∞ | ∞ |
| **Oferty** | TOP 3 | TOP 3 | TOP 10 | TOP 10 |
| **Ghost Mode** | ❌ | 24h | 7d | 30d |
| **Referal** | ❌ | ✅ | ✅ | ✅ |
| **Wakacje** | ❌ | ❌ | ✅ | ✅ |
| **Ubezpieczenia** | ❌ | ❌ | ✅ | ✅ |
| **Energia** | ❌ | ❌ | ✅ | ✅ |
| **Telecom** | ❌ | ❌ | ✅ | ✅ |
| **Hypotheek** | ❌ | ❌ | ❌ | ✅ |
| **Leasing** | ❌ | ❌ | ❌ | ✅ |
| **Kredyty** | ❌ | ❌ | ❌ | ✅ |
| **Karty** | ❌ | ❌ | ❌ | ✅ |
| **Agent Echo AGI** | ❌ | ❌ | ❌ | ✅ |

---

## 🔒 KLUCZOWE ZASADY

### **PRE-PAYWALL:**
✅ Pokazujemy: ceny, oszczędności, kary (wliczone)  
❌ NIE pokazujemy: nazw firm, szczegółów dostawców

### **POST-PAYWALL:**
✅ Pokazujemy: wszystko (nazwy firm, pakiety, szczegóły)  
✅ Agent Echo działa: wypowiedzenia, umowy, przełączenia

### **AUDIT TRAIL:**
Każda konfiguracja MUSI być potwierdzana przyciskiem

### **PŁATNOŚCI:**
Stripe + iDEAL (Holandia)

---

**KONIEC - GOTOWE DO IMPLEMENTACJI! ✅**
