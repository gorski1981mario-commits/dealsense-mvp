"use strict";

const assert = require("assert");

function isIso(s) {
  if (typeof s !== "string") return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && s.includes("T") && s.endsWith("Z");
}

function assertQuote(q) {
  assert.ok(q && typeof q === "object", "quote must be object");

  assert.ok(typeof q.offerId === "string" && q.offerId.length > 0, "offerId required");
  assert.ok(typeof q.type === "string" && q.type.length > 0, "type required");

  assert.ok(q.price && typeof q.price === "object", "price required");
  assert.ok(Number.isFinite(Number(q.price.amount)), "price.amount must be number");
  assert.ok(typeof q.price.currency === "string" && q.price.currency.length >= 3, "price.currency required");
  assert.ok(typeof q.price.period === "string" && q.price.period.length > 0, "price.period required");

  assert.ok(q.basePrice && typeof q.basePrice === "object", "basePrice required");
  assert.ok(Number.isFinite(Number(q.basePrice.amount)), "basePrice.amount must be number");
  assert.ok(typeof q.basePrice.currency === "string" && q.basePrice.currency.length >= 3, "basePrice.currency required");
  assert.ok(typeof q.basePrice.period === "string" && q.basePrice.period.length > 0, "basePrice.period required");

  assert.ok(q.savings && typeof q.savings === "object", "savings required");
  assert.ok(Number.isFinite(Number(q.savings.amount)), "savings.amount must be number");
  assert.ok(typeof q.savings.currency === "string" && q.savings.currency.length >= 3, "savings.currency required");
  assert.ok(typeof q.savings.period === "string" && q.savings.period.length > 0, "savings.period required");

  assert.ok(isIso(q.startDate), "startDate must be ISO string");
  assert.ok(isIso(q.endDate), "endDate must be ISO string");
  assert.ok(isIso(q.quoteValidUntil), "quoteValidUntil must be ISO string");

  assert.ok(q.review && typeof q.review === "object", "review required");
  assert.ok(Number.isFinite(Number(q.review.score)), "review.score must be number");
  assert.ok(Number.isFinite(Number(q.review.count)), "review.count must be number");

  assert.ok(Number.isFinite(Number(q.matchScore)), "matchScore must be number");
  assert.ok(Number.isFinite(Number(q.overallScore)), "overallScore must be number");

  assert.strictEqual(q.isComparable, true, "isComparable must be true");
}

function main() {
  const start = new Date();
  const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sample = {
    offerId: "travel:basic:150",
    type: "travel",
    price: { amount: 25.5, currency: "EUR", period: "monthly" },
    basePrice: { amount: 30, currency: "EUR", period: "monthly" },
    savings: { amount: 4.5, currency: "EUR", period: "monthly" },
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    quoteValidUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    baseRule: { requireLowerThanBase: true },
    comparableKey: `travel:monthly:1:${start.toISOString()}:${end.toISOString()}`,
    matchScore: 0.8,
    review: { score: 4.4, count: 500 },
    overallScore: 0.82,
    isComparable: true,
    isCheaperThanBase: true,
  };

  assertQuote(sample);
  console.log("OK: insurance contract guard passed.");
}

main();
