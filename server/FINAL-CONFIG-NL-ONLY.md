# FINALNA KONFIGURACJA - NL-ONLY + NOWE PRODUKTY

**Data:** 21 marca 2026  
**Status:** PRODUCTION READY  
**Język:** HOLENDERSKI (NL) + Angielski (EN)

---

## 🎯 KLUCZOWE ZASADY:

1. ✅ **TYLKO sklepy holenderskie** (.nl domeny + znane NL sklepy)
2. ✅ **TYLKO nowe produkty** (NIE używane, refurbished, demo)
3. ❌ **NIE serwisy napraw** (reparatie, repair)
4. ❌ **NIE marketplace** (Marktplaats, eBay, Fruugo)
5. ❌ **NIE international** (AliExpress, Amazon.com, Joom)
6. ✅ **Małe sklepy NL OK** (jeśli .nl + nowe produkty)

---

## 🚫 BANNED SELLERS:

### Używane/Second-hand:
- marktplaats
- back market, backmarket
- refurbed
- rebuy
- swappie
- 2dehands
- vinted
- ebay
- facebook marketplace, marketplace

### Serwisy/Naprawy:
- reparatie, reparatiecenter
- repair center, repaircenter
- iservices
- service center, servicecenter
- gsm repair, phone repair
- telefoon reparatie

### Outlets:
- outlet, tvoutlet

### Marketplace/Aggregatory:
- fruugo
- onbuy
- cdiscount
- rakuten

### International (non-NL):
- aliexpress
- joom, wish
- banggood, gearbest, tomtop
- lightinthebox, dx.com
- amazon.com, amazon.de, amazon.fr, amazon.co.uk, amazon.es, amazon.it
- amazon - seller (third-party)
- mediamarkt.de, saturn.de
- fnac.com

---

## 🚫 BANNED KEYWORDS (PO HOLENDERSKU!):

### Akcesoria (NL + EN):
- **Etui:** hoes, hoesje, case, cover
- **Paski:** bandje, band, strap
- **Filtry:** filter, stofzak
- **Torby:** tas, bag
- **Ładowarki:** oplader, charger, lader
- **Kable:** kabel, cable, snoer
- **Adaptery:** adapter
- **Folie:** screenprotector, screen protector, schermbeschermer
- **Słuchawki (akcesoria):** oordopjes, earbuds, oortjes

### Używane/Refurbished (NL):
- **Używany:** gebruikt, tweedehands, tweede hands, 2e hands, 2dehands
- **Odnowiony:** gereviseerd, gerenoveerd
- **Jak nowy:** nieuwstaat, als nieuw, zo goed als nieuw, nagenoeg nieuw
- **Używany:** occasion, occasions
- **Zwrot:** retour, retouren, retourproduct
- **Demo:** demo, demonstratie
- **Pokazowy:** showmodel, displaymodel
- **Rozpakowany:** uitpakmodel, open doos, geopend
- **Uszkodzony:** beschadigd

### Używane/Refurbished (EN):
- **Używany:** used, second hand, secondhand, pre-owned, preowned
- **Odnowiony:** refurbished, refurb, renewed, reconditioned
- **Otwarte:** open box, openbox
- **Zwrot:** returned
- **Jak nowy:** like new

---

## ✅ DOZWOLONE SKLEPY:

### Duże sklepy NL:
- bol.com
- Coolblue
- MediaMarkt (NL)
- Alternate
- Wehkamp
- Bijenkorf
- Expert
- BCC
- Gamma, Praxis, Karwei
- Blokker, Hema, Action

### GSM/Telecom NL:
- Gsmweb
- Belsimpel
- KPN, T-Mobile, Vodafone
- Ziggo, Tele2
- Youfone, Simpel, Hollandsnieuwe

### Elektronika NL:
- Paradigit
- Informatique
- Centralpoint
- Mycom
- Dixons
- Phone House

### Małe sklepy NL:
- ✅ OK jeśli mają domenę .nl
- ✅ OK jeśli sprzedają NOWE produkty
- ❌ NIE jeśli są serwisem napraw
- ❌ NIE jeśli sprzedają używane

---

## 🔄 FLOW FILTROWANIA:

```
SearchAPI (10-40 ofert)
    ↓
1. PRICE RANGE (40%-150%)
    ↓ odrzuca bardzo tanie/drogie
    ↓
2. BANNED SELLERS
    ↓ odrzuca używane + international + serwisy
    ↓
3. NL-ONLY FILTER
    ↓ tylko .nl domeny + znane NL sklepy
    ↓
4. BANNED KEYWORDS (NL!)
    ↓ odrzuca akcesoria + używane (po holendersku!)
    ↓
5. QUALITY FILTER
    ↓ odrzuca untrusted sellers
    ↓
6. DEALSCORE V2 (trust 25)
    ↓ weryfikacja jakości
    ↓
7. STANDARD ROTATION (40/30/20/10)
    ↓
FINALNE OFERTY (1-3)
```

---

## 📊 PRZYKŁADOWE WYNIKI:

### Samsung Galaxy S24 256GB:
- **Cena bazowa:** €899
- **Znaleziona:** bol.com €589
- **Oszczędności:** €310 (34.5%)
- **Status:** ✅ Nowy produkt, rzetelny sklep NL

### iPhone 15 Pro 128GB:
- **Cena bazowa:** €1329
- **Znaleziona:** You-Mobile €659
- **Oszczędności:** €670 (50.4%)
- **Status:** ✅ Nowy produkt, sklep NL

---

## ⚠️ CO ZOSTAŁO ODRZUCONE:

Z 40 ofert SearchAPI → 1-3 finalne:

**ODRZUCONE (85-95%):**
- ❌ Marktplaats (używane od prywatnych osób)
- ❌ Back Market (refurbished)
- ❌ AliExpress, Joom (Chiny)
- ❌ Amazon.com, Amazon.de (international)
- ❌ Reparatiecenter.nl (serwis napraw)
- ❌ iServices (serwis Apple)
- ❌ Oferty z "gebruikt", "tweedehands", "nieuwstaat"
- ❌ Oferty z "hoes", "hoesje", "bandje" (akcesoria)
- ❌ Oferty < €360 lub > €1349 (price range)

**POZOSTAŁO (5-15%):**
- ✅ bol.com, Coolblue, MediaMarkt (duże sklepy NL)
- ✅ Gsmweb, Belsimpel (GSM sklepy NL)
- ✅ Małe sklepy .nl (jeśli nowe produkty)

---

## 🎯 DLACZEGO TO DZIAŁA:

1. **NL-Only Filter** - tylko sklepy holenderskie
2. **Banned Keywords (NL!)** - odrzuca używane PO HOLENDERSKU
3. **Banned Sellers** - odrzuca serwisy + marketplace + international
4. **Price Range** - odrzuca bardzo tanie akcesoria
5. **Quality Filter** - odrzuca untrusted sellers
6. **Małe sklepy OK** - jeśli .nl + nowe produkty (najlepsze przebicia!)

---

## ✅ STATUS: PRODUCTION READY

**Konfiguracja finalna:**
- ✅ Tylko sklepy NL
- ✅ Tylko nowe produkty
- ✅ Wszystko po holendersku (keywords)
- ✅ Małe sklepy OK (jeśli .nl + nowe)
- ✅ Serwisy napraw BANNED

**Lokalizacja:** `server/market-api.js` (linie 1535-1695)
