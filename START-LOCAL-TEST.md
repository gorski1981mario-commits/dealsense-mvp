# 📱 TESTOWANIE NA TELEFONIE - INSTRUKCJA

## 🚀 KROK 1: URUCHOM BACKEND (Terminal 1)

```bash
cd "c:\DEALSENSE AI\server"
npm start
```

**Powinno pokazać:**
```
🚀 Dealsense działa na http://localhost:4000
```

---

## 🌐 KROK 2: URUCHOM FRONTEND (Terminal 2)

```bash
cd "c:\DEALSENSE AI"
npm run dev
```

**Powinno pokazać:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

**WAŻNE:** Zapisz adres **Network** (np. `http://192.168.1.100:3000`)

---

## 📱 KROK 3: POŁĄCZ TELEFON

### OPCJA A: Ta sama sieć WiFi (NAJPROSTSZE)

1. Podłącz telefon do **tej samej sieci WiFi** co komputer
2. Otwórz przeglądarkę na telefonie
3. Wpisz adres Network z kroku 2:
   ```
   http://192.168.x.x:3000
   ```

### OPCJA B: ngrok (jeśli inna sieć)

**Terminal 3:**
```bash
# Zainstaluj ngrok (jeśli nie masz):
# https://ngrok.com/download

# Expose frontend:
ngrok http 3000
```

**Dostaniesz URL:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Użyj tego URL na telefonie:** `https://abc123.ngrok.io`

---

## 🧪 KROK 4: TESTUJ NA TELEFONIE

### 4.1 Otwórz aplikację
- Przejdź do URL z kroku 3
- Zaloguj się lub zarejestruj (FREE package)

### 4.2 Przejdź do Scanner
```
Menu → Scanner → Scan Product
```

### 4.3 Testuj z EAN-ami

**ELEKTRONIKA:**
```
Samsung Galaxy S24: 8806094934850
iPhone 15: 0195949038488
```

**DOM:**
```
Dyson V15: 5025155069806
Philips Airfryer: 8710103906698
```

**MODA:**
```
Nike Air Force 1: 0193655394676
Adidas Samba: 4066759188372
```

**NARZĘDZIA:**
```
Makita DHP484Z: 0088381830195
Bosch GSR 12V: 3165140821728
```

---

## ✅ CO SPRAWDZIĆ

### PRZED PAYWALLEM (FREE package):
- ✅ Nazwa produktu widoczna
- ✅ Zdjęcie produktu widoczne
- ✅ 3 oferty z cenami widoczne
- ✅ Oszczędności widoczne
- ✅ Rating widoczny
- ❌ **SKLEPY UKRYTE** (🔒 Verborgen)
- ❌ **LINKI UKRYTE**

### PO PAYWALLU (PLUS/PRO/FINANCE):
- ✅ Wszystko z powyżej
- ✅ **SKLEPY WIDOCZNE** (Coolblue, MediaMarkt, Bol.com)
- ✅ **LINKI WIDOCZNE** (Kup teraz →)

### JAKOŚĆ OFERT:
- ✅ Tylko NOWE produkty (nie tweedehands)
- ✅ Nie refurbished (nie Back Market)
- ✅ Nie abonament (nie "met abonnement")
- ✅ Nie akcesoria (nie case, hoes, kabel)
- ✅ Realne ceny (40%-150% expected)

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot connect"
**Rozwiązanie:**
- Sprawdź czy telefon w tej samej sieci WiFi
- Sprawdź firewall Windows (może blokować)
- Użyj ngrok zamiast local IP

### Problem: "No offers found"
**Rozwiązanie:**
- Sprawdź logi backend (Terminal 1)
- Sprawdź czy SearchAPI key jest w `.env`
- Sprawdź czy produkt istnieje w NL

### Problem: "Sklepy widoczne przed paywallem"
**Rozwiązanie:**
- ❌ KRYTYCZNY BUG!
- Sprawdź `app/scanner/page.tsx`
- Sklepy MUSZĄ być ukryte przed paywallem

---

## 📊 LOGI DO SPRAWDZENIA

**Backend (Terminal 1):**
```
[SearchAPI] Query: Samsung Galaxy S24
[1. PRICE RANGE] 40 → 38 offers
[2. BANNED SELLERS] 38 → 35 offers (usunięto: 3)
[3. BANNED KEYWORDS] 35 → 32 offers (usunięto: 3)
[4. NL-ONLY] 32 → 30 offers
[DealScore V2] 30 → 3 final offers
✅ SUCCESS: 3 offers returned
```

**Frontend (Terminal 2):**
```
[Scanner] EAN scanned: 8806094934850
[API] Fetching offers...
[API] Received 3 offers
[UI] Rendering locked view (shops hidden)
```

---

## 🎯 QUICK START (COPY-PASTE)

**Terminal 1 (Backend):**
```bash
cd "c:\DEALSENSE AI\server" && npm start
```

**Terminal 2 (Frontend):**
```bash
cd "c:\DEALSENSE AI" && npm run dev
```

**Telefon:**
```
http://192.168.x.x:3000
(sprawdź adres Network w Terminal 2)
```

---

## ✅ GOTOWE!

Aplikacja działa lokalnie i jest dostępna na telefonie.
Możesz testować skanowanie produktów w sklepie.

**WAŻNE:** 
- Backend MUSI działać (Terminal 1)
- Frontend MUSI działać (Terminal 2)
- Telefon MUSI być w tej samej sieci WiFi
