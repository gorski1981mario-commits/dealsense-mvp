// EAN Product Database - KLUCZOWA WARTOŚĆ (50-60% dochodu!)
// Nasza baza produktów z EAN numerami dla wszystkich sektorów

/**
 * EAN Database Structure:
 * - Moda (ubrania, buty, akcesoria)
 * - Elektronika (telefony, laptopy, TV, audio)
 * - Dom & Ogród (meble, AGD, narzędzia)
 * - Sport & Outdoor (sprzęt sportowy, rowery)
 * - Zabawki & Gry (konsole, gry, zabawki)
 * - Książki & Media (książki, filmy, muzyka)
 */

const eanDatabase = {
  // ELEKTRONIKA - Najpopularniejsze produkty
  electronics: {
    '8719273287891': {
      name: 'Apple iPhone 15 Pro 128GB',
      category: 'smartphones',
      brand: 'Apple',
      avgPrice: 1199,
      popularity: 'high'
    },
    '8806094935943': {
      name: 'Samsung Galaxy S24 Ultra 256GB',
      category: 'smartphones',
      brand: 'Samsung',
      avgPrice: 1299,
      popularity: 'high'
    },
    '0194253394464': {
      name: 'Apple AirPods Pro (2nd generation)',
      category: 'audio',
      brand: 'Apple',
      avgPrice: 279,
      popularity: 'high'
    },
    '8806094526356': {
      name: 'Samsung 55" QLED 4K TV',
      category: 'tv',
      brand: 'Samsung',
      avgPrice: 899,
      popularity: 'medium'
    },
    '5397184000007': {
      name: 'Sony PlayStation 5',
      category: 'gaming',
      brand: 'Sony',
      avgPrice: 549,
      popularity: 'high'
    }
  },

  // MODA - Popularne marki
  fashion: {
    '8719245200015': {
      name: 'Nike Air Max 90',
      category: 'shoes',
      brand: 'Nike',
      avgPrice: 139,
      popularity: 'high'
    },
    '4060512345678': {
      name: 'Adidas Ultraboost 22',
      category: 'shoes',
      brand: 'Adidas',
      avgPrice: 180,
      popularity: 'high'
    },
    '8718526069877': {
      name: "Levi's 501 Original Jeans",
      category: 'clothing',
      brand: "Levi's",
      avgPrice: 99,
      popularity: 'medium'
    }
  },

  // DOM & OGRÓD
  home: {
    '8710103951087': {
      name: 'Philips Hue White Starter Kit',
      category: 'smart-home',
      brand: 'Philips',
      avgPrice: 79,
      popularity: 'high'
    },
    '8712581549213': {
      name: 'Bosch Serie 6 Wasmachine',
      category: 'appliances',
      brand: 'Bosch',
      avgPrice: 649,
      popularity: 'medium'
    }
  },

  // SPORT & OUTDOOR
  sports: {
    '8719324556789': {
      name: 'Decathlon Btwin Rockrider 520',
      category: 'bikes',
      brand: 'Btwin',
      avgPrice: 399,
      popularity: 'medium'
    },
    '0883212345678': {
      name: 'GoPro HERO12 Black',
      category: 'cameras',
      brand: 'GoPro',
      avgPrice: 449,
      popularity: 'high'
    }
  },

  // ZABAWKI & GRY
  toys: {
    '5702017153308': {
      name: 'LEGO Star Wars Millennium Falcon',
      category: 'toys',
      brand: 'LEGO',
      avgPrice: 169,
      popularity: 'high'
    },
    '0045496596804': {
      name: 'Nintendo Switch OLED',
      category: 'gaming',
      brand: 'Nintendo',
      avgPrice: 349,
      popularity: 'high'
    }
  },

  // KSIĄŻKI & MEDIA
  media: {
    '9780007525546': {
      name: 'The Hobbit - J.R.R. Tolkien',
      category: 'books',
      brand: 'HarperCollins',
      avgPrice: 12.99,
      popularity: 'high'
    }
  }
}

/**
 * Lookup product by EAN
 */
function lookupEAN(ean) {
  for (const category in eanDatabase) {
    if (eanDatabase[category][ean]) {
      return {
        ean,
        ...eanDatabase[category][ean],
        sector: category
      }
    }
  }
  return null
}

/**
 * Get all products in category
 */
function getProductsByCategory(category) {
  return eanDatabase[category] || {}
}

/**
 * Search products by name
 */
function searchProducts(query) {
  const results = []
  const lowerQuery = query.toLowerCase()

  for (const category in eanDatabase) {
    for (const ean in eanDatabase[category]) {
      const product = eanDatabase[category][ean]
      if (product.name.toLowerCase().includes(lowerQuery) || 
          product.brand.toLowerCase().includes(lowerQuery)) {
        results.push({
          ean,
          ...product,
          sector: category
        })
      }
    }
  }

  return results
}

/**
 * Get popular products (for homepage/recommendations)
 */
function getPopularProducts(limit = 10) {
  const popular = []

  for (const category in eanDatabase) {
    for (const ean in eanDatabase[category]) {
      const product = eanDatabase[category][ean]
      if (product.popularity === 'high') {
        popular.push({
          ean,
          ...product,
          sector: category
        })
      }
    }
  }

  return popular.slice(0, limit)
}

/**
 * Add new product to database
 */
function addProduct(ean, productData, category) {
  if (!eanDatabase[category]) {
    eanDatabase[category] = {}
  }

  eanDatabase[category][ean] = productData
  return true
}

module.exports = {
  eanDatabase,
  lookupEAN,
  getProductsByCategory,
  searchProducts,
  getPopularProducts,
  addProduct
}
