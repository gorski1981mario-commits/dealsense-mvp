"use strict";

function withSource(offers, source) {
  return (Array.isArray(offers) ? offers : []).map((o) => ({ ...o, _source: source }));
}

function buildMockOffersForProductName(productName, mockOffers) {
  const name = typeof productName === "string" ? productName.trim().toLowerCase() : "";
  if (!name) return withSource(mockOffers, "mock");

  // Powerbanks: a small, stable example set.
  if (name.includes("powerbank") || name.includes("power bank")) {
    return withSource(
      [
        {
          seller: "bol.com",
          price: 69.99,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.5,
          reviewCount: 320,
          url: "https://example.com/powerbank/1",
          deliveryTime: 1,
        },
        {
          seller: "Coolblue",
          price: 79.95,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.3,
          reviewCount: 180,
          url: "https://example.com/powerbank/2",
          deliveryTime: 2,
        },
        {
          seller: "MediaMarkt",
          price: 59.99,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.8,
          reviewCount: 45,
          url: "https://example.com/powerbank/3",
          deliveryTime: 3,
        },
      ],
      "mock"
    );
  }

  // Laptops: keep legacy behavior (default mock set).
  if (
    name.includes("laptop") ||
    name.includes("notebook") ||
    name.includes("acer") ||
    name.includes("aspire")
  ) {
    return withSource(mockOffers, "mock");
  }

  // Phones (smartphones)
  if (name.includes("iphone") || name.includes("smartphone") || name.includes("telefon") || name.includes("phone")) {
    return withSource(
      [
        {
          seller: "Coolblue",
          price: 689.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.6,
          reviewCount: 8200,
          url: "https://example.com/phone/1",
          deliveryTime: 1,
        },
        {
          seller: "MediaMarkt",
          price: 699.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.2,
          reviewCount: 2400,
          url: "https://example.com/phone/2",
          deliveryTime: 2,
        },
        {
          seller: "bol.com",
          price: 649.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.9,
          reviewCount: 180,
          url: "https://example.com/phone/3",
          deliveryTime: 3,
        },
      ],
      "mock"
    );
  }

  // Headphones
  if (name.includes("wh-1000") || name.includes("koptelefoon") || name.includes("słuchaw") || name.includes("headphone")) {
    return withSource(
      [
        {
          seller: "Coolblue",
          price: 289.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.5,
          reviewCount: 6200,
          url: "https://example.com/headphones/1",
          deliveryTime: 1,
        },
        {
          seller: "bol.com",
          price: 299.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.3,
          reviewCount: 2100,
          url: "https://example.com/headphones/2",
          deliveryTime: 2,
        },
        {
          seller: "Bax Music",
          price: 279.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.1,
          reviewCount: 220,
          url: "https://example.com/headphones/3",
          deliveryTime: 3,
        },
      ],
      "mock"
    );
  }

  // TVs
  if (name.includes(" tv") || name.includes("televis") || name.includes("qled") || name.includes("oled") || name.includes("4k")) {
    return withSource(
      [
        {
          seller: "MediaMarkt",
          price: 779.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.4,
          reviewCount: 980,
          url: "https://example.com/tv/1",
          deliveryTime: 2,
        },
        {
          seller: "Coolblue",
          price: 799.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.6,
          reviewCount: 1600,
          url: "https://example.com/tv/2",
          deliveryTime: 1,
        },
        {
          seller: "bol.com",
          price: 749.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.9,
          reviewCount: 120,
          url: "https://example.com/tv/3",
          deliveryTime: 4,
        },
      ],
      "mock"
    );
  }

  // Construction / tools
  if (name.includes("boor") || name.includes("accuboormachine") || name.includes("drill") || name.includes("bosch")) {
    return withSource(
      [
        {
          seller: "Hornbach",
          price: 119.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.4,
          reviewCount: 1800,
          url: "https://example.com/tool/1",
          deliveryTime: 2,
        },
        {
          seller: "Gamma",
          price: 129.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.1,
          reviewCount: 560,
          url: "https://example.com/tool/2",
          deliveryTime: 3,
        },
        {
          seller: "Praxis",
          price: 109.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.9,
          reviewCount: 220,
          url: "https://example.com/tool/3",
          deliveryTime: 4,
        },
      ],
      "mock"
    );
  }

  // Shoes
  if (name.includes("nike") || name.includes("air max") || name.includes("sneaker") || name.includes("schoen")) {
    return withSource(
      [
        {
          seller: "Zalando",
          price: 139.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.4,
          reviewCount: 3400,
          url: "https://example.com/shoes/1",
          deliveryTime: 2,
        },
        {
          seller: "Wehkamp",
          price: 149.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.2,
          reviewCount: 1100,
          url: "https://example.com/shoes/2",
          deliveryTime: 1,
        },
        {
          seller: "bol.com",
          price: 129.0,
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.8,
          reviewCount: 90,
          url: "https://example.com/shoes/3",
          deliveryTime: 4,
        },
      ],
      "mock"
    );
  }

  return withSource(mockOffers, "mock");
}

module.exports = {
  buildMockOffersForProductName,
};
