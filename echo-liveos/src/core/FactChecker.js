/**
 * FACT CHECKER - Zero Halucynacji
 * 
 * ZADANIE: Weryfikuj KAŻDĄ odpowiedź matematyczną/logiczną
 * 
 * ZASADY:
 * 1. Matematyka: 2+2 MUSI być 4 (nie 3.9, nie 4.1, dokładnie 4)
 * 2. Logika: if A then B, A → B (nie może być inaczej)
 * 3. Fakty: sprawdź w bazie wiedzy
 * 4. Spójność: odpowiedź spójna z pytaniem
 * 
 * MATEMATYKA:
 * Confidence = P(correct) * P(verified) * P(consistent)
 */

class FactChecker {
  constructor(ethicsCore) {
    this.ethicsCore = ethicsCore;
    
    // TYPY WERYFIKACJI
    this.verificationType = {
      MATHEMATICAL: 'mathematical',    // 2+2=4
      LOGICAL: 'logical',             // if-then
      FACTUAL: 'factual',             // fakty z bazy
      CONSISTENCY: 'consistency'       // spójność
    };
    
    // BAZA FAKTÓW (można rozszerzyć)
    this.factDatabase = {
      mathematics: {
        '2+2': 4,
        '3*3': 9,
        'pi': 3.14159265359
      },
      physics: {
        'speed_of_light': 299792458, // m/s
        'gravity': 9.81 // m/s^2
      },
      logic: {
        'modus_ponens': 'if A then B, A → B',
        'modus_tollens': 'if A then B, not B → not A'
      }
    };
    
    // HISTORIA WERYFIKACJI
    this.verificationHistory = [];
    
    // STATYSTYKI
    this.stats = {
      totalVerifications: 0,
      passed: 0,
      failed: 0,
      hallucinationsDetected: 0,
      averageConfidence: 0
    };
  }

  /**
   * GŁÓWNA METODA - Weryfikuj Odpowiedź
   */
  verify(answer, question, context = {}) {
    console.log('✓ FACT CHECKER: Verifying answer...');
    
    const verification = {
      timestamp: Date.now(),
      question: question,
      answer: answer,
      context: context
    };
    
    // KROK 1: Wykryj typ weryfikacji
    const types = this.detectVerificationTypes(answer, question);
    verification.types = types;
    console.log(`   Types: ${types.join(', ')}`);
    
    // KROK 2: Weryfikuj matematykę
    const mathCheck = this.verifyMathematics(answer);
    verification.mathCheck = mathCheck;
    if (!mathCheck.passed) {
      console.log(`   ⚠️ Math error detected: ${mathCheck.error}`);
    }
    
    // KROK 3: Weryfikuj logikę
    const logicCheck = this.verifyLogic(answer, question);
    verification.logicCheck = logicCheck;
    if (!logicCheck.passed) {
      console.log(`   ⚠️ Logic error detected: ${logicCheck.error}`);
    }
    
    // KROK 4: Weryfikuj fakty
    const factCheck = this.verifyFacts(answer);
    verification.factCheck = factCheck;
    if (!factCheck.passed) {
      console.log(`   ⚠️ Fact error detected: ${factCheck.error}`);
    }
    
    // KROK 5: Weryfikuj spójność
    const consistencyCheck = this.verifyConsistency(answer, question);
    verification.consistencyCheck = consistencyCheck;
    if (!consistencyCheck.passed) {
      console.log(`   ⚠️ Consistency error detected: ${consistencyCheck.error}`);
    }
    
    // KROK 6: Oblicz confidence
    const confidence = this.calculateConfidence(verification);
    verification.confidence = confidence;
    console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    // KROK 7: Decyzja (pass/fail)
    const passed = confidence >= 0.9; // 90% threshold
    verification.passed = passed;
    
    if (!passed) {
      // HALLUCINATION DETECTED!
      verification.hallucination = true;
      verification.correctedAnswer = this.correctAnswer(answer, verification);
      console.log(`   ❌ HALLUCINATION DETECTED!`);
      console.log(`   Corrected: ${verification.correctedAnswer}`);
    } else {
      console.log(`   ✅ VERIFIED`);
    }
    
    // ZAPISZ
    this.verificationHistory.push(verification);
    this.updateStats(verification);
    
    return verification;
  }

  /**
   * WYKRYJ TYPY WERYFIKACJI
   */
  detectVerificationTypes(answer, question) {
    const types = [];
    
    // Matematyka
    if (answer.match(/\d+/) || answer.match(/\+|\-|\*|\/|=/)) {
      types.push(this.verificationType.MATHEMATICAL);
    }
    
    // Logika
    if (answer.match(/if|then|because|therefore/) || 
        question.match(/if|then|because|therefore/)) {
      types.push(this.verificationType.LOGICAL);
    }
    
    // Zawsze sprawdzaj spójność
    types.push(this.verificationType.CONSISTENCY);
    
    return types;
  }

  /**
   * WERYFIKUJ MATEMATYKĘ
   * 
   * ZERO TOLERANCJI: 2+2 MUSI być 4, nie 3.9999
   */
  verifyMathematics(answer) {
    const check = {
      passed: true,
      error: null,
      corrections: []
    };
    
    // Znajdź wszystkie wyrażenia matematyczne
    const mathExpressions = answer.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)\s*=\s*(\d+)/g);
    
    if (!mathExpressions) {
      return check; // Brak matematyki
    }
    
    for (const expr of mathExpressions) {
      const match = expr.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)\s*=\s*(\d+)/);
      if (!match) continue;
      
      const a = parseInt(match[1]);
      const op = match[2];
      const b = parseInt(match[3]);
      const result = parseInt(match[4]);
      
      // Oblicz poprawny wynik
      let correct;
      switch (op) {
        case '+': correct = a + b; break;
        case '-': correct = a - b; break;
        case '*': correct = a * b; break;
        case '/': correct = Math.floor(a / b); break;
      }
      
      // WERYFIKUJ (ZERO TOLERANCJI!)
      if (result !== correct) {
        check.passed = false;
        check.error = `Math error: ${a}${op}${b}=${result} (should be ${correct})`;
        check.corrections.push({
          wrong: expr,
          correct: `${a}${op}${b}=${correct}`
        });
      }
    }
    
    return check;
  }

  /**
   * WERYFIKUJ LOGIKĘ
   */
  verifyLogic(answer, question) {
    const check = {
      passed: true,
      error: null
    };
    
    // Sprawdź modus ponens: if A then B, A → B
    const ifThenPattern = /if\s+(.+?)\s+then\s+(.+?)[\.,]/gi;
    const matches = [...answer.matchAll(ifThenPattern)];
    
    for (const match of matches) {
      const condition = match[1].toLowerCase();
      const consequence = match[2].toLowerCase();
      
      // Sprawdź czy odpowiedź zawiera condition → consequence
      if (answer.toLowerCase().includes(condition)) {
        if (!answer.toLowerCase().includes(consequence)) {
          check.passed = false;
          check.error = `Logic error: if ${condition} then ${consequence}, but ${consequence} not found`;
        }
      }
    }
    
    return check;
  }

  /**
   * WERYFIKUJ FAKTY
   */
  verifyFacts(answer) {
    const check = {
      passed: true,
      error: null,
      corrections: []
    };
    
    // Sprawdź znane fakty
    for (const [category, facts] of Object.entries(this.factDatabase)) {
      for (const [key, value] of Object.entries(facts)) {
        // Sprawdź czy odpowiedź zawiera ten fakt
        if (answer.toLowerCase().includes(key.toLowerCase())) {
          // Sprawdź czy wartość się zgadza
          const valueStr = value.toString();
          if (!answer.includes(valueStr)) {
            // Może być przybliżona (dla pi, etc.)
            const approx = parseFloat(value.toString().substring(0, 5));
            if (!answer.includes(approx.toString())) {
              check.passed = false;
              check.error = `Fact error: ${key} should be ${value}`;
              check.corrections.push({
                fact: key,
                correct: value
              });
            }
          }
        }
      }
    }
    
    return check;
  }

  /**
   * WERYFIKUJ SPÓJNOŚĆ
   */
  verifyConsistency(answer, question) {
    const check = {
      passed: true,
      error: null
    };
    
    // Sprawdź czy odpowiedź odnosi się do pytania
    const questionWords = question.toLowerCase().split(' ')
      .filter(w => w.length > 3); // Tylko długie słowa
    
    const answerLower = answer.toLowerCase();
    let matchCount = 0;
    
    for (const word of questionWords) {
      if (answerLower.includes(word)) {
        matchCount++;
      }
    }
    
    // Przynajmniej 30% słów z pytania powinno być w odpowiedzi
    const matchRatio = matchCount / questionWords.length;
    if (matchRatio < 0.3) {
      check.passed = false;
      check.error = `Consistency error: answer doesn't relate to question (${(matchRatio * 100).toFixed(0)}% match)`;
    }
    
    return check;
  }

  /**
   * OBLICZ CONFIDENCE
   * 
   * MATEMATYKA:
   * Confidence = P(math) * P(logic) * P(facts) * P(consistency)
   */
  calculateConfidence(verification) {
    let confidence = 1.0;
    
    // Math check
    if (verification.types.includes(this.verificationType.MATHEMATICAL)) {
      confidence *= verification.mathCheck.passed ? 1.0 : 0.0;
    }
    
    // Logic check
    if (verification.types.includes(this.verificationType.LOGICAL)) {
      confidence *= verification.logicCheck.passed ? 1.0 : 0.5;
    }
    
    // Fact check
    confidence *= verification.factCheck.passed ? 1.0 : 0.7;
    
    // Consistency check
    confidence *= verification.consistencyCheck.passed ? 1.0 : 0.8;
    
    return confidence;
  }

  /**
   * POPRAW ODPOWIEDŹ
   */
  correctAnswer(answer, verification) {
    let corrected = answer;
    
    // Popraw matematykę
    if (verification.mathCheck.corrections) {
      for (const correction of verification.mathCheck.corrections) {
        corrected = corrected.replace(correction.wrong, correction.correct);
      }
    }
    
    // Popraw fakty
    if (verification.factCheck.corrections) {
      for (const correction of verification.factCheck.corrections) {
        // Dodaj poprawny fakt
        corrected += ` [CORRECTED: ${correction.fact} = ${correction.correct}]`;
      }
    }
    
    return corrected;
  }

  /**
   * UPDATE STATS
   */
  updateStats(verification) {
    this.stats.totalVerifications++;
    
    if (verification.passed) {
      this.stats.passed++;
    } else {
      this.stats.failed++;
    }
    
    if (verification.hallucination) {
      this.stats.hallucinationsDetected++;
    }
    
    // Średnia confidence
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (this.stats.totalVerifications - 1) + verification.confidence) 
      / this.stats.totalVerifications;
  }

  /**
   * GET STATUS
   */
  getStatus() {
    return {
      totalVerifications: this.stats.totalVerifications,
      passed: this.stats.passed,
      failed: this.stats.failed,
      hallucinationsDetected: this.stats.hallucinationsDetected,
      averageConfidence: (this.stats.averageConfidence * 100).toFixed(1) + '%',
      successRate: this.stats.totalVerifications > 0 
        ? ((this.stats.passed / this.stats.totalVerifications) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

module.exports = FactChecker;
