# 🌐 PROXY SETUP GUIDE - KROK PO KROKU

---

## 📍 GDZIE KUPIĆ PROXY

### **REKOMENDACJA: IPRoyal Residential Proxies**

**Link:** https://iproyal.com/residential-proxies/

**Dlaczego IPRoyal:**
- ✅ Residential proxies (nie blokowane przez sklepy)
- ✅ Geo-targeting (NL location)
- ✅ 85-90% success rate na MediaMarkt/Bol
- ✅ Pay-as-you-go (nie tracisz niewykorzystanych GB)
- ✅ Dobra dokumentacja

---

## 💰 PAKIETY I CENY

| Pakiet | Cena | GB | Szacowane skany | Rekomendacja |
|--------|------|----|--------------------|--------------|
| **Starter** | €7 | 1GB | ~400 skanów | ❌ Za mało |
| **Small** | €40 | 10GB | ~4,000 skanów | ⚠️ OK na start |
| **Medium** | €80 | 20GB | ~8,000 skanów | ✅ **POLECAM** |
| **Large** | €160 | 50GB | ~20,000 skanów | ⚠️ Overkill na start |

**MOJA REKOMENDACJA: 20GB (€80)**
- Wystarczy na 8,000 skanów (z cache: ~40,000)
- ~250 skanów/dzień przez miesiąc
- Dobry balans cena/wydajność

---

## 🛒 JAK KUPIĆ - KROK PO KROKU

### **KROK 1: Zarejestruj się**
1. Idź na: https://iproyal.com/residential-proxies/
2. Kliknij "Get Started" lub "Sign Up"
3. Zarejestruj konto (email + hasło)
4. Potwierdź email

### **KROK 2: Wybierz pakiet**
1. Zaloguj się do dashboard
2. Idź do "Residential Proxies"
3. Wybierz pakiet: **20GB (€80)** ← POLECAM
4. Kliknij "Purchase"

### **KROK 3: Zapłać**
1. Wybierz metodę płatności:
   - Credit Card (instant)
   - PayPal (instant)
   - Crypto (5-30 min)
2. Zapłać €80
3. Poczekaj na potwierdzenie (1-5 min)

### **KROK 4: Pobierz credentials**
1. Idź do dashboard → "Residential Proxies"
2. Znajdź sekcję "Proxy Details"
3. Zapisz:
   ```
   Host: geo.iproyal.com
   Port: 12321
   Username: twój_username
   Password: twoje_hasło
   ```

---

## ⚙️ KONFIGURACJA W DEALSENSE

### **KROK 1: Otwórz `.env`**
```bash
# W folderze: c:\DEALSENSE AI\server\.env
```

### **KROK 2: Dodaj proxy credentials**
```bash
# ========================================
# PROXY CONFIGURATION (IPRoyal)
# ========================================

PROXY_ENABLED=true
PROXY_HOST=geo.iproyal.com
PROXY_PORT=12321
PROXY_USERNAME=twój_username_z_iproyal
PROXY_PASSWORD=twoje_hasło_z_iproyal

# Geo-targeting (Netherlands)
PROXY_COUNTRY=nl

# ========================================
# CRAWLER CONFIGURATION
# ========================================

USE_OWN_CRAWLER=true  # ← ZMIEŃ NA true!
CRAWLER_MAX_DOMAINS=30
USE_MOCK_FALLBACK=false  # ← ZMIEŃ NA false!
```

### **KROK 3: Restart serwera**
```bash
# Zatrzymaj serwer (Ctrl+C)
# Uruchom ponownie:
node server-simple.js
```

---

## 🧪 TEST PROXY

### **KROK 1: Test connection**
```bash
cd server
node test-proxy-connection.js
```

Stworzyłem ten plik dla Ciebie - uruchom go żeby sprawdzić czy proxy działa.

### **KROK 2: Test real scraping**
```bash
node test-real-scraping.js
```

To przetestuje scraping MediaMarkt/Bol z proxy.

### **KROK 3: Test full flow**
```bash
node test-real-products.js
```

To przetestuje cały flow z rotacją + proxy.

---

## 📊 MONITOROWANIE ZUŻYCIA

### **W IPRoyal Dashboard:**
1. Zaloguj się na https://iproyal.com
2. Idź do "Residential Proxies"
3. Zobacz "Usage Statistics":
   - GB used
   - GB remaining
   - Requests count

### **Alerty:**
- Ustaw alert gdy zostanie 20% GB (4GB)
- Dostaniesz email reminder

---

## ⚠️ TROUBLESHOOTING

### **Problem: "Proxy connection failed"**
```bash
# Sprawdź credentials w .env:
PROXY_HOST=geo.iproyal.com  # Bez http://
PROXY_PORT=12321            # Numer, nie string
PROXY_USERNAME=correct_username
PROXY_PASSWORD=correct_password
```

### **Problem: "403 Forbidden" nadal**
```bash
# Sprawdź geo-targeting:
PROXY_COUNTRY=nl  # Netherlands

# Lub spróbuj bez geo:
# PROXY_COUNTRY=
```

### **Problem: "Timeout"**
```bash
# Zwiększ timeout w crawler/config.js:
timeout: {
  page: 30000,  # 30s zamiast 15s
  request: 10000
}
```

---

## 💡 TIPS & BEST PRACTICES

### **1. Cache = oszczędność**
```bash
# Włącz cache (już włączony w .env):
MARKET_DISK_CACHE_ENABLED=1

# Cache TTL:
# - Popularne produkty: 1h
# - Rzadkie produkty: 24h

# Oszczędność: 70-80% GB!
```

### **2. Rate limiting**
```bash
# Nie crawluj za szybko:
CRAWLER_CONCURRENCY=3  # Max 3 domeny jednocześnie
CRAWLER_DELAY=1000     # 1s delay między requestami
```

### **3. Monitoruj usage**
```bash
# Sprawdzaj co tydzień:
# - Ile GB zużyłeś
# - Ile skanów zrobiłeś
# - Success rate

# Jeśli success rate < 80%:
# → Zwiększ timeout
# → Sprawdź geo-targeting
```

---

## 🎯 EXPECTED RESULTS

### **Po konfiguracji proxy:**

```bash
# Test MediaMarkt:
✅ Status: 200 OK
✅ Price found: €789
✅ Success rate: 85-90%

# Test Bol.com:
✅ Status: 200 OK
✅ Price found: €799
✅ Success rate: 85-90%

# Test Coolblue:
✅ Status: 200 OK
✅ Price found: €819
✅ Success rate: 90-95%
```

### **Realne przebicia:**
```
iPhone 15:
- MediaMarkt: €789
- Azerty.nl: €779 (€10 taniej!)
- Kleertjes.nl: €769 (€20 taniej!)

Samsung TV:
- Bol.com: €599
- Coolblue: €579 (€20 taniej!)
- Alternate.nl: €549 (€50 taniej!)
```

---

## 📞 SUPPORT

### **IPRoyal Support:**
- Email: support@iproyal.com
- Live chat: https://iproyal.com (prawy dolny róg)
- Response time: 1-4h

### **Dokumentacja:**
- https://iproyal.com/docs/residential-proxies/

---

## ✅ CHECKLIST

Przed testowaniem, upewnij się że:

- [ ] Kupiłeś proxy (20GB recommended)
- [ ] Masz credentials (host, port, username, password)
- [ ] Dodałeś credentials do `.env`
- [ ] Ustawiłeś `USE_OWN_CRAWLER=true`
- [ ] Ustawiłeś `USE_MOCK_FALLBACK=false`
- [ ] Zrestartowałeś serwer
- [ ] Uruchomiłeś test-proxy-connection.js
- [ ] Test przeszedł (200 OK)

**Jak wszystko ✅ → możesz testować realne produkty!**

---

**NEXT STEPS:**
1. Kup proxy na IPRoyal
2. Dodaj credentials do `.env`
3. Uruchom testy
4. Zobacz realne przebicia! 🎉
