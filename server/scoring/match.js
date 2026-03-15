"use strict";

function computeTitleMatchScore(queryText, offerTitle) {
  const q = typeof queryText === "string" ? queryText.trim().toLowerCase() : "";
  const t = typeof offerTitle === "string" ? offerTitle.trim().toLowerCase() : "";
  if (!q || !t) return 0;
  const qTokens = q
    .split(/\s+/)
    .map((s) => s.replace(/[^a-z0-9]/gi, ""))
    .filter((s) => s.length >= 3);
  if (qTokens.length === 0) return 0;
  let hits = 0;
  for (const tok of qTokens) {
    if (t.includes(tok)) hits += 1;
  }
  return hits / qTokens.length;
}

module.exports = {
  computeTitleMatchScore,
};
