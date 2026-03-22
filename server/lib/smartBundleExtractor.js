/**
 * SMART BUNDLE EXTRACTOR
 * 
 * Wykorzystuje "śmieciowe" dane z SearchAPI do wyciągnięcia akcesoriów!
 * ZERO dodatkowych requestów - wszystko z jednego zapytania.
 * 
 * FLOW:
 * 1. SearchAPI zwraca 100 wyników (główne produkty + akcesoria)
 * 2. Rozdzielamy: mainProducts vs accessories (keywords)
 * 3. Grupujemy: cases, screens, chargers (per typ)
 * 4. Wykrywamy warianty: color, type, power (regex)
 * 5. Wybieramy najlepsze: najtańszy per wariant
 * 6. Zwracamy: smartBundles z wariantami
 */

// KEYWORDS dla akcesoriów (per kategoria)
const ACCESSORY_KEYWORDS = {
  smartphone: [
    'case', 'hoesje', 'hoes', 'cover',
    'screen', 'protector', 'beschermer', 'glas',
    'charger', 'oplader', 'lader',
    'cable', 'kabel', 'snoer',
    'earbuds', 'oordopjes', 'headphones', 'koptelefoon',
    'powerbank', 'power bank',
    'mount', 'houder', 'autohouder'
  ],
  laptop: [
    'tas', 'bag', 'sleeve', 'backpack', 'rugzak',
    'mouse', 'muis',
    'keyboard', 'toetsenbord',
    'hub', 'dock', 'adapter',
    'stand', 'standaard',
    'webcam', 'camera',
    'ssd', 'hdd', 'storage', 'opslag'
  ],
  tv: [
    'soundbar', 'speaker', 'luidspreker',
    'mount', 'beugel', 'muurbeugel',
    'hdmi', 'cable', 'kabel',
    'remote', 'afstandsbediening',
    'streaming', 'chromecast', 'apple tv'
  ],
  camera: [
    'lens', 'objectief',
    'memory', 'geheugen', 'sd card', 'cf card',
    'tas', 'bag', 'case',
    'tripod', 'statief',
    'battery', 'batterij', 'accu',
    'filter', 'uv', 'polarizer', 'nd'
  ],
  gaming: [
    'controller', 'gamepad',
    'headset', 'koptelefoon',
    'charging', 'opladen', 'dock',
    'storage', 'opslag', 'ssd', 'hdd',
    'grip', 'skin',
    'case', 'tas', 'opbergtas'
  ],
  audio: [
    'case', 'tas', 'etui',
    'earpads', 'oorkussens',
    'cable', 'kabel', 'snoer',
    'stand', 'standaard',
    'adapter', 'bluetooth'
  ],
  wearable: [
    'band', 'bandje', 'strap',
    'screen', 'protector', 'beschermer',
    'charger', 'oplader', 'lader',
    'case', 'hoesje', 'bumper'
  ]
}

// CATEGORY DETECTION (simplified)
function detectCategory(productName) {
  const nameLower = productName.toLowerCase()
  
  if (nameLower.includes('iphone') || nameLower.includes('samsung galaxy') || nameLower.includes('pixel')) {
    return 'smartphone'
  }
  if (nameLower.includes('macbook') || nameLower.includes('laptop') || nameLower.includes('thinkpad')) {
    return 'laptop'
  }
  if (nameLower.includes('tv') || nameLower.includes('oled') || nameLower.includes('qled')) {
    return 'tv'
  }
  if (nameLower.includes('canon') || nameLower.includes('nikon') || nameLower.includes('sony a7')) {
    return 'camera'
  }
  if (nameLower.includes('playstation') || nameLower.includes('xbox') || nameLower.includes('nintendo')) {
    return 'gaming'
  }
  if (nameLower.includes('headphones') || nameLower.includes('airpods') || nameLower.includes('bose')) {
    return 'audio'
  }
  if (nameLower.includes('watch') || nameLower.includes('fitbit') || nameLower.includes('garmin')) {
    return 'wearable'
  }
  
  return 'smartphone' // Default
}

/**
 * STEP 1: Rozdziel główny produkt vs akcesoria
 */
function separateMainProductAndAccessories(offers, productName) {
  const mainProducts = []
  const accessories = []
  
  const category = detectCategory(productName)
  const keywords = ACCESSORY_KEYWORDS[category] || ACCESSORY_KEYWORDS.smartphone
  
  for (const offer of offers) {
    const titleLower = offer.title.toLowerCase()
    
    // Czy to akcesoria?
    const isAccessory = keywords.some(keyword => titleLower.includes(keyword))
    
    if (isAccessory) {
      accessories.push(offer)
    } else {
      mainProducts.push(offer)
    }
  }
  
  return { mainProducts, accessories, category }
}

/**
 * STEP 2: Grupuj akcesoria per typ
 */
function groupAccessoriesByType(accessories, category) {
  const groups = {
    cases: [],
    screens: [],
    chargers: [],
    cables: [],
    earbuds: [],
    powerbanks: [],
    mounts: [],
    other: []
  }
  
  for (const accessory of accessories) {
    const titleLower = accessory.title.toLowerCase()
    
    // Grupowanie po keywords
    if (titleLower.includes('case') || titleLower.includes('hoesje') || titleLower.includes('hoes')) {
      groups.cases.push(accessory)
    } else if (titleLower.includes('screen') || titleLower.includes('protector') || titleLower.includes('beschermer') || titleLower.includes('glas')) {
      groups.screens.push(accessory)
    } else if (titleLower.includes('charger') || titleLower.includes('oplader') || titleLower.includes('lader')) {
      groups.chargers.push(accessory)
    } else if (titleLower.includes('cable') || titleLower.includes('kabel') || titleLower.includes('snoer')) {
      groups.cables.push(accessory)
    } else if (titleLower.includes('earbuds') || titleLower.includes('oordopjes') || titleLower.includes('headphones')) {
      groups.earbuds.push(accessory)
    } else if (titleLower.includes('powerbank') || titleLower.includes('power bank')) {
      groups.powerbanks.push(accessory)
    } else if (titleLower.includes('mount') || titleLower.includes('houder')) {
      groups.mounts.push(accessory)
    } else {
      groups.other.push(accessory)
    }
  }
  
  return groups
}

/**
 * STEP 3: Wykryj warianty (kolor, typ, moc)
 */
function detectVariants(accessories) {
  return accessories.map(accessory => {
    const titleLower = accessory.title.toLowerCase()
    
    // Wykryj kolor
    let color = null
    if (titleLower.includes('black') || titleLower.includes('zwart')) color = 'Black'
    else if (titleLower.includes('white') || titleLower.includes('wit')) color = 'White'
    else if (titleLower.includes('pink') || titleLower.includes('roze') || titleLower.includes('rose')) color = 'Pink'
    else if (titleLower.includes('blue') || titleLower.includes('blauw')) color = 'Blue'
    else if (titleLower.includes('red') || titleLower.includes('rood')) color = 'Red'
    else if (titleLower.includes('green') || titleLower.includes('groen')) color = 'Green'
    else if (titleLower.includes('clear') || titleLower.includes('transparant')) color = 'Clear'
    
    // Wykryj typ (dla screen protectors)
    let type = null
    if (titleLower.includes('privacy')) type = 'Privacy'
    else if (titleLower.includes('anti-glare') || titleLower.includes('antiglare')) type = 'Anti-glare'
    else if (titleLower.includes('matte')) type = 'Matte'
    else if (titleLower.includes('blue light')) type = 'Blue light filter'
    else if (titleLower.includes('gehard glas') || titleLower.includes('tempered')) type = 'Gehard glas'
    
    // Wykryj moc (dla chargers)
    let power = null
    const powerMatch = titleLower.match(/(\d+)w/)
    if (powerMatch) {
      power = `${powerMatch[1]}W`
    }
    
    return {
      ...accessory,
      variant: {
        color,
        type,
        power
      }
    }
  })
}

/**
 * STEP 4: Wybierz najlepsze oferty per typ
 */
function selectBestAccessories(grouped) {
  const bundles = []
  
  // 1. CASE - wybierz najtańszy per kolor
  if (grouped.cases.length > 0) {
    const casesWithVariants = detectVariants(grouped.cases)
    const casesByColor = {}
    
    for (const caseItem of casesWithVariants) {
      const color = caseItem.variant.color || 'Unknown'
      if (!casesByColor[color] || caseItem.price < casesByColor[color].price) {
        casesByColor[color] = caseItem
      }
    }
    
    const variants = Object.values(casesByColor)
    if (variants.length > 0) {
      bundles.push({
        type: 'case',
        name: 'Telefoonhoesje',
        variants: variants,
        defaultVariant: casesByColor['Black'] || variants[0]
      })
    }
  }
  
  // 2. SCREEN - wybierz najtańszy per typ
  if (grouped.screens.length > 0) {
    const screensWithVariants = detectVariants(grouped.screens)
    const screensByType = {}
    
    for (const screen of screensWithVariants) {
      const type = screen.variant.type || 'Gehard glas'
      if (!screensByType[type] || screen.price < screensByType[type].price) {
        screensByType[type] = screen
      }
    }
    
    const variants = Object.values(screensByType)
    if (variants.length > 0) {
      bundles.push({
        type: 'screen',
        name: 'Schermbeschermer',
        variants: variants,
        defaultVariant: screensByType['Gehard glas'] || variants[0]
      })
    }
  }
  
  // 3. CHARGER - wybierz najtańszy per moc
  if (grouped.chargers.length > 0) {
    const chargersWithVariants = detectVariants(grouped.chargers)
    const chargersByPower = {}
    
    for (const charger of chargersWithVariants) {
      const power = charger.variant.power || '20W'
      if (!chargersByPower[power] || charger.price < chargersByPower[power].price) {
        chargersByPower[power] = charger
      }
    }
    
    const variants = Object.values(chargersByPower)
    if (variants.length > 0) {
      bundles.push({
        type: 'charger',
        name: 'Snellader',
        variants: variants,
        defaultVariant: chargersByPower['20W'] || variants[0]
      })
    }
  }
  
  return bundles
}

/**
 * MAIN FUNCTION: Extract Smart Bundles from SearchAPI results
 */
function extractSmartBundles(offers, productName) {
  if (!offers || offers.length === 0) {
    return null
  }
  
  // STEP 1: Rozdziel główny produkt vs akcesoria
  const { mainProducts, accessories, category } = separateMainProductAndAccessories(offers, productName)
  
  console.log(`[SMART BUNDLES] Category: ${category}`)
  console.log(`[SMART BUNDLES] Main products: ${mainProducts.length}`)
  console.log(`[SMART BUNDLES] Accessories: ${accessories.length}`)
  
  if (accessories.length === 0) {
    return {
      mainProducts,
      smartBundles: [],
      category
    }
  }
  
  // STEP 2: Grupuj akcesoria per typ
  const grouped = groupAccessoriesByType(accessories, category)
  
  console.log(`[SMART BUNDLES] Cases: ${grouped.cases.length}`)
  console.log(`[SMART BUNDLES] Screens: ${grouped.screens.length}`)
  console.log(`[SMART BUNDLES] Chargers: ${grouped.chargers.length}`)
  
  // STEP 3 & 4: Wykryj warianty i wybierz najlepsze
  const smartBundles = selectBestAccessories(grouped)
  
  console.log(`[SMART BUNDLES] Generated ${smartBundles.length} bundle suggestions`)
  
  // Prowizja będzie liczona w API używając ISTNIEJĄCEJ logiki z commission.ts
  // (calculateCommission, calculateNetSavings, formatCommission)
  
  return {
    mainProducts,
    smartBundles,
    category
  }
}

module.exports = {
  extractSmartBundles,
  detectCategory,
  separateMainProductAndAccessories,
  groupAccessoriesByType,
  detectVariants,
  selectBestAccessories
}
