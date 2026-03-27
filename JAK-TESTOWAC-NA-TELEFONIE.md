# 📱 JAK TESTOWAĆ NA TELEFONIE - PROSTA INSTRUKCJA

**Dla:** Mario  
**Data:** 27 marca 2026  
**Cel:** Przetestować DealSense na dilsons.nl jak prawdziwy użytkownik

---

## 🚀 KROK 1: OTWÓRZ APLIKACJĘ

### Na telefonie otwórz:
```
https://dilsons.nl
```

**LUB:**
```
https://dealsense-mvp.vercel.app
```

---

## 📱 KROK 2: JAK TESTOWAĆ PRODUKT

### OPCJA A: Skanuj kod kreskowy (EAN)
1. Kliknij "Scan Product" w aplikacji
2. Zezwól na dostęp do kamery
3. Zeskanuj kod kreskowy produktu
4. Aplikacja automatycznie pobierze dane

### OPCJA B: Wpisz ręcznie (ŁATWIEJSZE DO TESTÓW)
1. Kliknij "Manual Entry" lub "Voer handmatig in"
2. Wpisz dane produktu:
   - **Nazwa produktu:** np. "iPhone 15 Pro"
   - **Sklep:** np. "MediaMarkt"
   - **Cena:** np. "1229"
3. Kliknij "Zoek aanbiedingen"

---

## 🧪 KROK 3: PRZYKŁADOWE PRODUKTY DO TESTU

### TEST 1: ELEKTRONIKA (GWARANTOWANY SUKCES) ✅
```
Produkt: iPhone 15 Pro
Sklep: MediaMarkt
Cena: €1229
```

**Oczekiwany wynik:**
- 3-5 ofert
- Coolblue, Bol.com, Expert
- Oszczędności: 10-20%
- Trust >= 50 (wszystkie sklepy sprawdzone)

---

### TEST 2: ZABAWKI (WYSOKIE OSZCZĘDNOŚCI) ✅
```
Produkt: LEGO Technic Porsche 911
Sklep: Intertoys
Cena: €169
```

**Oczekiwany wynik:**
- 3-5 ofert
- Oszczędności: 30-40%
- Mix gigantów + niszowych

---

### TEST 3: SPORT (NISZOWE SKLEPY) ✅
```
Produkt: Nike Air Max 90
Sklep: Zalando
Cena: €149
```

**Oczekiwany wynik:**
- 3-5 ofert
- 80%+ niszowe sklepy
- Oszczędności: 15-25%

---

### TEST 4: KSIĄŻKI (NAJWYŻSZE OSZCZĘDNOŚCI) ✅
```
Produkt: Harry Potter Complete Collection
Sklep: Bol.com
Cena: €89
```

**Oczekiwany wynik:**
- 2-3 oferty
- Amazon.nl dominuje
- Oszczędności: 25-50%

---

### TEST 5: UNSUPPORTED (KOMUNIKAT BŁĘDU) ❌
```
Produkt: IKEA Kallax Kast
Sklep: IKEA
Cena: €99
```

**Oczekiwany wynik:**
- Brak ofert
- Komunikat: "Meubels (IKEA) worden niet ondersteund"
- Sugestia: "Probeer: Elektronica, Speelgoed, Sport"

---

## 📊 CO SPRAWDZIĆ W WYNIKACH:

### ✅ MUSI BYĆ:
1. **3-5 ofert** (nie więcej, nie mniej)
2. **Oszczędności wyraźne** (€X besparing, Y%)
3. **Tylko sprawdzone sklepy** (Trust >= 50)
4. **Nie pokazuj sklepu gdzie skanował** (np. MediaMarkt → NIE MediaMarkt w wynikach)
5. **Tylko NL/BE sklepy** (żadnych .fr, .de, .pl)
6. **Smart Bundles** (jeśli dostępne - case, screen protector)

### ❌ NIE MOŻE BYĆ:
1. **Etsy, OnBuy, Cdiscount** (międzynarodowe marketplace)
2. **Używane/refurbished** produkty
3. **Akcesoria zamiast produktu** (case zamiast iPhone)
4. **Ten sam sklep** w wynikach
5. **Podejrzane sklepy** (nowe, bez reviews)

---

## 🎯 PRZYKŁADOWY WYNIK (iPhone 15 Pro):

```
💶 PRIJS IN WINKEL:
MediaMarkt: €1229

💰 ONZE AANBIEDINGEN:

🥇 Coolblue €1099
   Besparing: €130 (10.6%)
   Trust: 100/100 ✅
   
🥈 Bol.com €1149
   Besparing: €80 (6.5%)
   Trust: 100/100 ✅
   
🥉 Expert €1169
   Besparing: €60 (4.9%)
   Trust: 85/100 ✅

🎁 SMART BUNDLES:
- iPhone Case €29.99
- Screen Protector €19.99
```

---

## 🔧 JEŚLI COŚ NIE DZIAŁA:

### Problem: "Brak ofert dla wszystkich produktów"
**Rozwiązanie:**
- Sprawdź czy backend działa: https://dealsense-aplikacja.onrender.com/health
- Spróbuj innego produktu (iPhone, LEGO, Nike)

### Problem: "Pokazuje Etsy/OnBuy"
**To błąd!** Zgłoś mi - te sklepy powinny być zablokowane.

### Problem: "Pokazuje ten sam sklep co skanowałem"
**To błąd!** Base Seller Filter powinien to blokować.

### Problem: "Pokazuje używane/refurbished"
**To błąd!** Filtry powinny to odrzucać.

---

## 📋 CHECKLIST PRZED TESTEM:

- [ ] Otwórz dilsons.nl na telefonie ✅
- [ ] Wybierz produkt do testu ✅
- [ ] Wpisz dane ręcznie (łatwiejsze) ✅
- [ ] Sprawdź wyniki ✅
- [ ] Zweryfikuj czy wszystko się zgadza ✅

---

## 🎯 CO TESTUJEMY:

1. **Trust Filter** - tylko sklepy >= 50 Trust
2. **Base Seller Filter** - nie pokazuj sklepu gdzie skanował
3. **Etsy/OnBuy banned** - żadnych międzynarodowych
4. **Smart Bundles** - akcesoria dostępne
5. **Oszczędności** - wyraźnie widoczne
6. **13 kategorii** - wszystkie wspierane

---

## 📞 JAK ZGŁOSIĆ BŁĄD:

Jeśli coś nie działa, powiedz mi:
1. **Jaki produkt** testowałeś
2. **Co się pokazało** (screenshot)
3. **Co powinno być** (oczekiwany wynik)

---

**GOTOWE!** Otwórz dilsons.nl na telefonie i zacznij testować! 🚀

**NAJWAŻNIEJSZE:** Nie potrzebujesz żadnego tokenu ani logowania - po prostu otwórz stronę i wpisz produkt!
