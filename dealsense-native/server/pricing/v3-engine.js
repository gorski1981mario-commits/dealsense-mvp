"use strict";

function getVariant() {
  const v = String(process.env.PRICING_V3_VARIANT || "").trim().toLowerCase();
  return v === "next" ? "next" : "baseline";
}

function loadEngine() {
  const variant = getVariant();
  return variant === "next" ? require("./v3-next-engine") : require("./v3-test-engine");
}

function analyzeOffersV3Strict(offers, queryPrice, queryText, config) {
  const engine = loadEngine();
  return engine.analyzeOffersV3Strict(offers, queryPrice, queryText, config);
}

module.exports = {
  analyzeOffersV3Strict,
  getVariant,
};
