"use strict";

// DealScore: 0–10 + confidence (hoog/medium/laag) – fingerprint Dealsense
function getDealScore(savings, basePrice, offerCount) {
  const pct = basePrice > 0 ? (savings / basePrice) * 100 : 0;
  let score = 3;
  if (pct >= 15) score = 9;
  else if (pct >= 10) score = 8;
  else if (pct >= 7) score = 7;
  else if (pct >= 5) score = 6;
  else if (pct >= 3) score = 5;
  const n = offerCount || 0;
  const confidence = n >= 3 ? "hoog" : n >= 1 ? "medium" : "laag";
  return { dealScore: score, dealConfidence: confidence };
}

module.exports = { getDealScore };
