const axios = require("axios");

function safeJson(v) {
  try {
    return JSON.stringify(v);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj && Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : undefined;
  return out;
}

function getLowestOfferPrice(offers) {
  if (!Array.isArray(offers) || offers.length === 0) return null;
  let min = null;
  for (const o of offers) {
    if (!o || typeof o !== "object") continue;
    const p = typeof o.price === "number" ? o.price : Number(o.price);
    if (!Number.isFinite(p) || p <= 0) continue;
    if (min == null || p < min) min = p;
  }
  return min;
}

function pctDiffBaseVsLowest(basePrice, lowestPrice) {
  const b = typeof basePrice === "number" ? basePrice : Number(basePrice);
  const l = typeof lowestPrice === "number" ? lowestPrice : Number(lowestPrice);
  if (!Number.isFinite(b) || b <= 0) return null;
  if (!Number.isFinite(l) || l <= 0) return null;
  return ((b - l) / b) * 100;
}

async function runOne({ url, timeoutMs, product, i }) {
  const fingerprint = `test_echo10_${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`;

  const payload = {
    base_price: product.base_price,
    product_name: product.product_name,
    availability: "in_stock",
    ean: product.ean || undefined,
    url: product.url || undefined,
    fingerprint,
    debug: true,
  };

  const started = Date.now();
  let res;
  try {
    res = await axios.post(url, payload, {
      timeout: timeoutMs,
      headers: { "content-type": "application/json" },
      validateStatus: () => true,
    });
  } catch (err) {
    return {
      ok: false,
      http: null,
      durationMs: Date.now() - started,
      error: (err && err.message) || String(err),
      product: product.product_name,
    };
  }

  const data = res.data;
  const offers = data && typeof data === "object" ? data.offers : null;
  const offerCount = Array.isArray(offers) ? offers.length : null;
  const lowestOfferPrice = getLowestOfferPrice(offers);
  const pctDiff = pctDiffBaseVsLowest(product.base_price, lowestOfferPrice);

  return {
    ok: true,
    http: res.status,
    durationMs: Date.now() - started,
    product: product.product_name,
    base_price: product.base_price,
    offerCount,
    lowestOfferPrice,
    pctDiffBaseVsLowest: pctDiff,
    error: data && typeof data === "object" ? data.error || null : null,
    session:
      data && typeof data === "object"
        ? pick(data, ["session", "meta"])
        : null,
  };
}

async function main() {
  const url = process.env.ECHO_URL || "http://localhost:4000/api/echo/top3";
  const timeoutMs = Number(process.env.ECHO_TIMEOUT_MS || 15000);

  const products = [
    { product_name: "Apple iPhone 13 128GB", base_price: 699 },
    { product_name: "Sony WH-1000XM5", base_price: 299 },
    { product_name: "Samsung QE55 4K TV", base_price: 799 },
    { product_name: "Anker powerbank 20000mAh", base_price: 79 },
    { product_name: "Acer Aspire laptop 15 inch", base_price: 549 },
    { product_name: "iPad tablet 10.2", base_price: 369 },
    { product_name: "Bosch accuboormachine 18V", base_price: 129 },
    { product_name: "Gamma verf muurverf 10L", base_price: 59 },
    { product_name: "Hornbach tegels badkamer 30x60", base_price: 199 },
    { product_name: "Nike Air Max 90", base_price: 149 },
  ];

  const results = [];
  for (let i = 0; i < products.length; i += 1) {
    const r = await runOne({ url, timeoutMs, product: products[i], i });
    results.push(r);
  }

  console.log("url=", url);
  console.log("timeoutMs=", timeoutMs);
  for (const r of results) {
    console.log(
      safeJson({
        product: r.product,
        base_price: r.base_price,
        http: r.http,
        offerCount: r.offerCount,
        lowestOfferPrice: r.lowestOfferPrice,
        pctDiffBaseVsLowest: r.pctDiffBaseVsLowest,
        error: r.error,
        durationMs: r.durationMs,
      })
    );
  }
}

main().catch((err) => {
  console.error("test-echo-top3-10-products failed:", (err && err.message) || err);
  process.exitCode = 1;
});
