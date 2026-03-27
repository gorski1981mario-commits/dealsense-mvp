# ⚠️ SEARCHAPI KEY - WYMAGANY DO TESTÓW

## PROBLEM:

Test zwrócił **401 Unauthorized** - brak poprawnego API key.

```
[SearchAPI] Google Shopping error: Request failed with status code 401
[SearchAPI] Tweakers error: Request failed with status code 401
[SearchAPI] Reddit NL error: Request failed with status code 401
```

---

## CO TRZEBA ZROBIĆ:

### 1. Uzyskać SearchAPI.io API Key

**Opcja A: Masz już key**
- Sprawdź w dashboard SearchAPI.io
- Skopiuj key

**Opcja B: Nie masz key**
- Zarejestruj się: https://www.searchapi.io
- Free plan: 100 requests/month
- Developer plan: €50/month (2000 requests)

---

### 2. Dodać key do środowiska

**Utwórz plik `.env` w głównym folderze:**

```bash
# c:\DEALSENSE AI\.env

GOOGLE_SHOPPING_API_KEY=your_searchapi_key_here
```

**LUB ustaw zmienną środowiskową (Windows PowerShell):**

```powershell
$env:GOOGLE_SHOPPING_API_KEY="your_searchapi_key_here"
```

---

### 3. Uruchomić test ponownie

```bash
cd "c:\DEALSENSE AI"
node server/reviews/test-3-products.js
```

---

## CO POWINNO DZIAŁAĆ (gdy key jest OK):

### Test 1: iPhone 15 Pro
```
📦 GOOGLE SHOPPING REVIEWS: 15-20
   Przykłady:
   1. [5/5] Great phone, fast delivery...
   2. [4/5] Battery life is amazing...

🔍 GOOGLE SEARCH SNIPPETS: 8-12
   Źródła:
   - Tweakers: 3 snippets
   - Reddit NL: 4 snippets
   - Trustpilot: 2 snippets

📊 AGREGACJA DLA AI: 25-30 items
   Wystarczy do AI? ✅ TAK
```

### Test 2: Samsung Galaxy S24
```
📦 GOOGLE SHOPPING REVIEWS: 10-15
🔍 GOOGLE SEARCH SNIPPETS: 6-10
📊 AGREGACJA DLA AI: 20-25 items
   Wystarczy do AI? ✅ TAK
```

### Test 3: Bosch Pralka
```
📦 GOOGLE SHOPPING REVIEWS: 8-12
🔍 GOOGLE SEARCH SNIPPETS: 5-8
📊 AGREGACJA DLA AI: 15-20 items
   Wystarczy do AI? ✅ TAK
```

---

## KOSZTY SearchAPI:

| Plan | Requests/month | Koszt |
|------|----------------|-------|
| Free | 100 | €0 |
| Developer | 2,000 | €50 |
| Startup | 10,000 | €200 |
| Business | 50,000 | €800 |

**Dla testów:** Free plan wystarczy (100 requests)
**Dla produkcji:** Developer plan (€50/mies, 2000 requests)

---

## STATUS:

- ✅ Kod gotowy (`searchapi-reviews.js`)
- ✅ Test script gotowy (`test-3-products.js`)
- ❌ **Brak API KEY** - nie można testować
- ⏳ Czekam na API key od usera

---

## NEXT STEPS:

1. User dodaje SearchAPI key do `.env`
2. Uruchamiamy test ponownie
3. Sprawdzamy co faktycznie zwraca
4. Jeśli OK → integrujemy z AI analyzer
5. Deploy

**Bez API key nie możemy testować SearchAPI.** 🔑
