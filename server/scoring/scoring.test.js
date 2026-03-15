"use strict";

const assert = require("assert");
const { isScam } = require("./isScam");
const { getDealScore } = require("./dealScore");
const {
  dedupeOffersForSelection,
  pickTopUniqueSellers,
  sortOffersByPriceAndPopularity,
} = require("./selection");
const { parseDeliveryDays, filterByMaxDeliveryDays } = require("./delivery");

function testDealScoreRegression() {
  const base = 100;

  assert.deepStrictEqual(getDealScore(0, base, 0), { dealScore: 3, dealConfidence: "laag" });

  assert.deepStrictEqual(getDealScore(3, base, 1), { dealScore: 5, dealConfidence: "medium" });
  assert.deepStrictEqual(getDealScore(5, base, 1), { dealScore: 6, dealConfidence: "medium" });
  assert.deepStrictEqual(getDealScore(7, base, 1), { dealScore: 7, dealConfidence: "medium" });
  assert.deepStrictEqual(getDealScore(10, base, 3), { dealScore: 8, dealConfidence: "hoog" });
  assert.deepStrictEqual(getDealScore(15, base, 3), { dealScore: 9, dealConfidence: "hoog" });
}

function testIsScam() {
  // Default env thresholds: rating>=3.5, reviews>=30, min price ratio 0.35
  const marketAvg = 100;

  assert.strictEqual(
    isScam({ seller: "Good", price: 80, reviewScore: 4.4, reviewCount: 200 }, marketAvg),
    false,
    "good offer should not be scam"
  );

  assert.strictEqual(
    isScam({ seller: "LowRating", price: 80, reviewScore: 3.4, reviewCount: 999 }, marketAvg),
    true,
    "rating below min should be scam"
  );

  assert.strictEqual(
    isScam({ seller: "LowReviews", price: 80, reviewScore: 4.9, reviewCount: 5 }, marketAvg),
    true,
    "too few reviews should be scam (without niche exception)"
  );

  assert.strictEqual(
    isScam({ seller: "Outlier", price: 20, reviewScore: 4.8, reviewCount: 500 }, marketAvg),
    true,
    "too cheap vs market average should be scam"
  );
}

function testDeliveryParser() {
  assert.strictEqual(parseDeliveryDays("morgen"), 1);
  assert.strictEqual(parseDeliveryDays("tomorrow"), 1);
  assert.strictEqual(parseDeliveryDays("1-3 werkdagen"), 3);
  assert.strictEqual(parseDeliveryDays("2 dagen"), 2);

  const list = [
    { seller: "A", price: 10, deliveryTime: 2 },
    { seller: "B", price: 11, deliveryTime: 4 },
    { seller: "C", price: 12 },
  ];
  const filtered = filterByMaxDeliveryDays(list, 3);
  assert.strictEqual(filtered.length, 2);
  assert.strictEqual(filtered.some((o) => o.seller === "B"), false);
}

function testSelection() {
  const offers = [
    { seller: "ShopA", price: 100, reviewScore: 4.5, reviewCount: 100, url: "https://a.test/p" },
    { seller: "ShopA", price: 100, reviewScore: 4.5, reviewCount: 100, url: "https://a.test/p" },
    { seller: "ShopB", price: 90, reviewScore: 4.1, reviewCount: 50, url: "https://b.test/p" },
    { seller: "ShopC", price: 95, reviewScore: 4.9, reviewCount: 10, url: "https://c.test/p" },
  ];

  const deduped = dedupeOffersForSelection(offers);
  assert.strictEqual(deduped.length, 3, "dedupe should remove duplicates");

  const sorted = sortOffersByPriceAndPopularity(deduped);
  assert.strictEqual(sorted[0].seller, "ShopB", "cheapest should come first");

  const top2 = pickTopUniqueSellers(sorted, 2);
  assert.strictEqual(top2.length, 2);
  assert.strictEqual(new Set(top2.map((o) => o.seller)).size, 2, "unique sellers");
}

function run() {
  testIsScam();
  testDeliveryParser();
  testSelection();
  testDealScoreRegression();
  console.log("OK: scoring tests passed");
}

run();
