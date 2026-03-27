/**
 * FEATURE FLAGS - TESTING & DEVELOPMENT
 * 
 * ⚠️ WAŻNE DLA WSZYSTKICH AGENTÓW ⚠️
 * 
 * Te flagi kontrolują dostęp do funkcji podczas testowania.
 * Zmień wartości tutaj aby włączyć/wyłączyć funkcje.
 * 
 * LOKALIZACJA: app/_lib/feature-flags.ts
 */

export const FEATURE_FLAGS = {
  /**
   * PAYWALL_ENABLED
   * 
   * Kontroluje czy paywall jest aktywny dla konfiguratorów.
   * 
   * false = WYŁĄCZONY (dla testowania) - wszyscy mają dostęp
   * true = WŁĄCZONY (produkcja) - tylko płacący użytkownicy
   * 
   * ZMIEŃ NA: false - aby testować bez ograniczeń
   * ZMIEŃ NA: true - przed wdrożeniem na produkcję
   */
  PAYWALL_ENABLED: false,  // 🔧 TESTING MODE - paywall wyłączony (wszystkie konfiguratory dostępne)

  /**
   * SHOW_LOCKED_FEATURES
   * 
   * Kontroluje czy pokazywać zablokowane funkcje (szare karty z kłódką)
   * 
   * true = Pokaż zablokowane karty (użytkownik widzi co jest niedostępne)
   * false = Ukryj zablokowane karty (użytkownik widzi tylko dostępne)
   */
  SHOW_LOCKED_FEATURES: true,

  /**
   * DEBUG_MODE
   * 
   * Pokazuje informacje debugowania w konsoli
   */
  DEBUG_MODE: true,  // 🔧 TESTING MODE - logi włączone

  /**
   * PRO_ENABLED
   * 
   * Kontroluje czy pakiet PRO jest widoczny i dostępny
   * 
   * false = WYŁĄCZONY - brak API dla konfiguratorów
   * true = WŁĄCZONY - gdy dostaniemy więcej API
   */
  PRO_ENABLED: false,  // 🚫 PRO ODPIĘTE - brak API (tylko SearchAPI.io)

  /**
   * FINANCE_ENABLED
   * 
   * Kontroluje czy pakiet FINANCE jest widoczny i dostępny
   * 
   * false = WYŁĄCZONY - brak API dla konfiguratorów
   * true = WŁĄCZONY - gdy dostaniemy więcej API
   */
  FINANCE_ENABLED: false,  // 🚫 FINANCE ODPIĘTE - brak API (tylko SearchAPI.io)

  /**
   * ZAKELIJK_ENABLED
   * 
   * Kontroluje czy pakiet ZAKELIJK B2B jest widoczny i dostępny
   * 
   * false = WYŁĄCZONY (do dopracowania) - pakiet całkowicie ukryty A-Z
   * true = WŁĄCZONY (gdy gotowy) - pakiet widoczny w UI
   * 
   * ⚠️ ZAKELIJK to pakiet B2B za €59.99/mnd
   * Ukrywamy go całkowicie dopóki nie będzie dopracowany
   * Może być najważniejszy pakiet (gigantyczne przebicia w przemyśle!)
   */
  ZAKELIJK_ENABLED: false  // 🚫 ZAKELIJK OFLAGOWANY - do dopracowania później
}

/**
 * Helper function - sprawdza czy użytkownik ma dostęp
 * Uwzględnia flagę PAYWALL_ENABLED
 */
export function checkAccess(userHasAccess: boolean): boolean {
  if (!FEATURE_FLAGS.PAYWALL_ENABLED) {
    // Paywall wyłączony - wszyscy mają dostęp
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log('🔧 PAYWALL DISABLED - Access granted for testing')
    }
    return true
  }
  
  // Paywall włączony - sprawdź rzeczywisty dostęp
  return userHasAccess
}

/**
 * INSTRUKCJE DLA AGENTÓW:
 * 
 * 1. TESTOWANIE (paywall wyłączony):
 *    - Ustaw PAYWALL_ENABLED = false
 *    - Wszyscy użytkownicy mają pełny dostęp
 *    - Możesz testować wszystkie funkcje
 * 
 * 2. PRODUKCJA (paywall włączony):
 *    - Ustaw PAYWALL_ENABLED = true
 *    - Tylko płacący użytkownicy mają dostęp
 *    - FREE/PLUS widzą PaywallMessage
 * 
 * 3. GDZIE UŻYWANE:
 *    - app/pro/page.tsx (PRO configurators)
 *    - app/finance/page.tsx (FINANCE configurators)
 *    - app/vaste-lasten/page.tsx (all configurators)
 *    - app/components/configurators/ConfiguratorGuard.tsx
 */

