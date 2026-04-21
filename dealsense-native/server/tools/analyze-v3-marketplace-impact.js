"use strict";

const fs = require("fs");
const path = require("path");

function readJson(p) {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function toNum(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function pctDiffBaseVsLowest(basePrice, lowestPrice) {
  const b = toNum(basePrice);
  const l = toNum(lowestPrice);
  if (b == null || b <= 0) return null;
  if (l == null || l <= 0) return null;
  return ((b - l) / b) * 100;
}

function normLower(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function getHostname(url) {
  const u = typeof url === "string" ? url.trim() : "";
  if (!u) return "";
  try {
    return new URL(u).hostname.toLowerCase();
  } catch (_) {
    return "";
  }
}

function nlRetailOnlyConfig() {
  const enabled = (() => {
    const v = String(process.env.MARKET_NL_RETAIL_ONLY || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  const defaultAllowedSellerSubstrings = [
    "bol.com",
    "coolblue",
    "mediamarkt",
    "bcc",
    "wehkamp",
    "amazon.nl",
    "alternate",
    "alternate.nl",
    "paradigit",
    "expert",
    "blokker",
    "gamma",
    "praxis",
    "karwei",
    "action",
    "hema",
  ];

  const extra = String(process.env.MARKET_NL_RETAIL_ALLOWED_SELLERS || "")
    .split(",")
    .map((s) => normLower(s))
    .filter(Boolean);

  return {
    enabled,
    allowedSellerSubstrings: Array.from(new Set([...defaultAllowedSellerSubstrings, ...extra].filter(Boolean))),
  };
}

function isLikelyNlRetailOffer(offer, cfg) {
  if (!cfg || cfg.enabled !== true) return true;
  if (!offer || typeof offer !== "object") return false;
  const seller = normLower(offer.seller || "");
  const host = getHostname(offer.url || "");

  // Seller looks like NL domain
  if (seller && (seller.endsWith(".nl") || seller.includes(".nl"))) return true;

  // Destination host is NL domain (excluding google wrappers)
  if (host && host !== "www.google.com" && host !== "google.com" && (host === "nl" || host.endsWith(".nl"))) return true;

  for (const s of cfg.allowedSellerSubstrings) {
    if (s && seller.includes(s)) return true;
  }

  return false;
}

function isMarketplaceOrUsed(offer) {
  if (!offer || typeof offer !== "object") return false;
  const seller = normLower(offer.seller || "");
  const title = normLower(offer.title || "");
  const host = getHostname(offer.url || "");

  const blockedSellerSubstrings = [
    "aliexpress",
    "ali express",
    "temu",
    "dhgate",
    "wish",
    "shein",
    "ebay",
    "marktplaats",
    "olx",
    "vinted",
    "back market",
    "backmarket",
  ];

  const blockedDomains = [
    "aliexpress.com",
    "temu.com",
    "dhgate.com",
    "wish.com",
    "shein.com",
    "ebay.com",
    "ebay.de",
    "ebay.nl",
    "marktplaats.nl",
    "olx.pl",
    "vinted.nl",
    "vinted.pl",
    "backmarket.com",
    "backmarket.nl",
  ];

  const usedRe = [
    /\bused\b/i,
    /\brefurb\b/i,
    /\brefurbished\b/i,
    /\brenewed\b/i,
    /\bsecond\s*hand\b/i,
    /\btweedehands\b/i,
    /\b2e\s*hands\b/i,
    /\boutlet\b/i,
    /\bopen\s*box\b/i,
    /\bdemo\b/i,
  ];

  for (const s of blockedSellerSubstrings) {
    if (s && seller.includes(s)) return true;
  }

  for (const d of blockedDomains) {
    if (!d) continue;
    if (host === d) return true;
    if (host.endsWith(`.${d}`)) return true;
  }

  const text = `${seller} ${title}`;
  if (usedRe.some((re) => re.test(text))) return true;

  return false;
}

function normalizeOffers(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .filter((o) => o && typeof o === "object")
    .map((o) => {
      const price = toNum(o.price);
      return {
        seller: typeof o.seller === "string" ? o.seller : "",
        price,
        url: typeof o.url === "string" ? o.url : "",
        title: typeof o.title === "string" ? o.title : "",
        _source: typeof o._source === "string" ? o._source : (typeof o.source === "string" ? o.source : ""),
      };
    })
    .filter((o) => o.price != null && o.price > 0);
}

function lowestPrice(offers) {
  const arr = normalizeOffers(offers);
  if (arr.length === 0) return null;
  return arr.reduce((m, o) => (o.price < m ? o.price : m), arr[0].price);
}

function blockedStats(offers) {
  const arr = normalizeOffers(offers);
  let blocked = 0;
  const sellers = new Map();
  for (const o of arr) {
    if (isMarketplaceOrUsed(o)) {
      blocked += 1;
      const k = normLower(o.seller || "") || "(unknown)";
      sellers.set(k, (sellers.get(k) || 0) + 1);
    }
  }
  const topBlockedSellers = Array.from(sellers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([seller, count]) => ({ seller, count }));
  return { total: arr.length, blocked, topBlockedSellers };
}

function filterBlocked(offers) {
  const cfg = nlRetailOnlyConfig();
  return normalizeOffers(offers)
    .filter((o) => !isMarketplaceOrUsed(o))
    .filter((o) => isLikelyNlRetailOffer(o, cfg));
}

function analyzeDataset(name, payload) {
  const results = Array.isArray(payload && payload.results) ? payload.results : [];
  const out = [];

  const globalSellerCounts = new Map();
  let totalOffers = 0;
  let totalBlockedOffers = 0;

  for (const r of results) {
    const product = String(r.product || r.query || "");
    const base = toNum(r.base_price ?? r.basePrice);

    const offers = Array.isArray(r.offers) ? r.offers : (Array.isArray(r.preview) ? r.preview : []);
    const norm = normalizeOffers(offers);
    const filtered = filterBlocked(offers);

    const lowAll = lowestPrice(norm);
    const lowFiltered = lowestPrice(filtered);

    const pctAll = base != null ? pctDiffBaseVsLowest(base, lowAll) : null;
    const pctFiltered = base != null ? pctDiffBaseVsLowest(base, lowFiltered) : null;

    const b = blockedStats(norm);
    totalOffers += b.total;
    totalBlockedOffers += b.blocked;
    for (const { seller, count } of b.topBlockedSellers) {
      globalSellerCounts.set(seller, (globalSellerCounts.get(seller) || 0) + count);
    }

    out.push({
      product,
      base_price: base,
      offers_total: norm.length,
      offers_blocked_marketplace_used: b.blocked,
      offers_after_filter: filtered.length,
      lowest_all: lowAll,
      lowest_filtered: lowFiltered,
      pctDiff_all: pctAll,
      pctDiff_filtered: pctFiltered,
    });
  }

  const covAll = out.filter((r) => r.lowest_all != null && r.pctDiff_all != null).length;
  const covFiltered = out.filter((r) => r.lowest_filtered != null && r.pctDiff_filtered != null).length;

  const avgPctAll = (() => {
    const vals = out.map((r) => r.pctDiff_all).filter((v) => typeof v === "number" && Number.isFinite(v));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  })();

  const avgPctFiltered = (() => {
    const vals = out.map((r) => r.pctDiff_filtered).filter((v) => typeof v === "number" && Number.isFinite(v));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  })();

  const topBlockedSellers = Array.from(globalSellerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([seller, count]) => ({ seller, count }));

  return {
    name,
    products: out.length,
    summary: {
      offers_total: totalOffers,
      offers_blocked_marketplace_used: totalBlockedOffers,
      blocked_ratio: totalOffers > 0 ? totalBlockedOffers / totalOffers : null,
      coverage_all: out.length ? covAll / out.length : null,
      coverage_filtered: out.length ? covFiltered / out.length : null,
      avgPct_all: avgPctAll,
      avgPct_filtered: avgPctFiltered,
    },
    topBlockedSellers,
    results: out,
  };
}

function safeDatasetNameFromFile(file) {
  const base = path.basename(file);
  return base.replace(/\.json$/i, "");
}

function listV3Outputs(toolsDir) {
  const files = fs.readdirSync(toolsDir);
  return files
    .filter((f) => /^v3.*output.*\.json$/i.test(f))
    .filter((f) => !/metrics\.json$/i.test(f))
    .map((f) => path.join(toolsDir, f));
}

function computeOverallTotals(datasets) {
  let productCasesFiltered = 0;
  let productCasesTotal = 0;
  const uniqueProductsFiltered = new Set();
  const uniqueProductsTotal = new Set();

  for (const ds of datasets) {
    const rows = Array.isArray(ds && ds.results) ? ds.results : [];
    for (const r of rows) {
      if (!r) continue;
      const prod = String(r.product || "");
      if (prod) uniqueProductsTotal.add(prod);
      productCasesTotal += 1;
      if (r.pctDiff_filtered != null) {
        productCasesFiltered += 1;
        if (prod) uniqueProductsFiltered.add(prod);
      }
    }
  }

  return {
    product_cases_total: productCasesTotal,
    product_cases_with_retail_result: productCasesFiltered,
    unique_products_total: uniqueProductsTotal.size,
    unique_products_with_retail_result: uniqueProductsFiltered.size,
  };
}

function main() {
  const toolsDir = __dirname;
  const files = listV3Outputs(toolsDir);
  const datasets = [];
  for (const file of files) {
    try {
      const payload = readJson(file);
      // Only accept objects with an array 'results'.
      if (!payload || typeof payload !== "object" || !Array.isArray(payload.results)) continue;
      datasets.push(analyzeDataset(safeDatasetNameFromFile(file), payload));
    } catch (_) {
      // ignore unreadable JSON
    }
  }

  const totals = computeOverallTotals(datasets);

  const nlRetailOnly = (() => {
    const v = String(process.env.MARKET_NL_RETAIL_ONLY || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const out = {
    ts: new Date().toISOString(),
    inputs: files.map((f) => ({ name: safeDatasetNameFromFile(f), file: path.basename(f) })),
    totals,
    datasets,
  };

  const outPath = path.join(
    toolsDir,
    nlRetailOnly ? "analyze-v3-marketplace-impact.nl-retail-only.output.json" : "analyze-v3-marketplace-impact.output.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(outPath);
}

main();
