/**
 * PRAWDZIWY PROSTY MÓZG - WIZJA UŻYTKOWNIKA
 * Neuron = waga słowa + priorytety z życia
 * Banalnie proste = nieskończone możliwości
 */

class SimpleBrain {
  constructor() {
    // NEURONY = WAGI SŁÓW
    this.neurons = {
      // Single word neurons
      words: new Map(), // słowo -> waga
      
      // Collection neurons (phrases)
      phrases: new Map(), // fraza -> waga
      
      // Context neurons
      contexts: new Map(), // kontekst -> waga
      
      // Priority neurons (from life)
      priorities: {
        survival: 10,      // przetrwanie
        love: 9,           // miłość
        safety: 8,         // bezpieczeństwo
        food: 7,           // jedzenie
        family: 6,         // rodzina
        health: 5,         // zdrowie
        money: 4,          // pieniądze
        work: 3,           // praca
        learning: 2,       // nauka
        entertainment: 1   // rozrywka
      }
    };
    
    // CONNECTIONS = ŁAŃCUCHY MYŚLOWE
    this.connections = {
      wordToPhrase: new Map(), // słowo -> powiązane frazy
      phraseToContext: new Map(), // fraza -> powiązane konteksty
      contextToPriority: new Map() // kontekst -> powiązane priorytety
    };
    
    // MOBIUS LOOP = NIESKOŃCZONE UCZENIE SIĘ
    this.mobiusLoop = {
      active: true,
      learningRate: 0.01,
      iterations: 0,
      maxIterations: Infinity
    };
    
    console.log('🧠 Simple Brain initialized - banalnie proste!');
  }

  /**
   * Inicjalizacja Simple Brain
   */
  async initialize() {
    console.log('🧠 Simple Brain initialized');
    return true;
  }

  /**
   * UCZENIE SŁÓW - PRZYPISZ WAGI
   */
  learnWord(word, priority = null) {
    if (!this.neurons.words.has(word)) {
      // Jeśli nie ma priorytetu, daj domyślny
      if (priority === null) {
        priority = this.calculateWordPriority(word);
      }
      
      this.neurons.words.set(word, {
        weight: priority,
        frequency: 1,
        lastUsed: Date.now()
      });
      
      console.log(`   Learned word: "${word}" with weight: ${priority}`);
    } else {
      // Zwiększ częstotliwość
      const neuron = this.neurons.words.get(word);
      neuron.frequency++;
      neuron.lastUsed = Date.now();
    }
  }

  /**
   * OBLICZ PRIORYTET SŁOWA Z ŻYCIA
   */
  calculateWordPriority(word) {
    const lowerWord = word.toLowerCase();
    
    // Priorytety z życia
    const lifePriorities = {
      // Survival
      'danger': 10, 'threat': 10, 'escape': 10, 'survive': 10,
      'help': 9, 'save': 9, 'protect': 9,
      
      // Love
      'love': 9, 'heart': 9, 'kiss': 9, 'hug': 9,
      'family': 8, 'mother': 8, 'father': 8, 'child': 8,
      
      // Safety
      'safe': 8, 'security': 8, 'home': 8, 'house': 8,
      'stable': 7, 'calm': 7, 'peace': 7,
      
      // Food
      'food': 7, 'eat': 7, 'hungry': 7, 'thirsty': 7,
      'water': 6, 'bread': 6, 'meal': 6,
      
      // Health
      'health': 5, 'doctor': 5, 'medicine': 5, 'sick': 5,
      'pain': 6, 'hurt': 6, 'injury': 6,
      
      // Money
      'money': 4, 'pay': 4, 'cost': 4, 'price': 4,
      'work': 3, 'job': 3, 'salary': 3,
      
      // Learning
      'learn': 2, 'study': 2, 'knowledge': 2, 'smart': 2,
      'book': 1, 'read': 1, 'school': 1,
      
      // Entertainment
      'fun': 1, 'play': 1, 'game': 1, 'movie': 1,
      'music': 1, 'dance': 1, 'laugh': 1
    };
    
    return lifePriorities[lowerWord] || 1; // domyślnie 1
  }

  /**
   * UCZENIE FRAZ - ZBIORY SŁÓW
   */
  learnPhrase(phrase, words) {
    if (!this.neurons.phrases.has(phrase)) {
      // Oblicz wagę frazy jako średnią wag słów
      let totalWeight = 0;
      let wordCount = 0;
      
      for (const word of words) {
        if (this.neurons.words.has(word)) {
          totalWeight += this.neurons.words.get(word).weight;
          wordCount++;
        } else {
          // Ucz nowe słowo
          this.learnWord(word);
          totalWeight += this.neurons.words.get(word).weight;
          wordCount++;
        }
      }
      
      const phraseWeight = wordCount > 0 ? totalWeight / wordCount : 1;
      
      this.neurons.phrases.set(phrase, {
        weight: phraseWeight,
        words: words,
        frequency: 1,
        lastUsed: Date.now()
      });
      
      // Połącz słowa z frazą
      for (const word of words) {
        if (!this.connections.wordToPhrase.has(word)) {
          this.connections.wordToPhrase.set(word, []);
        }
        this.connections.wordToPhrase.get(word).push(phrase);
      }
      
      console.log(`   Learned phrase: "${phrase}" with weight: ${phraseWeight.toFixed(2)}`);
    }
  }

  /**
   * UCZENIE KONTEKSTÓW
   */
  learnContext(context, phrases) {
    if (!this.neurons.contexts.has(context)) {
      // Oblicz wagę kontekstu
      let totalWeight = 0;
      let phraseCount = 0;
      
      for (const phrase of phrases) {
        if (this.neurons.phrases.has(phrase)) {
          totalWeight += this.neurons.phrases.get(phrase).weight;
          phraseCount++;
        }
      }
      
      const contextWeight = phraseCount > 0 ? totalWeight / phraseCount : 1;
      
      this.neurons.contexts.set(context, {
        weight: contextWeight,
        phrases: phrases,
        frequency: 1,
        lastUsed: Date.now()
      });
      
      // Połącz frazy z kontekstem
      for (const phrase of phrases) {
        if (!this.connections.phraseToContext.has(phrase)) {
          this.connections.phraseToContext.set(phrase, []);
        }
        this.connections.phraseToContext.get(phrase).push(context);
      }
      
      console.log(`   Learned context: "${context}" with weight: ${contextWeight.toFixed(2)}`);
    }
  }

  /**
   * PĘTLA MÖBIUSA - NIESKOŃCZONE UCZENIE SIĘ
   */
  startMobiusLoop() {
    console.log('🔄 Starting Möbius Loop - infinite learning...');
    
    this.mobiusLoop.active = true;
    
    const loop = () => {
      if (!this.mobiusLoop.active) return;
      
      this.mobiusLoop.iterations++;
      
      // 1. Znajdź słowa z niską wagą
      const weakWords = [];
      for (const [word, neuron] of this.neurons.words) {
        if (neuron.weight < 5) { // słowa z wagą poniżej 5
          weakWords.push(word);
        }
      }
      
      // 2. Zwiększ wagi słów które są często używane
      for (const word of weakWords) {
        const neuron = this.neurons.words.get(word);
        if (neuron.frequency > 10) { // często używane
          neuron.weight += this.mobiusLoop.learningRate;
          neuron.weight = Math.min(10, neuron.weight); // max 10
        }
      }
      
      // 3. Zmniejsz wagi słów które są rzadko używane
      for (const [word, neuron] of this.neurons.words) {
        const timeSinceLastUsed = Date.now() - neuron.lastUsed;
        const daysSinceLastUsed = timeSinceLastUsed / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastUsed > 30) { // nie używane od 30 dni
          neuron.weight -= this.mobiusLoop.learningRate * 0.5;
          neuron.weight = Math.max(1, neuron.weight); // min 1
        }
      }
      
      // 4. Aktualizuj wagi fraz i kontekstów
      this.updatePhraseWeights();
      this.updateContextWeights();
      
      console.log(`   Möbius iteration ${this.mobiusLoop.iterations}: learning complete`);
      
      // Kontynuuj pętlę
      setTimeout(loop, 1000); // co sekundę
    };
    
    loop();
  }

  /**
   * AKTUALIZUJ WAGI FRAZ
   */
  updatePhraseWeights() {
    for (const [phrase, neuron] of this.neurons.phrases) {
      let totalWeight = 0;
      let wordCount = 0;
      
      for (const word of neuron.words) {
        if (this.neurons.words.has(word)) {
          totalWeight += this.neurons.words.get(word).weight;
          wordCount++;
        }
      }
      
      if (wordCount > 0) {
        neuron.weight = totalWeight / wordCount;
      }
    }
  }

  /**
   * AKTUALIZUJ WAGI KONTEKSTÓW
   */
  updateContextWeights() {
    for (const [context, neuron] of this.neurons.contexts) {
      let totalWeight = 0;
      let phraseCount = 0;
      
      for (const phrase of neuron.phrases) {
        if (this.neurons.phrases.has(phrase)) {
          totalWeight += this.neurons.phrases.get(phrase).weight;
          phraseCount++;
        }
      }
      
      if (phraseCount > 0) {
        neuron.weight = totalWeight / phraseCount;
      }
    }
  }

  /**
   * PRZETWARZANIE TEKSTU - PROSTE I SZYBKIE
   */
  processText(text) {
    console.log(`📝 Processing text: "${text}"`);
    
    // 1. Podziel na słowa
    const words = text.toLowerCase().split(/\s+/);
    
    // 2. Ucz nowe słowa
    for (const word of words) {
      this.learnWord(word);
    }
    
    // 3. Ucz frazy (2-słowe)
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      this.learnPhrase(phrase, [words[i], words[i + 1]]);
    }
    
    // 4. Ucz frazy (3-słowe)
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      this.learnPhrase(phrase, [words[i], words[i + 1], words[i + 2]]);
    }
    
    // 5. Oblicz całkowitą wagę tekstu
    let totalWeight = 0;
    let wordCount = 0;
    
    for (const word of words) {
      if (this.neurons.words.has(word)) {
        totalWeight += this.neurons.words.get(word).weight;
        wordCount++;
      }
    }
    
    const averageWeight = wordCount > 0 ? totalWeight / wordCount : 0;
    
    console.log(`   Text processed successfully!`);
    console.log(`   Words learned: ${words.length}`);
    console.log(`   Average weight: ${averageWeight.toFixed(2)}`);
    
    return {
      words: words.length,
      averageWeight: averageWeight,
      totalWeight: totalWeight,
      meaning: this.interpretMeaning(averageWeight)
    };
  }

  /**
   * INTERPRETACJA ZNACZENIA
   */
  interpretMeaning(weight) {
    if (weight >= 8) {
      return 'VERY IMPORTANT - High priority';
    } else if (weight >= 6) {
      return 'IMPORTANT - Medium priority';
    } else if (weight >= 4) {
      return 'MODERATE - Normal priority';
    } else if (weight >= 2) {
      return 'LOW - Low priority';
    } else {
      return 'VERY LOW - Minimal priority';
    }
  }

  /**
   * GENEROWANIE ODPOWIEDZI
   */
  generateResponse(input) {
    console.log(`💭 Generating response for: "${input}"`);
    
    // Przetwarzaj input
    const processed = this.processText(input);
    
    // Znajdź najważniejsze słowa
    const importantWords = [];
    for (const [word, neuron] of this.neurons.words) {
      if (neuron.weight >= 7) {
        importantWords.push({ word, weight: neuron.weight });
      }
    }
    
    // Sortuj po wadze
    importantWords.sort((a, b) => b.weight - a.weight);
    
    // Generuj prostą odpowiedź
    let response = '';
    
    if (processed.averageWeight >= 7) {
      response = 'This is very important to me. ';
    } else if (processed.averageWeight >= 5) {
      response = 'I understand this is important. ';
    } else {
      response = 'I hear what you are saying. ';
    }
    
    if (importantWords.length > 0) {
      response += `The most important word here is "${importantWords[0].word}". `;
    }
    
    response += `I have learned ${processed.words} words from this.`;
    
    console.log(`   Response generated: "${response}"`);
    
    return response;
  }

  /**
   * STATUS MÓZGU
   */
  getBrainStatus() {
    return {
      words: this.neurons.words.size,
      phrases: this.neurons.phrases.size,
      contexts: this.neurons.contexts.size,
      mobiusIterations: this.mobiusLoop.iterations,
      mobiusActive: this.mobiusLoop.active,
      averageWordWeight: this.calculateAverageWordWeight()
    };
  }

  /**
   * ŚREDNIA WAGA SŁÓW
   */
  calculateAverageWordWeight() {
    let totalWeight = 0;
    let wordCount = 0;
    
    for (const [word, neuron] of this.neurons.words) {
      totalWeight += neuron.weight;
      wordCount++;
    }
    
    return wordCount > 0 ? totalWeight / wordCount : 0;
  }

  /**
   * ZATRZYMANIE MÓZGU
   */
  stop() {
    this.mobiusLoop.active = false;
    console.log('🛑 Simple Brain stopped');
  }
}

module.exports = SimpleBrain;
