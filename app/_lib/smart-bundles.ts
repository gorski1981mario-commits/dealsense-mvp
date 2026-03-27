// Smart Bundles - Suggest complementary products PRZED zakupem
// AOV BOOSTER: +50% average order value
// FLOW: User wybiera TV → pokazujemy accessories → user wybiera co chce → jeden bundle checkout

export interface BundleProduct {
  name: string // Nazwa produktu (po holendersku!)
  category: string
  basePrice: number
  dealPrice: number
  savings: number
  // CORE VALUE: NIGDY nie pokazujemy sklepu przed akceptacją bundla!
  // Sklep pokazujemy DOPIERO po: 1) akceptacja bundla, 2) biometric, 3) paywall
  shopHidden: string // Ukryty sklep (pokazujemy dopiero po payment)
  ean?: string
  selected: boolean // User wybiera czy chce ten item
  
  // UPROSZCZONE: pokazujemy TYLKO nazwę + cenę
  // NIE pokazujemy: rating, reviews, features, images (przed akceptacją)
}

export interface SmartBundle {
  mainProduct: string
  mainProductPrice: number
  bundleProducts: BundleProduct[]
  selectedProducts: BundleProduct[] // Tylko wybrane przez usera
  totalBasePrice: number // Suma base prices (main + selected)
  totalDealPrice: number // Suma deal prices (main + selected)
  totalSavings: number // Suma oszczędności
  bundleDiscount: number // Extra discount za bundle (opcjonalnie)
}

export class SmartBundles {
  /**
   * GET BUNDLE SUGGESTIONS
   * Based on main product, suggest complementary items
   * POKAZUJE SIĘ PRZED ZAKUPEM!
   */
  static getBundleSuggestions(
    mainProduct: string,
    mainProductPrice: number,
    category: string
  ): SmartBundle | null {
    // TODO: In production, this would call ML API
    // For now, use category-based rules

    const bundles = this.getCategoryBundles(category)
    if (!bundles) return null

    const bundleProducts = bundles.map(b => ({
      ...b,
      savings: b.basePrice - b.dealPrice,
      selected: false // Domyślnie nie wybrane
    }))

    return {
      mainProduct,
      mainProductPrice,
      bundleProducts,
      selectedProducts: [],
      totalBasePrice: mainProductPrice,
      totalDealPrice: mainProductPrice,
      totalSavings: 0,
      bundleDiscount: 0
    }
  }

  /**
   * CALCULATE BUNDLE TOTAL
   * Oblicza total dla wybranych produktów
   */
  static calculateBundleTotal(bundle: SmartBundle): SmartBundle {
    const selectedProducts = bundle.bundleProducts.filter(p => p.selected)
    
    const totalBasePrice = bundle.mainProductPrice + 
      selectedProducts.reduce((sum, p) => sum + p.basePrice, 0)
    
    const totalDealPrice = bundle.mainProductPrice + 
      selectedProducts.reduce((sum, p) => sum + p.dealPrice, 0)
    
    const totalSavings = totalBasePrice - totalDealPrice

    return {
      ...bundle,
      selectedProducts,
      totalBasePrice,
      totalDealPrice,
      totalSavings,
      bundleDiscount: 0 // Możemy dodać extra discount później
    }
  }

  /**
   * TOGGLE PRODUCT SELECTION
   * User wybiera/odznacza produkt
   */
  static toggleProductSelection(
    bundle: SmartBundle,
    productIndex: number
  ): SmartBundle {
    const updatedProducts = [...bundle.bundleProducts]
    updatedProducts[productIndex].selected = !updatedProducts[productIndex].selected

    const updatedBundle = {
      ...bundle,
      bundleProducts: updatedProducts
    }

    return this.calculateBundleTotal(updatedBundle)
  }

  /**
   * CATEGORY-BASED BUNDLES
   */
  private static getCategoryBundles(category: string): Omit<BundleProduct, 'selected'>[] | null {
    const bundles: Record<string, Omit<BundleProduct, 'selected'>[]> = {
      // Smartphone bundles
      smartphone: [
        {
          name: 'Telefoonhoesje',
          category: 'accessories',
          basePrice: 30,
          dealPrice: 15,
          savings: 15,
          shopHidden: 'Bol.com'
        },
        {
          name: 'Schermbeschermer',
          category: 'accessories',
          basePrice: 20,
          dealPrice: 8,
          savings: 12,
          shopHidden: 'Coolblue'
        },
        {
          name: 'Snellader',
          category: 'accessories',
          basePrice: 25,
          dealPrice: 12,
          savings: 13,
          shopHidden: 'MediaMarkt'
        }
      ],

      // Laptop bundles
      laptop: [
        {
          name: 'Laptoptas',
          category: 'accessories',
          basePrice: 50,
          dealPrice: 25,
          savings: 25,
          shopHidden: 'Bol.com'
        },
        {
          name: 'Draadloze Muis',
          category: 'accessories',
          basePrice: 35,
          dealPrice: 18,
          savings: 17,
          shopHidden: 'Coolblue'
        },
        {
          name: 'USB-C Hub',
          category: 'accessories',
          basePrice: 40,
          dealPrice: 20,
          savings: 20,
          shopHidden: 'Alternate.nl'
        }
      ],

      // TV bundles
      tv: [
        {
          name: 'HDMI Kabel 2.1',
          category: 'accessories',
          basePrice: 25,
          dealPrice: 10,
          savings: 15,
          shopHidden: 'Bol.com'
        },
        {
          name: 'Soundbar Samsung HW-Q60B',
          category: 'audio',
          basePrice: 150,
          dealPrice: 99,
          savings: 51,
          shopHidden: 'MediaMarkt'
        },
        {
          name: 'Muurbeugel (VESA 400x400)',
          category: 'accessories',
          basePrice: 40,
          dealPrice: 20,
          savings: 20,
          shopHidden: 'Coolblue'
        }
      ],

      // Camera bundles
      camera: [
        {
          name: 'SD Kaart 128GB',
          category: 'accessories',
          basePrice: 40,
          dealPrice: 20,
          savings: 20,
          shopHidden: 'Bol.com'
        },
        {
          name: 'Cameratas',
          category: 'accessories',
          basePrice: 60,
          dealPrice: 30,
          savings: 30,
          shopHidden: 'Coolblue'
        },
        {
          name: 'Extra Batterij',
          category: 'accessories',
          basePrice: 50,
          dealPrice: 25,
          savings: 25,
          shopHidden: 'CameraNU'
        }
      ]
    }

    return bundles[category.toLowerCase()] || null
  }

  /**
   * TRACK BUNDLE PURCHASE
   */
  static trackBundlePurchase(
    userId: string,
    mainProduct: string,
    bundleProducts: string[]
  ): void {
    const purchase = {
      userId,
      mainProduct,
      bundleProducts,
      timestamp: Date.now()
    }

    console.log('[Smart Bundles] Bundle purchased:', purchase)

    // TODO: Send to analytics
  }
}

