const axios = require("axios");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a || typeof a !== "string") continue;
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next != null && typeof next === "string" && !next.startsWith("--")) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const url = typeof args.url === "string" ? args.url : "http://localhost:4000/api/echo/top3";
  const timeoutMs = Number(args.timeoutMs || args.timeout || 10000);

  const base_price = args.base_price != null ? Number(args.base_price) : 199.99;
  const product_name = typeof args.product_name === "string" ? args.product_name : "Test product";
  const currency = typeof args.currency === "string" ? args.currency : "EUR";

  const payload = {
    base_price,
    product_name,
    currency,
    debug: true,
  };

  let res;
  try {
    res = await axios.post(url, payload, {
      timeout: Number.isFinite(timeoutMs) ? timeoutMs : 10000,
      headers: { "content-type": "application/json" },
      validateStatus: () => true,
    });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error("diagnose-echo-top3: request failed:", msg);
    process.exitCode = 2;
    return;
  }

  console.log("HTTP", res.status);

  const data = res.data;
  if (data == null || typeof data !== "object") {
    console.error("diagnose-echo-top3: response is not JSON object:");
    console.log(String(data));
    process.exitCode = 3;
    return;
  }

  const offers = data.offers;
  const offerCount = Array.isArray(offers) ? offers.length : null;

  console.log(
    safeJson({
      ok: data.ok ?? null,
      error: data.error ?? null,
      hasOffers: Array.isArray(offers),
      offerCount,
    })
  );

  if (!Array.isArray(offers)) {
    console.error("diagnose-echo-top3: `offers` is missing or not an array.");
    console.log("Full response:");
    console.log(safeJson(data));
    process.exitCode = 4;
    return;
  }

  if (offers.length === 0) {
    console.warn("diagnose-echo-top3: offers array is empty.");
    process.exitCode = 0;
    return;
  }

  const first = offers[0];
  if (first == null || typeof first !== "object") {
    console.error("diagnose-echo-top3: offers[0] is not an object:", typeof first);
    process.exitCode = 5;
    return;
  }

  const keys = Object.keys(first).slice(0, 40);
  console.log("offers[0] keys:", keys.join(", "));

  if (typeof args.printFirst === "string" || args.printFirst === true) {
    console.log("offers[0] full:");
    console.log(safeJson(first));
  }

  process.exitCode = 0;
}

main().catch((err) => {
  console.error("diagnose-echo-top3: unhandled error:", (err && err.message) || err);
  process.exitCode = 1;
});
