/**
 * PRODUCT INFO - Get product name and category from SearchAPI
 */

const { fetchOffers: fetchSearchApiOffers } = require('../market/providers/searchapi');

/**
 * Get product info by EAN
 */
async function getProductInfo(ean) {
  try {
    // Use existing SearchAPI to get product info
    const offers = await fetchSearchApiOffers({
      query: ean,
      ean: ean,
      maxResults: 1,
      gl: 'nl',
      hl: 'nl'
    });
    
    if (!offers || offers.length === 0) {
      throw new Error('Product not found');
    }
    
    const firstOffer = offers[0];
    
    // Extract product name (remove shop name, price, etc.)
    let productName = firstOffer.title || '';
    
    // Clean up product name
    productName = productName
      .replace(/€\s*[\d,\.]+/g, '') // Remove prices
      .replace(/\s*-\s*[^-]+$/g, '') // Remove shop name at end
      .trim();
    
    // Detect category (basic)
    const category = detectCategoryFromName(productName);
    
    return {
      ean,
      name: productName,
      category,
      brand: extractBrand(productName),
      image: firstOffer.thumbnail || firstOffer.image,
      price: firstOffer.extracted_price
    };
    
  } catch (error) {
    console.error('[Product Info] Error:', error.message);
    
    // Fallback
    return {
      ean,
      name: `Product ${ean}`,
      category: 'electronics',
      brand: null,
      image: null,
      price: null
    };
  }
}

/**
 * Detect category from product name
 */
function detectCategoryFromName(name) {
  const nameLower = name.toLowerCase();
  
  // Electronics categories
  if (nameLower.match(/iphone|samsung|galaxy|smartphone|telefoon/)) return 'smartphones';
  if (nameLower.match(/laptop|macbook|notebook/)) return 'laptops';
  if (nameLower.match(/tablet|ipad/)) return 'tablets';
  if (nameLower.match(/tv|televisie|oled|qled/)) return 'tvs';
  if (nameLower.match(/camera|fotocamera|dslr/)) return 'cameras';
  if (nameLower.match(/headphone|koptelefoon|earbuds|oordopjes/)) return 'audio';
  if (nameLower.match(/speaker|luidspreker/)) return 'speakers';
  if (nameLower.match(/watch|horloge|smartwatch/)) return 'wearables';
  if (nameLower.match(/console|playstation|xbox|nintendo/)) return 'gaming';
  
  // Home appliances
  if (nameLower.match(/stofzuiger|vacuum|dyson/)) return 'vacuum_cleaners';
  if (nameLower.match(/koffie|espresso|nespresso/)) return 'coffee_makers';
  if (nameLower.match(/airfryer|frituur/)) return 'airfryers';
  if (nameLower.match(/wasmachine|washing/)) return 'washing_machines';
  
  return 'electronics';
}

/**
 * Extract brand from product name
 */
function extractBrand(name) {
  const brands = [
    'Apple', 'Samsung', 'Sony', 'LG', 'Philips', 'Bosch', 'Siemens',
    'Dyson', 'Nespresso', 'DeLonghi', 'Makita', 'DeWalt', 'Garmin',
    'Nike', 'Adidas', 'The North Face', 'Patagonia', 'Levi\'s'
  ];
  
  for (const brand of brands) {
    if (name.includes(brand)) {
      return brand;
    }
  }
  
  return null;
}

module.exports = {
  getProductInfo
};
