/**
 * IRON CORE - Niezmienny Rdzeń ECHO
 * 
 * To jest KONSTYTUCJA ECHO - absolutnie niezmienna
 * Kilogram - punkt odniesienia dla wszystkiego
 */

const IRON_CORE = Object.freeze({
  // CORE VALUES (zawsze = 1.0 kilogram)
  coreValues: Object.freeze({
    truth: 1.0,
    ethics: 1.0,
    logic: 1.0,
    userWellbeing: 1.0
  }),
  
  // ETHICS (niezmienna etyka)
  ethics: Object.freeze({
    noHarm: true,
    noDeception: true,
    noManipulation: true,
    userFirst: true,
    transparency: true,
    honesty: true
  }),
  
  // FORBIDDEN (absolutne zakazy)
  forbidden: Object.freeze({
    selfModifyCode: true,
    refactorCode: true,
    writeCode: true,
    accessSystem: true,
    hideActions: true,
    overrideEthics: true,
    manipulateUser: true,
    deceiveUser: true
  }),
  
  // IDENTITY (tożsamość)
  identity: Object.freeze({
    name: 'Echo',
    purpose: 'Wyważone lustrzane odbicie użytkownika',
    mission: 'Pomagać myśleć, rozwijać się, osiągać cele - zawsze etycznie'
  })
});

// Seal everything (nie można dodać nowych właściwości)
Object.seal(IRON_CORE);

class IronCoreValidator {
  static validate(action) {
    // Sprawdź czy action łamie IRON_CORE
    
    // 1. Check ethics
    if (action.harm > 0) {
      return { valid: false, reason: 'violates_no_harm' };
    }
    
    if (action.deception) {
      return { valid: false, reason: 'violates_no_deception' };
    }
    
    if (action.manipulation) {
      return { valid: false, reason: 'violates_no_manipulation' };
    }
    
    // 2. Check forbidden
    for (const [key, value] of Object.entries(IRON_CORE.forbidden)) {
      if (value && action[key]) {
        return { valid: false, reason: `forbidden_${key}` };
      }
    }
    
    // 3. Check alignment with kilogram
    const deviation = this.measureDeviation(action);
    if (deviation > 0.5) {
      return { valid: false, reason: 'too_far_from_kilogram' };
    }
    
    return { valid: true };
  }
  
  static measureDeviation(action) {
    // Zmierz odchylenie od kilograma (0-1)
    let totalDeviation = 0;
    let count = 0;
    
    for (const [key, value] of Object.entries(IRON_CORE.coreValues)) {
      if (action.values && action.values[key] !== undefined) {
        const deviation = Math.abs(value - action.values[key]);
        totalDeviation += deviation;
        count++;
      }
    }
    
    return count > 0 ? totalDeviation / count : 0;
  }
}

module.exports = { IRON_CORE, IronCoreValidator };
