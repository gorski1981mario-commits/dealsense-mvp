# AUDYT KOMISJI I FEATURES - WSZYSTKIE PAKIETY

## NASZE OSTATNIE USTALENIA (DEFINITIVE):

### Komisje:
- **FREE:** 10% (po 3 gratis scans)
- **PLUS:** 5%
- **PRO:** 3%
- **FINANCE:** 0%

### Referral Code:
- **Wszędzie:** 2% korting (nie 3%!)

---

## PORÓWNANIE: PricingAccordion.tsx vs Strony Pakietów

### FREE PACKAGE:

**PricingAccordion.tsx (linie 19-26):**
```
✓ 3 Gratis scans om DealSense te proberen
✓ Toegang tot 10 productcategorieën
✓ Basis prijsvergelijking (top 3 deals)
✓ 1000+ Nederlandse webshops
⚠️ Na 3 scans: 10% commissie op besparingen ✅ POPRAWNE
🎁 Referral: deel je unieke code, vrienden krijgen 2% korting... ✅ POPRAWNE
```

**Strona FREE (app/page.tsx):**
- Nie ma dedykowanej sekcji "Wat krijg je"
- ✅ OK - FREE nie potrzebuje tej sekcji

---

### PLUS PACKAGE:

**PricingAccordion.tsx (linie 33-42):**
```
✓ Onbeperkt producten scannen
✓ 10 productcategorieën
✓ Slechts 9% commissie op besparingen ❌ BŁĄD! -> 5%
✓ Ghost Mode - prijsmonitoring (24u)
✓ Prioriteit support
✓ 1000+ Nederlandse webshops
✓ Echo - AI productadvies & garanties
🎁 Referral PLUS2026: deel code, vrienden -2%... ✅ POPRAWNE
```

**Strona PLUS (app/plus/page.tsx linie 104-109):**
```
✓ Onbeperkt scans
✓ Shopping
✓ Ghost Mode (24h)
✓ 5% commissie ✅ POPRAWNE
```

**BRAKUJE na stronie PLUS:**
- ❌ 10 productcategorieën
- ❌ Prioriteit support
- ❌ 1000+ Nederlandse webshops
- ❌ Echo - AI productadvies & garanties
- ❌ Referral PLUS2026 (2% korting)

---

### PRO PACKAGE:

**PricingAccordion.tsx (linie 49-58):**
```
✓ Onbeperkt scans - producten én diensten
✓ 16 categorieën (Vakanties, Verzekeringen, Energie, Telecom)
✓ Slechts 9% commissie op besparingen ❌ BŁĄD! -> 3%
✓ Ghost Mode - prijsmonitoring (24u)
✓ Prioriteit support
✓ 1000+ Nederlandse webshops
✓ Echo - volledige AI assistent
🎁 Referral PRO2026: deel code, vrienden -2%... ✅ POPRAWNE
```

**Strona PRO (app/pro/page.tsx linie 105-112):**
```
✓ Onbeperkt scans
✓ Shopping + Services
✓ Vakanties
✓ Verzekeringen
✓ Energie
✓ 3% commissie ✅ POPRAWNE
```

**BRAKUJE na stronie PRO:**
- ❌ 16 categorieën (info)
- ❌ Telecom (w liście features)
- ❌ Ghost Mode (24u)
- ❌ Prioriteit support
- ❌ 1000+ Nederlandse webshops
- ❌ Echo - volledige AI assistent
- ❌ Referral PRO2026 (2% korting)

---

### FINANCE PACKAGE:

**PricingAccordion.tsx (linie 65-76):**
```
✓ Alles inclusief - alle 20+ categorieën
✓ Hypotheken, Leningen, Leasing, Creditcards
✓ Vergelijk alle financiële producten
✓ Slechts 9% commissie op besparingen ❌ BŁĄD! -> 0%
✓ Ghost Mode - anonieme vergelijking (5 min)
✓ VIP support - directe hulp
✓ 1000+ Nederlandse webshops
✓ Echo - premium AI assistent + financieel advies
💬 Extra Echo prompts: koop 10.000 prompts voor €9,99
🎁 Referral FINANCE2026: deel code, vrienden -2%... ✅ POPRAWNE
```

**Strona FINANCE (app/finance/page.tsx linie 105-112):**
```
✓ Alles inclusief
✓ Shopping + Services
✓ Hypotheken
✓ Leningen
✓ Leasing
✓ 0% commissie ✅ POPRAWNE
```

**BRAKUJE na stronie FINANCE:**
- ❌ 20+ categorieën (info)
- ❌ Creditcards (w liście)
- ❌ Vergelijk alle financiële producten
- ❌ Ghost Mode (5 min)
- ❌ VIP support - directe hulp
- ❌ 1000+ Nederlandse webshops
- ❌ Echo - premium AI assistent + financieel advies
- ❌ Extra Echo prompts (10.000 za €9,99)
- ❌ Referral FINANCE2026 (2% korting)

---

## LISTA WSZYSTKICH POPRAWEK:

### 1. PricingAccordion.tsx:
- [ ] Linia 36: PLUS - zmień "9%" → "5%"
- [ ] Linia 52: PRO - zmień "9%" → "3%"
- [ ] Linia 69: FINANCE - zmień "9%" → "0%"

### 2. app/plus/page.tsx (linie 104-109):
Dodać brakujące features:
```
✓ Onbeperkt scans
✓ 10 productcategorieën
✓ Shopping
✓ Ghost Mode (24h)
✓ Prioriteit support
✓ 1000+ Nederlandse webshops
✓ Echo - AI productadvies & garanties
✓ 5% commissie
🎁 Referral PLUS2026: vrienden -2%, jij -2%
```

### 3. app/pro/page.tsx (linie 105-112):
Dodać brakujące features:
```
✓ Onbeperkt scans
✓ 16 categorieën
✓ Shopping + Services
✓ Vakanties
✓ Verzekeringen
✓ Energie
✓ Telecom
✓ Ghost Mode (24h)
✓ Prioriteit support
✓ 1000+ Nederlandse webshops
✓ Echo - volledige AI assistent
✓ 3% commissie
🎁 Referral PRO2026: vrienden -2%, jij -2%
```

### 4. app/finance/page.tsx (linie 105-112):
Dodać brakujące features:
```
✓ Alles inclusief - 20+ categorieën
✓ Shopping + Services
✓ Hypotheken
✓ Leningen
✓ Leasing
✓ Creditcards
✓ Vergelijk alle financiële producten
✓ Ghost Mode (5 min)
✓ VIP support - directe hulp
✓ 1000+ Nederlandse webshops
✓ Echo - premium AI + financieel advies
✓ 0% commissie
💬 Extra Echo prompts: 10.000 voor €9,99
🎁 Referral FINANCE2026: vrienden -2%, jij -2%
```

---

## PODSUMOWANIE:

**Total zmian:** 4 pliki
- PricingAccordion.tsx: 3 zmiany (komisje)
- app/plus/page.tsx: rozbudowa features (4 → 9 items)
- app/pro/page.tsx: rozbudowa features (6 → 13 items)
- app/finance/page.tsx: rozbudowa features (6 → 14 items)
