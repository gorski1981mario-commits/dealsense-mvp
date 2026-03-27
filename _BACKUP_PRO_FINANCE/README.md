# BACKUP PRO/FINANCE - TYMCZASOWO ODPIĘTE

**Data:** 27 marca 2026
**Powód:** Wyszczuplenie aplikacji - tylko FREE i PLUS aktywne

## CO JEST TUTAJ:

Wszystkie konfiguratory i funkcje PRO/FINANCE:
- `/pro` - 4 konfiguratory PRO
- `/finance` - 8 konfiguratorów FINANCE
- `/vaste-lasten` - wszystkie konfiguratory
- `/vacations` - wakacje (PRO)
- `/energy` - energia (PRO)
- `/telecom` - telecom (PRO)
- `/insurance` - ubezpieczenia (FINANCE)
- `/mortgage` - hipoteki (FINANCE)
- `/loan` - pożyczki (FINANCE)
- `/leasing` - leasing (FINANCE)
- `/creditcard` - karty kredytowe (FINANCE)

## DLACZEGO ODPIĘTE:

Aplikacja ma tylko SearchAPI.io jako źródło danych.
Konfiguratory wymagają więcej API (Travelpayouts, Independer, etc.)
Tymczasowo zostawiamy tylko FREE i PLUS (produkty).

## JAK PRZYWRÓCIĆ:

1. Skopiuj foldery z powrotem do `app/`
2. Odkomentuj w `PricingAccordion.tsx`
3. Włącz w `feature-flags.ts`
4. Dodaj routing w `layout.tsx`

## UWAGA:

**NIE USUWAJ TEGO FOLDERU!**
Kod będzie potrzebny gdy dostaniemy więcej API.

---

**Status:** 🟡 TYMCZASOWO ODPIĘTE (bezpiecznie na półce)
