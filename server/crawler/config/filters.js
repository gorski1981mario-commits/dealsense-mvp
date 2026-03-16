// Filter Configuration - All Categories & Branches
// Parametry filtrów dla każdej kategorii DealSense

module.exports = {
  // PRODUKTY - ELEKTRONIKA
  electronics: {
    filters: {
      priceRange: {
        type: 'range',
        min: 0,
        max: 5000,
        step: 50,
        presets: [
          { min: 0, max: 100, label: '€0 - €100' },
          { min: 100, max: 250, label: '€100 - €250' },
          { min: 250, max: 500, label: '€250 - €500' },
          { min: 500, max: 1000, label: '€500 - €1000' },
          { min: 1000, max: 5000, label: '€1000+' }
        ]
      },
      brand: {
        type: 'multiselect',
        options: ['Apple', 'Samsung', 'Sony', 'LG', 'Philips', 'Bose', 'JBL', 'Logitech', 'HP', 'Dell', 'Asus', 'Acer']
      },
      condition: {
        type: 'select',
        options: ['new', 'refurbished', 'used'],
        labels: { new: 'Nieuw', refurbished: 'Refurbished', used: 'Gebruikt' }
      },
      rating: {
        type: 'range',
        min: 0,
        max: 5,
        step: 0.5,
        default: 4.0
      },
      inStock: {
        type: 'boolean',
        default: true,
        label: 'Op voorraad'
      },
      freeShipping: {
        type: 'boolean',
        default: false,
        label: 'Gratis verzending'
      },
      warranty: {
        type: 'select',
        options: ['1year', '2years', '3years', '5years'],
        labels: { '1year': '1 jaar', '2years': '2 jaar', '3years': '3 jaar', '5years': '5 jaar' }
      }
    }
  },

  // PRODUKTY - MODE/KLEDING
  fashion: {
    filters: {
      priceRange: {
        type: 'range',
        min: 0,
        max: 500,
        step: 10,
        presets: [
          { min: 0, max: 25, label: '€0 - €25' },
          { min: 25, max: 50, label: '€25 - €50' },
          { min: 50, max: 100, label: '€50 - €100' },
          { min: 100, max: 200, label: '€100 - €200' },
          { min: 200, max: 500, label: '€200+' }
        ]
      },
      brand: {
        type: 'multiselect',
        options: ['Nike', 'Adidas', 'H&M', 'Zara', 'Tommy Hilfiger', 'Calvin Klein', 'G-Star', 'Levi\'s', 'Only', 'Jack & Jones']
      },
      size: {
        type: 'multiselect',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        shoeSizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
      },
      color: {
        type: 'multiselect',
        options: ['Zwart', 'Wit', 'Grijs', 'Blauw', 'Rood', 'Groen', 'Geel', 'Roze', 'Bruin', 'Beige']
      },
      gender: {
        type: 'select',
        options: ['men', 'women', 'kids', 'unisex'],
        labels: { men: 'Heren', women: 'Dames', kids: 'Kinderen', unisex: 'Unisex' }
      },
      category: {
        type: 'select',
        options: ['shirts', 'pants', 'shoes', 'jackets', 'dresses', 'accessories'],
        labels: {
          shirts: 'Shirts',
          pants: 'Broeken',
          shoes: 'Schoenen',
          jackets: 'Jassen',
          dresses: 'Jurken',
          accessories: 'Accessoires'
        }
      },
      onSale: {
        type: 'boolean',
        default: false,
        label: 'Sale/Korting'
      },
      inStock: {
        type: 'boolean',
        default: true,
        label: 'Op voorraad'
      }
    }
  },

  // PRODUKTY - WONEN/MEUBELS
  furniture: {
    filters: {
      priceRange: {
        type: 'range',
        min: 0,
        max: 2000,
        step: 50,
        presets: [
          { min: 0, max: 100, label: '€0 - €100' },
          { min: 100, max: 250, label: '€100 - €250' },
          { min: 250, max: 500, label: '€250 - €500' },
          { min: 500, max: 1000, label: '€500 - €1000' },
          { min: 1000, max: 2000, label: '€1000+' }
        ]
      },
      room: {
        type: 'multiselect',
        options: ['Woonkamer', 'Slaapkamer', 'Keuken', 'Badkamer', 'Kantoor', 'Hal', 'Tuin']
      },
      category: {
        type: 'select',
        options: ['sofa', 'table', 'chair', 'bed', 'closet', 'lighting', 'decoration'],
        labels: {
          sofa: 'Banken',
          table: 'Tafels',
          chair: 'Stoelen',
          bed: 'Bedden',
          closet: 'Kasten',
          lighting: 'Verlichting',
          decoration: 'Decoratie'
        }
      },
      color: {
        type: 'multiselect',
        options: ['Zwart', 'Wit', 'Grijs', 'Bruin', 'Beige', 'Blauw', 'Groen']
      },
      material: {
        type: 'multiselect',
        options: ['Hout', 'Metaal', 'Stof', 'Leer', 'Glas', 'Kunststof']
      },
      style: {
        type: 'multiselect',
        options: ['Modern', 'Klassiek', 'Scandinavisch', 'Industrieel', 'Landelijk']
      },
      inStock: {
        type: 'boolean',
        default: true,
        label: 'Op voorraad'
      }
    }
  },

  // DIENSTEN - ENERGIE
  energie: {
    filters: {
      contractType: {
        type: 'select',
        options: ['variabel', 'vast1jaar', 'vast3jaar', 'vast5jaar'],
        labels: {
          variabel: 'Variabel',
          vast1jaar: 'Vast 1 jaar',
          vast3jaar: 'Vast 3 jaar',
          vast5jaar: 'Vast 5 jaar'
        }
      },
      greenEnergy: {
        type: 'boolean',
        default: false,
        label: 'Groene energie'
      },
      provider: {
        type: 'multiselect',
        options: ['Vattenfall', 'Essent', 'Eneco', 'Greenchoice', 'Vandebron', 'Budget Energie', 'Oxxio']
      },
      priceType: {
        type: 'select',
        options: ['total', 'electricity', 'gas'],
        labels: { total: 'Totaal', electricity: 'Alleen stroom', gas: 'Alleen gas' }
      },
      consumption: {
        type: 'range',
        min: 500,
        max: 10000,
        step: 500,
        unit: 'kWh',
        presets: [
          { value: 1500, label: 'Klein huishouden (1-2 personen)' },
          { value: 3000, label: 'Gemiddeld (3-4 personen)' },
          { value: 5000, label: 'Groot (5+ personen)' }
        ]
      }
    }
  },

  // DIENSTEN - VERZEKERINGEN (AUTO)
  verzekeringAuto: {
    filters: {
      coverageType: {
        type: 'select',
        options: ['WA', 'WA+', 'AllRisk'],
        labels: {
          WA: 'WA (Wettelijke Aansprakelijkheid)',
          'WA+': 'WA+ (Beperkt Casco)',
          AllRisk: 'All-Risk (Volledig Casco)'
        },
        required: true
      },
      deductible: {
        type: 'select',
        options: [0, 150, 250, 500, 1000],
        labels: {
          0: 'Geen eigen risico',
          150: '€150',
          250: '€250',
          500: '€500',
          1000: '€1000'
        },
        default: 250
      },
      provider: {
        type: 'multiselect',
        options: ['ANWB', 'Centraal Beheer', 'Aegon', 'Nationale Nederlanden', 'ASR', 'Allianz', 'Univé']
      },
      carAge: {
        type: 'range',
        min: 0,
        max: 20,
        step: 1,
        unit: 'jaar',
        label: 'Leeftijd auto'
      },
      mileage: {
        type: 'select',
        options: [5000, 10000, 15000, 20000, 30000, 50000],
        labels: {
          5000: 'Tot 5.000 km/jaar',
          10000: 'Tot 10.000 km/jaar',
          15000: 'Tot 15.000 km/jaar',
          20000: 'Tot 20.000 km/jaar',
          30000: 'Tot 30.000 km/jaar',
          50000: 'Meer dan 30.000 km/jaar'
        }
      },
      extras: {
        type: 'multiselect',
        options: ['rechtsbijstand', 'pechhulp', 'vervangendVervoer', 'inzittenden'],
        labels: {
          rechtsbijstand: 'Rechtsbijstand',
          pechhulp: 'Pechhulp',
          vervangendVervoer: 'Vervangend vervoer',
          inzittenden: 'Inzittendenverzekering'
        }
      }
    }
  },

  // DIENSTEN - VERZEKERINGEN (ZORG)
  verzekeringZorg: {
    filters: {
      coverageType: {
        type: 'select',
        options: ['basis', 'aanvullend', 'tand'],
        labels: {
          basis: 'Basisverzekering',
          aanvullend: 'Aanvullende verzekering',
          tand: 'Tandartsverzekering'
        },
        required: true
      },
      deductible: {
        type: 'select',
        options: [385, 500, 750, 885],
        labels: {
          385: '€385 (verplicht minimum)',
          500: '€500',
          750: '€750',
          885: '€885 (maximum)'
        },
        default: 385
      },
      provider: {
        type: 'multiselect',
        options: ['Zilveren Kruis', 'VGZ', 'CZ', 'Menzis', 'ONVZ', 'ASR', 'Nationale Nederlanden']
      },
      extras: {
        type: 'multiselect',
        options: ['fysiotherapie', 'tandarts', 'alternatief', 'bril', 'ziekenhuis'],
        labels: {
          fysiotherapie: 'Fysiotherapie',
          tandarts: 'Tandarts',
          alternatief: 'Alternatieve geneeswijzen',
          bril: 'Bril/lenzen',
          ziekenhuis: 'Ziekenhuisopname'
        }
      },
      reimbursement: {
        type: 'select',
        options: ['restitutiepolis', 'naturapolis', 'combinatie'],
        labels: {
          restitutiepolis: 'Restitutiepolis (vrije keuze)',
          naturapolis: 'Naturapolis (contractzorg)',
          combinatie: 'Combinatiepolis'
        }
      }
    }
  },

  // FINANCE - HYPOTHEKEN
  hypotheken: {
    filters: {
      loanAmount: {
        type: 'range',
        min: 50000,
        max: 1000000,
        step: 10000,
        unit: '€',
        required: true
      },
      duration: {
        type: 'select',
        options: [10, 15, 20, 25, 30],
        labels: {
          10: '10 jaar',
          15: '15 jaar',
          20: '20 jaar',
          25: '25 jaar',
          30: '30 jaar'
        },
        default: 30
      },
      fixedPeriod: {
        type: 'select',
        options: [1, 5, 10, 15, 20, 30],
        labels: {
          1: '1 jaar rentevast',
          5: '5 jaar rentevast',
          10: '10 jaar rentevast',
          15: '15 jaar rentevast',
          20: '20 jaar rentevast',
          30: '30 jaar rentevast'
        }
      },
      mortgageType: {
        type: 'select',
        options: ['annuiteit', 'lineair', 'aflossingsvrij'],
        labels: {
          annuiteit: 'Annuïteitenhypotheek',
          lineair: 'Lineaire hypotheek',
          aflossingsvrij: 'Aflossingsvrije hypotheek'
        }
      },
      nhg: {
        type: 'boolean',
        default: false,
        label: 'Nationale Hypotheek Garantie (NHG)'
      },
      provider: {
        type: 'multiselect',
        options: ['ING', 'Rabobank', 'ABN AMRO', 'SNS', 'Obvion', 'Florius', 'Aegon', 'NN']
      }
    }
  },

  // FINANCE - LENINGEN
  leningen: {
    filters: {
      loanAmount: {
        type: 'range',
        min: 1000,
        max: 75000,
        step: 1000,
        unit: '€',
        required: true
      },
      duration: {
        type: 'select',
        options: [12, 24, 36, 48, 60, 72, 84, 96, 120],
        labels: {
          12: '1 jaar',
          24: '2 jaar',
          36: '3 jaar',
          48: '4 jaar',
          60: '5 jaar',
          72: '6 jaar',
          84: '7 jaar',
          96: '8 jaar',
          120: '10 jaar'
        },
        default: 60
      },
      purpose: {
        type: 'select',
        options: ['auto', 'verbouwing', 'studie', 'vrij'],
        labels: {
          auto: 'Auto',
          verbouwing: 'Verbouwing',
          studie: 'Studie',
          vrij: 'Vrij te besteden'
        }
      },
      provider: {
        type: 'multiselect',
        options: ['ING', 'Rabobank', 'ABN AMRO', 'Moneyou', 'Santander', 'Credivance']
      },
      maxAPR: {
        type: 'range',
        min: 0,
        max: 15,
        step: 0.5,
        unit: '%',
        label: 'Maximaal JKP (Jaarkostenpercentage)'
      }
    }
  },

  // FINANCE - LEASING
  leasing: {
    filters: {
      carType: {
        type: 'select',
        options: ['new', 'used', 'electric', 'hybrid'],
        labels: {
          new: 'Nieuw',
          used: 'Occasion',
          electric: 'Elektrisch',
          hybrid: 'Hybride'
        }
      },
      duration: {
        type: 'select',
        options: [24, 36, 48, 60, 72],
        labels: {
          24: '2 jaar',
          36: '3 jaar',
          48: '4 jaar',
          60: '5 jaar',
          72: '6 jaar'
        },
        default: 48
      },
      mileage: {
        type: 'select',
        options: [10000, 15000, 20000, 25000, 30000, 40000],
        labels: {
          10000: '10.000 km/jaar',
          15000: '15.000 km/jaar',
          20000: '20.000 km/jaar',
          25000: '25.000 km/jaar',
          30000: '30.000 km/jaar',
          40000: '40.000 km/jaar'
        }
      },
      downPayment: {
        type: 'range',
        min: 0,
        max: 20000,
        step: 1000,
        unit: '€',
        label: 'Aanbetaling'
      },
      provider: {
        type: 'multiselect',
        options: ['DirectLease', 'Leaseplan', 'Alphabet', 'Athlon', 'Arval']
      },
      fuelType: {
        type: 'multiselect',
        options: ['benzine', 'diesel', 'elektrisch', 'hybride', 'lpg'],
        labels: {
          benzine: 'Benzine',
          diesel: 'Diesel',
          elektrisch: 'Elektrisch',
          hybride: 'Hybride',
          lpg: 'LPG'
        }
      }
    }
  },

  // DIENSTEN - TELECOM
  telecom: {
    filters: {
      serviceType: {
        type: 'select',
        options: ['mobile', 'internet', 'tv', 'bundle'],
        labels: {
          mobile: 'Mobiel',
          internet: 'Internet',
          tv: 'TV',
          bundle: 'Alles-in-1'
        },
        required: true
      },
      dataAmount: {
        type: 'select',
        options: [1, 5, 10, 20, 50, 999999],
        labels: {
          1: '1 GB',
          5: '5 GB',
          10: '10 GB',
          20: '20 GB',
          50: '50 GB',
          999999: 'Onbeperkt'
        }
      },
      contractLength: {
        type: 'select',
        options: [1, 12, 24],
        labels: {
          1: '1 maand',
          12: '1 jaar',
          24: '2 jaar'
        }
      },
      provider: {
        type: 'multiselect',
        options: ['KPN', 'Ziggo', 'Odido', 'Vodafone', 'Tele2', 'Youfone', 'Simyo', 'Ben']
      },
      speed: {
        type: 'select',
        options: [50, 100, 200, 500, 1000],
        labels: {
          50: '50 Mbps',
          100: '100 Mbps',
          200: '200 Mbps',
          500: '500 Mbps',
          1000: '1 Gbps'
        }
      },
      extras: {
        type: 'multiselect',
        options: ['unlimited', 'international', '5g', 'tv', 'phone'],
        labels: {
          unlimited: 'Onbeperkt bellen/sms',
          international: 'Internationaal bellen',
          '5g': '5G netwerk',
          tv: 'TV pakket',
          phone: 'Vaste telefoon'
        }
      }
    }
  }
}
