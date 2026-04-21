"use strict";

const buckets = new Map();

function nowMs() {
  return Date.now();
}

function getKey(req) {
  const ip =
    (req && (req.ip || (req.headers && req.headers["x-forwarded-for"]) || "")) || "";
  const head = Array.isArray(ip) ? String(ip[0] || "") : String(ip);
  const first = head.split(",")[0].trim();
  return first || "unknown";
}

function rateLimit({ windowMs, max }) {
  const win = Math.max(1000, Number(windowMs) || 60_000);
  const lim = Math.max(1, Math.floor(Number(max) || 30));

  return function (req, res, next) {
    const key = getKey(req);
    const t = nowMs();
    const b = buckets.get(key) || { ts: t, count: 0 };
    if (t - b.ts > win) {
      b.ts = t;
      b.count = 0;
    }
    b.count += 1;
    buckets.set(key, b);

    if (b.count > lim) {
      return res.status(429).json({ ok: false, error: "Too many requests" });
    }
    return next();
  };
}

module.exports = {
  rateLimit,
};
