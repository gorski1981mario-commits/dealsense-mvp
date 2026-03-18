# 🚩 FEATURE FLAGS - INSTRUKCJE DLA AGENTÓW

## 📍 LOKALIZACJA
```
app/_lib/feature-flags.ts
```

## 🎯 GŁÓWNA FLAGA: PAYWALL_ENABLED

### TESTOWANIE (paywall wyłączony)
```typescript
PAYWALL_ENABLED: false  // ✅ OBECNY STAN
```
- Wszyscy użytkownicy mają pełny dostęp
- Można testować wszystkie funkcje bez ograniczeń
- FREE user może używać PRO/FINANCE features

### PRODUKCJA (paywall włączony)
```typescript
PAYWALL_ENABLED: true
```
- Tylko płacący użytkownicy mają dostęp
- FREE/PLUS widzą zablokowane karty
- Paywall chroni PRO/FINANCE features

## 📂 GDZIE UŻYWANE

1. **`app/pro/page.tsx`**
   - Kontroluje dostęp do 4 PRO konfiguratorów
   
2. **`app/finance/page.tsx`**
   - Kontroluje dostęp do 8 FINANCE konfiguratorów

3. **`app/components/configurators/ConfiguratorGuard.tsx`**
   - Chroni pojedyncze strony konfiguratorów

## 🔧 JAK ZMIENIĆ

### Krok 1: Otwórz plik
```bash
app/_lib/feature-flags.ts
```

### Krok 2: Zmień wartość
```typescript
export const FEATURE_FLAGS = {
  PAYWALL_ENABLED: false,  // false = testing, true = production
  // ...
}
```

### Krok 3: Zapisz i przetestuj
- Odśwież stronę
- Sprawdź konsolę (powinno być: "🔧 PAYWALL DISABLED - Access granted for testing")

## ⚠️ PRZED WDROŻENIEM NA PRODUKCJĘ

**KRYTYCZNE:** Zmień flagę na `true` przed deploymentem!

```typescript
PAYWALL_ENABLED: true  // ✅ PRODUKCJA
```

## 🐛 DEBUG MODE

```typescript
DEBUG_MODE: true  // Pokazuje logi w konsoli
```

Logi w konsoli:
- `🔧 PAYWALL DISABLED - Access granted for testing` - paywall wyłączony
- Informacje o dostępie użytkownika

## 📊 INNE FLAGI

### SHOW_LOCKED_FEATURES
```typescript
SHOW_LOCKED_FEATURES: true
```
- `true` = Pokaż szare karty z kłódką (użytkownik widzi co jest niedostępne)
- `false` = Ukryj zablokowane karty całkowicie

## ✅ CHECKLIST PRZED COMMITEM

- [ ] Sprawdź czy `PAYWALL_ENABLED` jest ustawione prawidłowo
- [ ] Dla testowania: `false`
- [ ] Dla produkcji: `true`
- [ ] Dodaj komentarz w commit message o stanie flagi

## 🎓 PRZYKŁADY UŻYCIA

### Scenariusz 1: Testowanie nowych konfiguratorów
```typescript
PAYWALL_ENABLED: false  // Wyłącz paywall
DEBUG_MODE: true        // Włącz logi
```

### Scenariusz 2: Testowanie paywall flow
```typescript
PAYWALL_ENABLED: true   // Włącz paywall
DEBUG_MODE: true        // Włącz logi
SHOW_LOCKED_FEATURES: true  // Pokaż zablokowane karty
```

### Scenariusz 3: Produkcja
```typescript
PAYWALL_ENABLED: true   // Włącz paywall
DEBUG_MODE: false       // Wyłącz logi
SHOW_LOCKED_FEATURES: true  // Pokaż co jest premium
```

---

**WAŻNE:** Ta dokumentacja jest dla wszystkich agentów pracujących nad projektem!
