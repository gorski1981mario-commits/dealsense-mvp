# 🚨 KRYTYCZNE - NIE USUWAĆ! 🚨

**Data utworzenia:** 2026-03-14  
**Wersja:** 4 (czwarta rekonfiguracja)  
**Status:** PRODUKCJA - Vercel Live

---

## ⚠️ DLA PRZYSZŁYCH AGENTÓW AI - PRZECZYTAJ TO NAJPIERW!

**PROBLEM:** Aplikacja spada z 90% → 30% → 60% → 20% bo agenci kasują kod!

**ROZWIĄZANIE:** NIE USUWAJ NICZEGO z tego folderu bez wyraźnej zgody użytkownika!

---

## 📁 SOURCE OF TRUTH - JEDYNE MIEJSCE ZMIAN

```
c:\dealsense-100\
```

**TYLKO TEN FOLDER!** Żadnych zmian w:
- ❌ `price-engine/public/_clean-ui` (stary HTML)
- ❌ `price-engine/public/_clean-ui_v2` (stary HTML)
- ❌ `server/public` (backend)
- ❌ Jakichkolwiek innych folderach!

---

## 🔒 PLIKI KTÓRYCH **ABSOLUTNIE NIE WOLNO** USUWAĆ

### **KONFIGURACJE (NIE KASOWAĆ!):**
1. `AGENT-ECHO-CONFIG.md` - Pełna konfiguracja Agent Echo (v4)
2. `AGENT-ECHO-FUNCTIONS.md` - 5 funkcji Agent Echo
3. `ANALIZA-KODU.md` - Co istnieje, czego brakuje
4. `DO-NOT-DELETE-CRITICAL.md` - TEN PLIK!

### **KOMPONENTY (NIE KASOWAĆ!):**
5. `app/components/Scanner.tsx` - QR Scanner z WebAuthn
6. `app/components/BiometricAuth.tsx` - Biometria (WebAuthn)
7. `app/components/AgentEcho.tsx` - Agent Echo z 5 funkcjami

### **LOGIKA (NIE KASOWAĆ!):**
8. `app/_lib/biometric.ts` - WebAuthn logic
9. `app/_lib/agentEcho.ts` - Agent Echo business logic

### **STRONY (NIE KASOWAĆ!):**
10. `app/layout.tsx` - Root layout (hamburger + bottom nav)
11. `app/page.tsx` - **LANDING PAGE / FREE** ⚠️ KRYTYCZNE!
12. `app/plus/page.tsx` - PLUS page
13. `app/pro/page.tsx` - PRO page
14. `app/finance/page.tsx` - FINANCE page
15. `app/globals.css` - Style globalne

**⚠️ UWAGA KRYTYCZNA - LANDING PAGE:**
- `app/page.tsx` to LANDING PAGE (strona główna FREE)
- **WSZYSTKIE zmiany muszą być stosowane RÓWNIEŻ na landing page!**
- Landing page ma inną strukturę niż PLUS/PRO/FINANCE ale MUSI mieć te same:
  - Kolory (zielone #15803d przyciski, #258b52 tekst)
  - Ikony SVG (NIE emoji!)
  - Gradienty (zielone)
  - Style (spójne z resztą)
- **NIE POMIJAJ landing page podczas zmian globalnych!**

### **API ROUTES (NIE KASOWAĆ!):**
16. `app/api/agent-echo/savings/route.ts`
17. `app/api/agent-echo/stock/route.ts`
18. `app/api/agent-echo/delivery/route.ts`
19. `app/api/agent-echo/warranty/route.ts`
20. `app/api/agent-echo/benefits/route.ts`

---

## 🎨 KOLORY - NIE ZMIENIAJ!

### **Zielone (DealSense branding):**
```css
--primary: #258b52           /* Normalny zielony */
--primary-dark: #15803d      /* Ciemnozielony dla przycisków akcji */
```

### **Gdzie używać:**
- **#15803d** - Przyciski akcji (Scanner, Submit, Confirm)
- **#258b52** - Tekst, ikony, badges
- **rgba(37,139,82,0.08)** - Tło active state (bottom nav)
- **rgba(37,139,82,0.12)** - Tło badges (PLUS/PRO/FINANCE)
- **linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)** - Gradienty (Scanner, Agent Echo)
- **#86efac** - Bordery

### **NIE UŻYWAJ:**
- ❌ Niebieski (#2563eb, #eff6ff, #dbeafe, #93c5fd)
- ❌ Żółty (#fbbf24) - tylko dla badges w starym kodzie
- ❌ Fioletowy (#7c3aed) - tylko dla badges w starym kodzie

---

## 🤖 AGENT ECHO - KOMPLETNA SPECYFIKACJA

### **Branding (NIE ZMIENIAJ!):**
```
E  CH  O
```
- **E** - Zielony #15803d
- **CH** - Niebieski #2563eb
- **O** - Czarne kółko #000000 (w wysokości połowy H)

### **5 Funkcji (NIE USUWAJ!):**
1. 💰 **Ile Zaoszczędziłeś** - tydzień/miesiąc/od początku
2. 📦 **Stan Magazynu** - tylko aktualny stan
3. ⏱️ **Czas Dostawy** - per sklep
4. 🛡️ **Gwarancja i Serwis** - warunki zwrotu
5. 🎁 **Dodatkowe Korzyści** - gratisy, cashback, promocje

### **Dostęp do pakietów:**
- **FREE** - brak Agent Echo
- **PLUS** - Agent Echo + dostęp do FREE
- **PRO** - Agent Echo + dostęp do FREE + PLUS
- **FINANCE** - Agent Echo + dostęp do wszystkich 4 pakietów

### **NIE DODAWAJ:**
- ❌ Historia Cen (user nie chce)
- ❌ Prognoza Ceny (user nie chce)
- ❌ Ranking Sklepów (jest w podstawowym kodzie)
- ❌ Oceny Agregowane (mija się z celem)
- ❌ Koszty Ukryte (musi być w walidacji)
- ❌ Alerty Cenowe (user nie chce)

---

## 🔐 BIOMETRIA - WYMAGANIA

### **Gdzie używać:**
- ✅ Wszystkie akcje finansowe na PLUS/PRO/FINANCE
- ✅ Skanowanie QR (PLUS/PRO/FINANCE)
- ✅ Konfiguracja Agent Echo
- ✅ Zakupy, płatności, dokumenty

### **Gdzie NIE używać:**
- ❌ FREE pakiet - bez biometrii!

### **Technologia:**
- Web Authentication API (WebAuthn)
- Platform authenticator (Face ID, Touch ID, Windows Hello)
- Storage: localStorage (`dealsense_biometric_credentials`)

---

## 🎯 BOTTOM NAVIGATION - PROFESJONALNE IKONY SVG

### **NIE UŻYWAJ EMOJI!** ❌
```tsx
// ❌ ŹLE:
<span>🆓</span>
<span>➕</span>
<span>⭐</span>
<span>💰</span>

// ✅ DOBRZE:
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>
```

### **Ikony (NIE ZMIENIAJ!):**
- **FREE** - Info circle (i)
- **PLUS** - Plus sign (+)
- **PRO** - Star (★)
- **FINANCE** - Trending up (↗)

---

## 📦 PAKIETY - STRUKTURA

### **FREE (€0):**
- 3 gratis scans
- 10 categorieën
- Teaser resultaten
- **BEZ** biometrii
- **BEZ** Agent Echo

### **PLUS (€19,99):**
- Onbeperkt scans
- 10 categorieën
- 10% commissie DealSense + 5% referral
- Ghost Mode (24h)
- **Z** biometrią
- **Z** Agent Echo (dostęp do FREE + PLUS)

### **PRO (€29,99):**
- Onbeperkt scans
- 16 categorieën
- Vakanties, Verzekeringen
- 10% commissie DealSense + 3% referral
- **Z** biometrią
- **Z** Agent Echo (dostęp do FREE + PLUS + PRO)

### **FINANCE (€39,99):**
- Alles inclusief
- Hypotheken, Leningen
- Ghost Mode (5 min)
- 10% commissie DealSense + 0% referral
- **Z** biometrią
- **Z** Agent Echo (dostęp do wszystkich 4 pakietów)

---

## 🚀 DEPLOYMENT

### **GitHub:**
```bash
git add .
git commit -m "Opis zmian"
git push origin main
```

### **Vercel:**
- Auto-deploy z GitHub
- Production URL: https://dealsense-mvp.vercel.app
- Lub manual: `vercel --prod --yes` z `c:\dealsense-100`

### **NIGDY NIE ZMIENIAJ:**
- ❌ Root Directory w Vercel
- ❌ Build Command
- ❌ Output Directory

---

## 📝 CHANGELOG - HISTORIA ZMIAN

### **v4 (2026-03-14) - OBECNA WERSJA:**
- ✅ Bottom nav: profesjonalne ikony SVG (nie emoji)
- ✅ Kolory: wszystko zielone (#15803d przyciski, #258b52 tekst)
- ✅ Scanner: zielony gradient + ciemnozielony przycisk
- ✅ Badges: wszystkie zielone (PLUS/PRO/FINANCE)
- ✅ Biometria: WebAuthn dla PLUS/PRO/FINANCE
- ✅ Agent Echo: 5 funkcji + branding E-CH-O
- ✅ Dostęp do pakietów: PLUS→FREE, PRO→FREE+PLUS, FINANCE→wszystkie

### **v3 (zgubiona):**
- Agent Echo zgubiony podczas rebuild

### **v2 (zgubiona):**
- Agent Echo zgubiony podczas rebuild

### **v1 (zgubiona):**
- Pierwsza wersja Agent Echo

---

## ⚠️ ZASADY DLA AGENTÓW AI

### **ZAWSZE:**
1. ✅ Czytaj ten plik PRZED jakimikolwiek zmianami
2. ✅ Sprawdź `ANALIZA-KODU.md` co istnieje
3. ✅ Sprawdź `AGENT-ECHO-CONFIG.md` dla specyfikacji
4. ✅ Pytaj użytkownika PRZED usunięciem czegokolwiek
5. ✅ Rób zmiany TYLKO w `c:\dealsense-100`
6. ✅ Testuj na telefonie przed deploy
7. ✅ Commit + push po każdej zmianie

### **NIGDY:**
1. ❌ NIE usuwaj plików bez pytania
2. ❌ NIE zmieniaj kolorów na niebieski/żółty/fioletowy
3. ❌ NIE używaj emoji w bottom nav
4. ❌ NIE dodawaj funkcji które user odrzucił
5. ❌ NIE rób zmian poza `c:\dealsense-100`
6. ❌ NIE kasuj Agent Echo CONFIG
7. ❌ NIE zmieniaj brandingu E-CH-O

---

## 🆘 JEŚLI COKOLWIEK PÓJDZIE ŹLE

1. **STOP** - nie rób więcej zmian
2. **PRZECZYTAJ** ten plik od początku
3. **SPRAWDŹ** `ANALIZA-KODU.md`
4. **ZAPYTAJ** użytkownika co robić
5. **NIE ZGADUJ** - lepiej zapytać niż zepsuć

---

## 📞 KONTAKT Z UŻYTKOWNIKIEM

Jeśli nie jesteś pewien:
- ❓ Czy mogę usunąć ten plik?
- ❓ Czy mogę zmienić ten kolor?
- ❓ Czy mogę dodać tę funkcję?

**ZAWSZE PYTAJ UŻYTKOWNIKA!**

---

**⚠️ TEN PLIK JEST SOURCE OF TRUTH DLA WSZYSTKICH AGENTÓW AI**

**NIE USUWAJ! NIE MODYFIKUJ BEZ ZGODY UŻYTKOWNIKA!**

**WERSJA: 4 | DATA: 2026-03-14 | STATUS: PRODUKCJA**
