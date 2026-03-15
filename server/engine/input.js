"use strict";

function toTrimmedString(v, maxLen) {
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (!s) return "";
  if (typeof maxLen === "number" && Number.isFinite(maxLen) && maxLen > 0) {
    return s.slice(0, maxLen);
  }
  return s;
}

function toFiniteNumber(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseEchoTop3Input(body) {
  const b = body && typeof body === "object" ? body : {};

  const url = toTrimmedString(b.url, 800) || null;
  const ean = toTrimmedString(b.ean, 32) || null;
  const product_name = toTrimmedString(b.product_name, 200) || null;
  const base_price = toFiniteNumber(b.base_price);

  const maxDeliveryDays = toFiniteNumber(b.maxDeliveryDays);
  const matchMinScore = toFiniteNumber(b.matchMinScore);

  const debug = b.debug === true || String(b.debug || "").trim() === "1";

  if (base_price == null || base_price <= 0) {
    return { ok: false, error: "base_price must be a positive number" };
  }

  if (!product_name && !ean && !url) {
    return { ok: false, error: "Provide at least one of: product_name, ean, url" };
  }

  return {
    ok: true,
    value: {
      url,
      ean,
      product_name,
      base_price,
      maxDeliveryDays: maxDeliveryDays != null && maxDeliveryDays > 0 ? maxDeliveryDays : null,
      matchMinScore:
        matchMinScore != null && matchMinScore >= 0 && matchMinScore <= 1 ? matchMinScore : null,
      debug,
    },
  };
}

module.exports = {
  parseEchoTop3Input,
};
