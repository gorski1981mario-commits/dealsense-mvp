// User Profile Schema - Complete user data for Echo AI

export interface UserProfile {
  id: string
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  createdAt: string
  lastUpdated: string
  
  // PERSONAL DATA (from registration)
  personal: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    age: number
    gender?: 'man' | 'vrouw'
  }
  
  // ADDRESS (from registration)
  address: {
    street: string
    houseNumber: string
    postcode: string
    city: string
    country: string
  }
  
  // AI LEARNED PREFERENCES
  preferences: {
    priceVsQuality: 'cheapest' | 'balanced' | 'quality'
    riskTolerance: 'low' | 'medium' | 'high'
    sustainability: boolean
    communicationStyle: 'formal' | 'casual'
    autoApprove: boolean // FINANCE only - one-click execution
  }
  
  // CURRENT CONTRACTS (Echo tracks)
  currentContracts: {
    insurance: {
      auto?: {
        provider: string
        price: number
        coverage: 'wa' | 'wa-beperkt' | 'allrisk'
        kenteken: string
        expiryDate?: string
      }
      home?: {
        provider: string
        price: number
        type: 'inboedel' | 'opstal' | 'both'
        expiryDate?: string
      }
      health?: {
        provider: string
        price: number
        eigenRisico: number
        expiryDate?: string
      }
      life?: {
        provider: string
        price: number
        coverage: number
        expiryDate?: string
      }
    }
    
    energy: {
      provider: string
      electricityUsage: number // kWh/year
      gasUsage: number // m³/year
      monthlyPrice: number
      greenEnergy: boolean
      contractEndDate?: string
    }
    
    telecom: {
      internet?: {
        provider: string
        speed: number // Mbps
        price: number
        contractEndDate?: string
      }
      mobile?: {
        provider: string
        data: number // GB
        price: number
        contractEndDate?: string
      }
      tv?: {
        provider: string
        channels: number
        price: number
      }
    }
    
    subscriptions: Array<{
      name: string
      category: 'streaming' | 'music' | 'news' | 'software' | 'other'
      price: number
      billingCycle: 'monthly' | 'yearly'
    }>
  }
  
  // ASSETS (what user owns)
  assets: {
    vehicles: Array<{
      type: 'auto' | 'motor'
      brand: string
      model: string
      year: number
      kenteken: string
      value?: number
      annualMileage?: number
      parkingLocation?: 'straat' | 'parkeerplaats' | 'garage'
    }>
    
    property: {
      type: 'koop' | 'huur'
      propertyType?: 'appartement' | 'tussenwoning' | 'hoekwoning' | 'vrijstaand'
      value?: number
      buildYear?: number
      squareMeters?: number
    }
    
    household: {
      size: number
      adults: number
      children: number
      pets?: number
    }
  }
  
  // FINANCIAL DATA
  financial: {
    monthlyIncome?: number
    monthlyExpenses: number
    savingsGoal?: number
    debtFree: boolean
  }
  
  // AI INSIGHTS (Echo's analysis)
  aiInsights: {
    totalMonthlyExpenses: number
    savingsPotential: number
    optimizationScore: number // 0-100
    lastAnalyzed: string
    
    recommendations: Array<{
      sector: 'insurance' | 'energy' | 'telecom' | 'subscriptions' | 'banking'
      priority: 'high' | 'medium' | 'low'
      currentCost: number
      optimizedCost: number
      savings: number
      confidence: number // 0-100
      reason: string
      status: 'pending' | 'approved' | 'rejected' | 'completed'
    }>
    
    riskProfile: {
      score: number // 0-100
      category: 'conservative' | 'moderate' | 'aggressive'
      factors: string[]
    }
  }
  
  // ECHO LEARNING DATA
  echoLearning: {
    conversationCount: number
    lastConversation: string
    topics: string[] // what user talked about
    sentiment: 'positive' | 'neutral' | 'negative'
    
    // What Echo learned about user
    insights: {
      careBudget: boolean // czy dba o budżet
      valueQuality: boolean // czy ceni jakość
      techSavvy: boolean // czy zna się na technologii
      familyOriented: boolean // czy priorytet to rodzina
      environmentallyConscious: boolean // czy eko
    }
    
    // User behavior patterns
    patterns: {
      preferredContactTime?: string
      responseSpeed: 'fast' | 'medium' | 'slow'
      decisionMaking: 'quick' | 'deliberate'
      trustLevel: number // 0-100
    }
  }
  
  // CONFIGURATION HISTORY
  configurations: Array<{
    id: string
    configId: string
    sector: string
    status: 'opgeslagen' | 'betaald' | 'voltooid'
    createdAt: string
    aiGenerated: boolean
    userModified: boolean
  }>
}

// Default profile for new users
export const createDefaultProfile = (userData: {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  street: string
  houseNumber: string
  postcode: string
  city: string
  packageType: 'free' | 'plus' | 'pro' | 'finance'
}): UserProfile => {
  const age = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear()
  
  return {
    id: userData.id,
    packageType: userData.packageType,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    
    personal: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      age
    },
    
    address: {
      street: userData.street,
      houseNumber: userData.houseNumber,
      postcode: userData.postcode,
      city: userData.city,
      country: 'Nederland'
    },
    
    preferences: {
      priceVsQuality: 'balanced',
      riskTolerance: 'medium',
      sustainability: false,
      communicationStyle: 'casual',
      autoApprove: false
    },
    
    currentContracts: {
      insurance: {},
      energy: {
        provider: '',
        electricityUsage: 0,
        gasUsage: 0,
        monthlyPrice: 0,
        greenEnergy: false
      },
      telecom: {},
      subscriptions: []
    },
    
    assets: {
      vehicles: [],
      property: {
        type: 'huur'
      },
      household: {
        size: 1,
        adults: 1,
        children: 0
      }
    },
    
    financial: {
      monthlyExpenses: 0,
      debtFree: true
    },
    
    aiInsights: {
      totalMonthlyExpenses: 0,
      savingsPotential: 0,
      optimizationScore: 0,
      lastAnalyzed: new Date().toISOString(),
      recommendations: [],
      riskProfile: {
        score: 50,
        category: 'moderate',
        factors: []
      }
    },
    
    echoLearning: {
      conversationCount: 0,
      lastConversation: '',
      topics: [],
      sentiment: 'neutral',
      insights: {
        careBudget: false,
        valueQuality: false,
        techSavvy: false,
        familyOriented: false,
        environmentallyConscious: false
      },
      patterns: {
        responseSpeed: 'medium',
        decisionMaking: 'deliberate',
        trustLevel: 50
      }
    },
    
    configurations: []
  }
}
