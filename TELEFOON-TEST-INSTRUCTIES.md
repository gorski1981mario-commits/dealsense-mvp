# 📱 INSTRUKCJE - TEST NA TELEFONIE

**Data:** 27 marca 2026  
**Cel:** Przetestować DealSense na telefonie jak prawdziwy użytkownik

---

## 🚀 KROK 1: URUCHOM SERVER

### Backend (API):
```bash
cd server
npm start
```

**Sprawdź czy działa:**
- Server powinien być na: `http://localhost:3001`
- Sprawdź w przeglądarce: `http://localhost:3001/health`

### Frontend (App):
```bash
cd ..
npm run dev
```

**Sprawdź czy działa:**
- App powinien być na: `http://localhost:3000`
- Otwórz w przeglądarce: `http://localhost:3000`

---

## 📱 KROK 2: POŁĄCZ TELEFON

### Opcja A: Ngrok (Najprostsze)
```bash
# Zainstaluj ngrok (jeśli nie masz)
# https://ngrok.com/download

# Uruchom ngrok dla frontendu
ngrok http 3000

# Dostaniesz URL typu:
# https://abc123.ngrok.io
```

**Otwórz ten URL na telefonie!**

### Opcja B: Ta sama sieć WiFi
```bash
# Sprawdź swój lokalny IP
ipconfig

# Znajdź IPv4 Address (np. 192.168.1.100)
# Otwórz na telefonie:
# http://192.168.1.100:3000
```

---

## 🧪 KROK 3: TESTUJ JAK UŻYTKOWNIK

### TEST 1: ELEKTRONIKA (GWARANTOWANY SUKCES)
1. Otwórz app na telefonie
2. Kliknij "Scan Product" lub wpisz ręcznie:
   - **Produkt:** iPhone 15 Pro
   - **Sklep:** MediaMarkt
   - **Cena:** €1229

**Oczekiwany wynik:**
```
✅ 3-5 ofert
✅ Wszystkie Trust >= 50
✅ Giganci: Bol.com, Coolblue, Amazon.nl
✅ Oszczędności: 10-20%
✅ Smart Bundles: Case, Screen Protector
```

### TEST 2: ZABAWKI (WYSOKIE OSZCZĘDNOŚCI)
- **Produkt:** LEGO Technic Porsche 911
- **Sklep:** Intertoys
- **Cena:** €169

**Oczekiwany wynik:**
```
✅ 3-5 ofert
✅ Oszczędności: 30-40%
✅ Mix gigantów + niszowych
```

### TEST 3: SPORT (NISZOWE SKLEPY)
- **Produkt:** Nike Air Max 90
- **Sklep:** Zalando
- **Cena:** €149

**Oczekiwany wynik:**
```
✅ 3-5 ofert
✅ 80%+ niszowe sklepy
✅ Oszczędności: 15-25%
```

### TEST 4: KSIĄŻKI (NAJWYŻSZE OSZCZĘDNOŚCI)
- **Produkt:** Harry Potter Complete Collection
- **Sklep:** Bol.com
- **Cena:** €89

**Oczekiwany wynik:**
```
✅ 2-3 oferty
✅ Amazon.nl dominuje
✅ Oszczędności: 25-50%
```

### TEST 5: UNSUPPORTED CATEGORY (BŁĄD)
- **Produkt:** IKEA Kallax Kast
- **Sklep:** IKEA
- **Cena:** €99

**Oczekiwany wynik:**
```
❌ Brak ofert
💡 Komunikat: "Meubels (IKEA) worden niet ondersteund"
💡 Sugestia: "Probeer: Elektronica, Speelgoed, Sport"
```

---

## 📊 CO SPRAWDZIĆ NA TELEFONIE:

### ✅ MUSI DZIAŁAĆ:
1. **Skanowanie produktu** (kamera lub ręczne wpisanie)
2. **Pokazanie 3-5 ofert** (nie więcej, nie mniej)
3. **Trust Score >= 50** (wszystkie sklepy sprawdzone)
4. **Oszczędności wyraźnie widoczne** (€X besparing)
5. **Smart Bundles** (jeśli dostępne)
6. **Base Seller Filter** (nie pokazuj sklepu gdzie skanował)
7. **Komunikat dla unsupported** (IKEA, meble)

### ❌ NIE MOŻE BYĆ:
1. **Podejrzane sklepy** (Etsy, OnBuy, nowe bez reviews)
2. **Używane/refurbished** produkty
3. **Akcesoria zamiast produktu** (case zamiast iPhone)
4. **Ten sam sklep** w wynikach (Bol.com → Bol.com)
5. **Sklepy spoza NL/BE** (.fr, .de, .pl)
6. **Fejkowe dane** (demo/mock)

---

## 🎯 PRZYKŁADOWY FLOW NA TELEFONIE:

```
1. User otwiera app
   ↓
2. Skanuje produkt w MediaMarkt
   "iPhone 15 Pro - €1229"
   ↓
3. App pokazuje:
   
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
   
4. User klika na ofertę
   ↓
5. Biometric confirmation (Face ID/Touch ID)
   ↓
6. Przekierowanie do Coolblue
```

---

## 🔧 TROUBLESHOOTING:

### Problem: "Cannot connect to server"
**Rozwiązanie:**
```bash
# Sprawdź czy backend działa
cd server
npm start

# Sprawdź czy port 3001 jest wolny
netstat -ano | findstr :3001
```

### Problem: "Brak ofert dla wszystkich produktów"
**Rozwiązanie:**
```bash
# Sprawdź czy masz API key
cd server
cat .env | findstr GOOGLE_SHOPPING_API_KEY

# Jeśli brak, dodaj:
GOOGLE_SHOPPING_API_KEY=twoj_klucz_tutaj
```

### Problem: "Pokazuje podejrzane sklepy"
**Rozwiązanie:**
```bash
# Sprawdź czy Trust threshold = 50
grep "return score >= 50" server/scoring/trustEngine.js

# Powinno być:
# return score >= 50;
```

### Problem: "Etsy/OnBuy w wynikach"
**Rozwiązanie:**
```bash
# Sprawdź banned sellers
grep "etsy" server/market-api.js
grep "onbuy" server/market-api.js

# Powinny być w banned sellers
```

---

## 📋 CHECKLIST PRZED TESTEM:

- [ ] Backend uruchomiony (port 3001) ✅
- [ ] Frontend uruchomiony (port 3000) ✅
- [ ] Ngrok/Local IP skonfigurowane ✅
- [ ] API key w .env ✅
- [ ] Trust threshold = 50 ✅
- [ ] Etsy/OnBuy/Cdiscount banned ✅
- [ ] Smart Bundles przed filtrami ✅
- [ ] Base Seller Filter aktywny ✅
- [ ] 13 kategorii w profilu ✅
- [ ] Telefon na tej samej sieci WiFi ✅

---

## 🎯 OCZEKIWANE WYNIKI:

**Sukces rate:** 80%+ (8/10 produktów)  
**Gemiddelde besparing:** 25-30%  
**Trust score:** 80+ średnio  
**Giganten vs Niszowe:** 20% vs 80%  
**Smart Bundles:** 60%+ produktów  

---

## 📞 WSPARCIE:

Jeśli coś nie działa:
1. Sprawdź logi w terminalu (backend + frontend)
2. Sprawdź Network tab w Chrome DevTools
3. Sprawdź `server/CANONICAL-DEALSCORE.md` - kanoniczna prawda
4. Sprawdź ostatnie commity: `git log --oneline -10`

---

**GOTOWE DO TESTU!** 🚀

Otwórz app na telefonie i zacznij skanować produkty jak prawdziwy użytkownik!
