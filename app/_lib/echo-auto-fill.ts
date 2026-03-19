// Echo Auto-fill - Konwersacyjny konfigurator (PRO/FINANCE)
// Echo WYWNIOSKUJE → DOPYTUJE → WYPEŁNIA → User POTWIERDZA palcem

export interface ConfiguratorData {
  type: 'insurance' | 'energy' | 'telecom' | 'vacation' | 'leasing' | 'mortgage' | 'loan' | 'creditcard' | 'subscriptions'
  fields: Record<string, any>
  completed: boolean
}

export interface ConversationContext {
  userId: string
  userPackage: 'pro' | 'finance'
  registrationData: Record<string, any> // Dane z rejestracji
  conversationHistory: Message[]
  extractedData: Record<string, any> // Wyciągnięte z rozmowy
  currentConfigurator?: ConfiguratorData
}

export interface Message {
  role: 'user' | 'echo'
  content: string
  timestamp: number
}

export class EchoAutoFill {
  /**
   * KONWERSACYJNY AUTO-FILL
   * 
   * FLOW:
   * 1. User: "Szukam ubezpieczenia samochodu"
   * 2. Echo WYWNIOSKUJE: user chce insurance configurator
   * 3. Echo DOPYTUJE: "Jaki masz samochód? Ile km rocznie?"
   * 4. Echo WYPEŁNIA konfigurator na podstawie odpowiedzi
   * 5. Echo POKAZUJE: "Sprawdź czy jest dobrze"
   * 6. User POPRAWIA jeśli trzeba
   * 7. User POTWIERDZA palcem (biometric)
   * 8. Echo WYSYŁA do crawlera
   */

  /**
   * DETECT INTENT
   * Wywnioskuj z rozmowy co user chce
   */
  static detectIntent(message: string): {
    intent: 'configurator' | 'question' | 'other'
    configuratorType?: ConfiguratorData['type']
  } {
    const lowerMessage = message.toLowerCase()

    // Insurance
    if (lowerMessage.includes('ubezpieczeni') || lowerMessage.includes('verzekering')) {
      return { intent: 'configurator', configuratorType: 'insurance' }
    }

    // Energy
    if (lowerMessage.includes('energia') || lowerMessage.includes('energie') || lowerMessage.includes('prąd') || lowerMessage.includes('stroom')) {
      return { intent: 'configurator', configuratorType: 'energy' }
    }

    // Telecom
    if (lowerMessage.includes('telefon') || lowerMessage.includes('internet') || lowerMessage.includes('mobiel')) {
      return { intent: 'configurator', configuratorType: 'telecom' }
    }

    // Vacation
    if (lowerMessage.includes('wakacje') || lowerMessage.includes('vakantie') || lowerMessage.includes('urlop')) {
      return { intent: 'configurator', configuratorType: 'vacation' }
    }

    // Leasing
    if (lowerMessage.includes('leasing') || lowerMessage.includes('lease')) {
      return { intent: 'configurator', configuratorType: 'leasing' }
    }

    // Mortgage
    if (lowerMessage.includes('kredyt hipoteczny') || lowerMessage.includes('hypotheek') || lowerMessage.includes('mortgage')) {
      return { intent: 'configurator', configuratorType: 'mortgage' }
    }

    // Loan
    if (lowerMessage.includes('pożyczka') || lowerMessage.includes('lening') || lowerMessage.includes('loan')) {
      return { intent: 'configurator', configuratorType: 'loan' }
    }

    // Credit Card
    if (lowerMessage.includes('karta kredytowa') || lowerMessage.includes('creditcard') || lowerMessage.includes('kredietkaart')) {
      return { intent: 'configurator', configuratorType: 'creditcard' }
    }

    // Subscriptions
    if (lowerMessage.includes('subskrypcj') || lowerMessage.includes('abonnement') || lowerMessage.includes('subscription')) {
      return { intent: 'configurator', configuratorType: 'subscriptions' }
    }

    // Question
    if (lowerMessage.includes('?') || lowerMessage.includes('jak') || lowerMessage.includes('co') || lowerMessage.includes('hoe') || lowerMessage.includes('wat')) {
      return { intent: 'question' }
    }

    return { intent: 'other' }
  }

  /**
   * ASK QUESTIONS
   * Dopytaj o szczegóły potrzebne do wypełnienia konfiguratora
   */
  static getQuestionsForConfigurator(type: ConfiguratorData['type']): string[] {
    const questions: Record<ConfiguratorData['type'], string[]> = {
      insurance: [
        'Jaki masz samochód? (marka, model, rok)',
        'Ile kilometrów rocznie jeździsz?',
        'Masz garaż?',
        'Jaki rodzaj ubezpieczenia? (OC, AC, OC+AC)'
      ],
      energy: [
        'Ile osób mieszka w domu?',
        'Jaki masz rodzaj ogrzewania? (gaz, prąd, inne)',
        'Ile zużywasz energii miesięcznie? (kWh)',
        'Chcesz zieloną energię?'
      ],
      telecom: [
        'Ile GB internetu potrzebujesz?',
        'Ile minut dzwonisz miesięcznie?',
        'Potrzebujesz telefonu w pakiecie?',
        'Jaki operator teraz? (możemy przenieść numer)'
      ],
      vacation: [
        'Dokąd chcesz jechać?',
        'Ile osób?',
        'Na ile dni?',
        'Jaki budżet? (€)',
        'Preferowany termin?'
      ],
      leasing: [
        'Jaki samochód? (marka, model)',
        'Nowy czy używany?',
        'Jaki budżet miesięczny? (€)',
        'Ile km rocznie?',
        'Na ile lat?'
      ],
      mortgage: [
        'Jaka wartość nieruchomości? (€)',
        'Ile masz wkładu własnego? (€)',
        'Jaki dochód miesięczny? (€)',
        'Na ile lat kredyt?'
      ],
      loan: [
        'Ile potrzebujesz? (€)',
        'Na co? (cel pożyczki)',
        'Na ile miesięcy?',
        'Jaki dochód miesięczny? (€)'
      ],
      creditcard: [
        'Jaki limit? (€)',
        'Potrzebujesz cashback?',
        'Podróże zagraniczne? (0% foreign fees)',
        'Jaki dochód miesięczny? (€)'
      ],
      subscriptions: [
        'Jakie subskrypcje masz? (Netflix, Spotify, etc.)',
        'Ile płacisz miesięcznie? (€)',
        'Chcesz family plan?',
        'Ile osób?'
      ]
    }

    return questions[type] || []
  }

  /**
   * EXTRACT DATA FROM CONVERSATION
   * Wyciągnij dane z rozmowy
   */
  static extractData(conversationHistory: Message[]): Record<string, any> {
    const extracted: Record<string, any> = {}

    // TODO: Implement NLP extraction
    // For now, simple keyword matching
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase()

        // Extract numbers
        const numbers = content.match(/\d+/g)
        if (numbers) {
          extracted.numbers = numbers.map(n => parseInt(n))
        }

        // Extract yes/no
        if (content.includes('tak') || content.includes('ja') || content.includes('yes')) {
          extracted.confirmed = true
        }
        if (content.includes('nie') || content.includes('nee') || content.includes('no')) {
          extracted.confirmed = false
        }
      }
    })

    return extracted
  }

  /**
   * FILL CONFIGURATOR
   * Wypełnij konfigurator na podstawie danych
   */
  static fillConfigurator(
    type: ConfiguratorData['type'],
    registrationData: Record<string, any>,
    conversationData: Record<string, any>
  ): ConfiguratorData {
    const fields: Record<string, any> = {}

    // Merge registration data + conversation data
    const allData = { ...registrationData, ...conversationData }

    // Fill fields based on configurator type
    // TODO: Implement field mapping for each configurator type

    return {
      type,
      fields,
      completed: false
    }
  }

  /**
   * GENERATE CONFIRMATION MESSAGE
   * Pokaż userowi wypełniony konfigurator do sprawdzenia
   */
  static generateConfirmationMessage(configurator: ConfiguratorData): string {
    const fieldsList = Object.entries(configurator.fields)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n')

    return `Świetnie! Wypełniłem konfigurator:\n\n${fieldsList}\n\nCzy jest dobrze? Chcesz coś poprawić?\n\n[Potwierdź palcem aby wysłać] 👆`
  }

  /**
   * SUBMIT TO CRAWLER
   * Wyślij wypełniony konfigurator do crawlera
   * User MUSI potwierdzić palcem (biometric)!
   */
  static async submitToCrawler(
    configurator: ConfiguratorData,
    userId: string,
    biometricConfirmed: boolean
  ): Promise<{ success: boolean; message: string }> {
    if (!biometricConfirmed) {
      return {
        success: false,
        message: 'Musisz potwierdzić palcem (biometric) aby wysłać!'
      }
    }

    try {
      // TODO: Call appropriate API endpoint based on configurator type
      const response = await fetch(`/api/configurator/${configurator.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fields: configurator.fields
        })
      })

      const result = await response.json()

      return {
        success: true,
        message: `Wysłano! Szukamy najlepszych ofert... 🔍`
      }
    } catch (error) {
      return {
        success: false,
        message: 'Błąd wysyłania. Spróbuj ponownie.'
      }
    }
  }
}
