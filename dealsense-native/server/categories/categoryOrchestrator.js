/**
 * Category Orchestrator
 * Rozdziela zapytania do odpowiednich endpointów w zależności od kategorii
 */

const { categorizeProduct, getCategoryConfig } = require('./categoryConfig');
const { fetchMarketOffers } = require('../market-api');

/**
 * Long-tail query generator
 * Generuje 2 warianty zapytań dla większej liczby ofert (oszczędza limity API)
 */
function generateLongTailQueries(productName, categoryKey) {
  const queries = [productName]; // Główne zapytanie

  // Kategoria-specific warianty (tylko 1 dodatkowe zapytanie)
  if (categoryKey === 'ELECTRONICS') {
    queries.push(productName + ' best price');
  } else if (categoryKey === 'FASHION') {
    queries.push(productName + ' sale');
  } else if (categoryKey === 'BOOKS') {
    queries.push(productName + ' paperback');
  } else if (categoryKey === 'BEAUTY') {
    queries.push(productName + ' discount');
  } else if (categoryKey === 'TOOLS') {
    queries.push(productName + ' cordless');
  } else if (categoryKey === 'HOME') {
    queries.push(productName + ' sale');
  } else if (categoryKey === 'SPORTS') {
    queries.push(productName + ' discount');
  }

  return queries;
}

/**
 * Główna funkcja orchestratora
 * Rozdziela zapytanie do odpowiedniego endpointu w zależności od kategorii
 */
async function fetchOffersByCategory(productName, ean = null, basePrice = null, baseSeller = null) {
  // Kategoryzacja produktu
  const categoryKey = categorizeProduct(productName);
  const categoryConfig = getCategoryConfig(categoryKey);

  console.log(`[CategoryOrchestrator] Product: ${productName}`);
  console.log(`[CategoryOrchestrator] Category: ${categoryConfig.name}`);
  console.log(`[CategoryOrchestrator] Filters: ${JSON.stringify(categoryConfig.filters)}`);

  // Generuj long-tail queries
  const queries = generateLongTailQueries(productName, categoryKey);
  console.log(`[CategoryOrchestrator] Long-tail queries: ${queries.length}`);

  // Pobierz oferty dla wszystkich zapytań i scal wyniki
  let allOffers = [];
  for (const query of queries) {
    const offers = await fetchMarketOffers(query, ean);
    if (offers && offers.length > 0) {
      allOffers = allOffers.concat(offers);
    }
  }

  // Usuń duplikaty po sellerze i URL
  const dedupedOffers = [];
  const seenOffers = new Set();
  for (const offer of allOffers) {
    const key = offer.seller + offer.url;
    if (!seenOffers.has(key)) {
      seenOffers.add(key);
      dedupedOffers.push(offer);
    }
  }

  console.log(`[CategoryOrchestrator] Total offers before filters: ${allOffers.length}`);
  console.log(`[CategoryOrchestrator] Deduped offers: ${dedupedOffers.length}`);

  if (!dedupedOffers || dedupedOffers.length === 0) {
    return {
      success: false,
      category: categoryConfig.name,
      offers: [],
      message: 'No offers found'
    };
  }

  // Zastosuj filtry specyficzne dla kategorii
  const filteredOffers = applyCategoryFilters(dedupedOffers, categoryConfig, basePrice);

  // Sortuj wg ceny (najniższa najpierw)
  const sortedOffers = filteredOffers.sort((a, b) => a.price - b.price);

  // Deduplikacja po sellerze (druga deduplikacja po filtrach)
  const dedupedOffersFiltered = [];
  const seenSellers = new Set();
  for (const offer of sortedOffers) {
    const seller = offer.seller ? offer.seller.toLowerCase() : '';
    if (!seenSellers.has(seller)) {
      seenSellers.add(seller);
      dedupedOffersFiltered.push(offer);
    }
  }

  // Dodaj sklep bazowy jeśli istnieje
  let finalOffers = dedupedOffersFiltered;
  if (baseSeller) {
    const baseSellerOffer = {
      seller: baseSeller,
      price: basePrice,
      currency: 'EUR',
      _source: 'base'
    };

    // Usuń oferty z tego samego sklepu co baseSeller
    const withoutBaseSeller = dedupedOffersFiltered.filter(o => {
      const seller = o.seller ? o.seller.toLowerCase() : '';
      const baseSellerLower = baseSeller.toLowerCase();
      return !seller.includes(baseSellerLower) && !baseSellerLower.includes(seller);
    });

    finalOffers = [baseSellerOffer, ...withoutBaseSeller];
  }

  return {
    success: true,
    category: categoryConfig.name,
    offers: finalOffers.slice(0, 4), // Top 4 oferty
    totalOffers: finalOffers.length
  };
}

/**
 * Zastosuj filtry specyficzne dla kategorii
 */
function applyCategoryFilters(offers, categoryConfig, basePrice) {
  if (!categoryConfig.enabled) {
    return offers;
  }

  const filters = categoryConfig.filters;

  return offers.filter(offer => {
    // Price range check
    if (basePrice) {
      const minPrice = basePrice * filters.minPriceRatio;
      const maxPrice = basePrice * filters.maxPriceRatio;
      const price = offer.price || 0;
      if (price < minPrice || price > maxPrice) {
        return false;
      }
    }

    // Blocked keywords check
    if (filters.blockedKeywords && filters.blockedKeywords.length > 0) {
      const txt = `${offer.title || ''} ${offer.seller || ''}`.toLowerCase();
      for (const kw of filters.blockedKeywords) {
        if (txt.includes(kw.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });
}

module.exports = {
  fetchOffersByCategory,
  generateLongTailQueries
};
