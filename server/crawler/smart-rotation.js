// SMART ROTATION STRATEGY
// Zapobiega "pattern learning" - user nie może się nauczyć że Beslist.nl jest zawsze najtańszy
// Każdy user widzi INNĄ kolejność ofert (ale zawsze dobre ceny!)

const crypto = require('crypto')

/**
 * SMART ROTATION
 * 
 * PROBLEM:
 * - Jeśli zawsze pokazujemy Beslist.nl na topie, user się nauczy
 * - User przestanie skanować u nas, bo wie że Beslist.nl jest najtańszy
 * - Tracimy prowizję!
 * 
 * ROZWIĄZANIE:
 * - Rotacja ofert bazowana na userId + timestamp
 * - Każdy user widzi INNĄ kolejność (ale zawsze top deals!)
 * - Anti-pattern detection (nie pokazuj tego samego 2x pod rząd)
 * - Weighted randomization (niszowe 60%, giganci 40%)
 */
class SmartRotation {
  constructor() {
    this.dayWindow = 86400000 // 24 hours = 1 day
    this.hourWindow = 3600000 // 1 hour
  }

  /**
   * ROTATE OFFERS
   * Inteligentna rotacja ofert dla każdego usera
   * 
   * KLUCZOWE ZASADY:
   * 1. TYLKO oferty tańsze niż cena bazowa (zgodnie ze skorem)
   * 2. Rotacja między RÓŻNYMI sklepami (nie te same 3 sklepy)
   * 3. Sortowanie: najtańszy → najdroższy (w ramach score)
   */
  rotateOffers(offers, userId, packageType, basePrice = null) {
    if (!offers || offers.length === 0) return []

    console.log(`[Smart Rotation] Rotating ${offers.length} offers for user ${userId}`)

    // 1. FILTER: tylko oferty tańsze niż cena bazowa (KLUCZOWE!)
    let validOffers = offers
    if (basePrice) {
      validOffers = offers.filter(o => o.price < basePrice)
      console.log(`[Smart Rotation] Filtered: ${validOffers.length}/${offers.length} cheaper than €${basePrice}`)
    }

    if (validOffers.length === 0) {
      console.log('[Smart Rotation] No valid offers found!')
      return []
    }

    // 2. Sort by price (najtańszy → najdroższy)
    validOffers.sort((a, b) => a.price - b.price)

    // 3. Get rotation seed (multi-level: day + hour + intensity)
    const seedData = this.getRotationSeed(userId)
    console.log(`[Smart Rotation] Seed: day=${seedData.daySlot}, hour=${seedData.hourSlot}, cycle=${seedData.rotationCycle}, intensity=${seedData.intensity * 100}%`)

    // 4. Get user's recent shops (last 5 scans)
    const recentShops = this.getRecentShops(userId)

    // 5. SMART ROTATION: wybierz RÓŻNE sklepy
    const maxOffers = this.getMaxOffers(packageType)
    const rotated = this.selectDifferentShops(validOffers, recentShops, maxOffers, seedData)

    console.log(`[Smart Rotation] Final: ${rotated.length} offers from different shops`)
    return rotated
  }

  /**
   * GET ROTATION SEED
   * MULTI-LEVEL ROTATION (maksymalne utrudnienie pattern learning!)
   * 
   * LEVEL 1 (24h cycle): Ten sam pattern wraca po 24h
   * LEVEL 2 (gradual rotation): 100% → 50% → 25% → 100% rotation
   * LEVEL 3 (hour variation): Lekka zmiana co godzinę
   * 
   * PRZYKŁAD:
   * Day 1, 10:00: Beslist, Alternate, Bol (100% rotation)
   * Day 1, 11:00: Beslist, Bol, Alternate (lekka zmiana)
   * Day 2, 10:00: Alternate, Beslist, Bol (50% rotation)
   * Day 3, 10:00: Bol, Beslist, Alternate (25% rotation)
   * Day 4, 10:00: Beslist, Alternate, Bol (100% rotation - wraca!)
   */
  getRotationSeed(userId) {
    const now = Date.now()
    
    // LEVEL 1: Day slot (24h cycle)
    const daySlot = Math.floor(now / this.dayWindow)
    
    // LEVEL 2: Hour slot (within day)
    const hourSlot = Math.floor((now % this.dayWindow) / this.hourWindow)
    
    // LEVEL 3: Rotation intensity (4-day cycle: 100% → 50% → 25% → 100%)
    const rotationCycle = daySlot % 4 // 0, 1, 2, 3
    const rotationIntensity = this.getRotationIntensity(rotationCycle)
    
    // Generate seed
    const seedString = `${userId}-${daySlot}-${hourSlot}-${rotationIntensity}`
    const hash = crypto.createHash('md5').update(seedString).digest('hex')
    
    return {
      seed: parseInt(hash.substring(0, 8), 16),
      intensity: rotationIntensity,
      daySlot,
      hourSlot,
      rotationCycle
    }
  }
  
  /**
   * GET ROTATION INTENSITY
   * 4-day cycle: 100% → 50% → 25% → 100%
   */
  getRotationIntensity(cycle) {
    switch (cycle) {
      case 0: return 1.0  // Day 1: 100% rotation (full shuffle)
      case 1: return 0.5  // Day 2: 50% rotation (half shuffle)
      case 2: return 0.25 // Day 3: 25% rotation (quarter shuffle)
      case 3: return 1.0  // Day 4: 100% rotation (full shuffle again)
      default: return 1.0
    }
  }

  /**
   * SELECT DIFFERENT SHOPS
   * Wybiera oferty z RÓŻNYCH sklepów (nie te same 3 sklepy!)
   * Priorytet: najtańsze oferty, ale z różnych sklepów
   */
  selectDifferentShops(offers, recentShops, maxOffers, seedData) {
    const selected = []
    const usedShops = new Set()
    
    // 1. First pass: wybierz najlepsze oferty z RÓŻNYCH sklepów
    for (const offer of offers) {
      if (selected.length >= maxOffers) break
      
      // Skip if shop already used
      if (usedShops.has(offer.seller)) continue
      
      // Skip if shop was shown recently (anti-pattern)
      if (recentShops.includes(offer.seller) && selected.length < 2) {
        continue // Skip only for first 2 positions
      }
      
      selected.push(offer)
      usedShops.add(offer.seller)
    }
    
    // 2. Second pass: jeśli nie mamy wystarczająco, dodaj z tych samych sklepów
    if (selected.length < maxOffers) {
      for (const offer of offers) {
        if (selected.length >= maxOffers) break
        
        // Skip if already selected
        if (selected.includes(offer)) continue
        
        selected.push(offer)
      }
    }
    
    // 3. Apply seed-based micro-rotation (subtle shuffle within top offers)
    // Nie zmieniamy drastycznie kolejności, tylko lekko rotujemy top 3
    if (selected.length >= 3) {
      const top3 = selected.slice(0, 3)
      const rest = selected.slice(3)
      
      // Micro-shuffle top 3 based on seed + intensity
      const shuffled = this.microShuffle(top3, seedData)
      
      return [...shuffled, ...rest]
    }
    
    return selected
  }

  /**
   * MICRO SHUFFLE
   * Gradual rotation based on intensity (100% → 50% → 25% → 100%)
   * 
   * INTENSITY 100% (Day 1, 4): Full shuffle (wszystkie pozycje mogą się zmienić)
   * INTENSITY 50% (Day 2): Half shuffle (tylko 1-2 swap)
   * INTENSITY 25% (Day 3): Quarter shuffle (tylko 2-3 swap)
   */
  microShuffle(offers, seedData) {
    const shuffled = [...offers]
    const { seed, intensity } = seedData
    const random = this.seededRandom(seed)
    
    // INTENSITY 100%: Full rotation
    if (intensity >= 1.0) {
      // 50% szansy na full shuffle (1→3, 2→1, 3→2)
      if (random < 0.5 && shuffled.length >= 3) {
        return [shuffled[2], shuffled[0], shuffled[1]]
      }
      // 30% szansy na swap 1↔2
      else if (random < 0.8 && shuffled.length >= 2) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
      }
    }
    
    // INTENSITY 50%: Half rotation (tylko 1↔2)
    else if (intensity >= 0.5) {
      if (random < 0.5 && shuffled.length >= 2) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
      }
    }
    
    // INTENSITY 25%: Quarter rotation (tylko 2↔3)
    else if (intensity >= 0.25) {
      if (random < 0.3 && shuffled.length >= 3) {
        [shuffled[1], shuffled[2]] = [shuffled[2], shuffled[1]]
      }
    }
    
    return shuffled
  }

  /**
   * GET RECENT SHOPS
   * Get user's last 5 shops (not just top offers)
   */
  getRecentShops(userId) {
    if (!global.userShops) global.userShops = {}
    return global.userShops[userId] || []
  }

  /**
   * SAVE SHOP
   * Save user's current shops
   */
  saveShops(userId, shops) {
    if (!shops || shops.length === 0) return
    
    if (!global.userShops) global.userShops = {}
    if (!global.userShops[userId]) global.userShops[userId] = []
    
    // Add all shops from current scan
    for (const shop of shops) {
      if (!global.userShops[userId].includes(shop)) {
        global.userShops[userId].unshift(shop)
      }
    }
    
    // Keep last 15 shops (3 scans × 5 shops per scan)
    global.userShops[userId] = global.userShops[userId].slice(0, 15)
  }

  /**
   * WEIGHTED SHUFFLE
   * Shuffle z wagami - lepsze oferty mają większą szansę być na topie
   * Ale NIE ZAWSZE te same!
   */
  weightedShuffle(offers, seed, weight) {
    if (!offers || offers.length === 0) return []

    // Sort by price first (lowest = best)
    const sorted = [...offers].sort((a, b) => a.price - b.price)

    // Calculate weights (top offers have higher weight)
    const weighted = sorted.map((offer, index) => {
      // Top 3 offers: weight 3.0
      // Next 3 offers: weight 2.0
      // Rest: weight 1.0
      let offerWeight = 1.0
      if (index < 3) offerWeight = 3.0
      else if (index < 6) offerWeight = 2.0

      return {
        offer,
        weight: offerWeight * weight,
        randomValue: this.seededRandom(seed + index)
      }
    })

    // Sort by (weight × randomValue)
    // Top offers mają większą szansę, ale NIE ZAWSZE wygrywają
    weighted.sort((a, b) => {
      const scoreA = a.weight * a.randomValue
      const scoreB = b.weight * b.randomValue
      return scoreB - scoreA
    })

    return weighted.map(w => w.offer)
  }

  /**
   * SEEDED RANDOM
   * Deterministyczny random (ten sam seed = ten sam wynik)
   */
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  /**
   * INTERLEAVE
   * Przeplatanie niszowych i gigantów (60/40)
   */
  interleave(niszowe, giganci, niszowyRatio) {
    const result = []
    let niszowyIndex = 0
    let giganciIndex = 0

    // Calculate pattern: N N G N N G (60/40)
    const pattern = this.generatePattern(niszowyRatio)

    for (const isNiszowy of pattern) {
      if (isNiszowy && niszowyIndex < niszowe.length) {
        result.push(niszowe[niszowyIndex++])
      } else if (!isNiszowy && giganciIndex < giganci.length) {
        result.push(giganci[giganciIndex++])
      } else if (niszowyIndex < niszowe.length) {
        result.push(niszowe[niszowyIndex++])
      } else if (giganciIndex < giganci.length) {
        result.push(giganci[giganciIndex++])
      }
    }

    // Add remaining
    while (niszowyIndex < niszowe.length) {
      result.push(niszowe[niszowyIndex++])
    }
    while (giganciIndex < giganci.length) {
      result.push(giganci[giganciIndex++])
    }

    return result
  }

  /**
   * GENERATE PATTERN
   * Generate interleave pattern (e.g., [true, true, false, true, true, false])
   */
  generatePattern(niszowyRatio) {
    const pattern = []
    const total = 100
    const niszowyCount = Math.round(total * niszowyRatio)

    for (let i = 0; i < total; i++) {
      pattern.push(i < niszowyCount)
    }

    return pattern
  }


  /**
   * GET MAX OFFERS
   */
  getMaxOffers(packageType) {
    switch (packageType) {
      case 'free': return 3
      case 'plus': return 10
      case 'pro': return 25
      case 'finance': return 50
      default: return 3
    }
  }
}

module.exports = new SmartRotation()
