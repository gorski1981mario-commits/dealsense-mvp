"use strict";

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function validateCarRentalInput(body) {
  const b = body && typeof body === "object" ? body : {};
  const pick = (obj, keys) => {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
    }
    return undefined;
  };
  const toNumOrNull = (v) => {
    if (v == null) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const pickupVal = pick(b, ["pickupLocation", "pickup_location", "pickup", "location"]);
  const pickupLocation = typeof pickupVal === "string" ? pickupVal.trim() : "";

  const dropoffVal = pick(b, ["dropoffLocation", "dropoff_location", "dropoff"]);
  const dropoffLocation = typeof dropoffVal === "string" ? dropoffVal.trim() : "";

  const pickupAtVal = pick(b, ["pickupAt", "pickup_at", "startDate", "start_date"]);
  const dropoffAtVal = pick(b, ["dropoffAt", "dropoff_at", "endDate", "end_date"]);
  const pickupAt = typeof pickupAtVal === "string" ? pickupAtVal.trim() : "";
  const dropoffAt = typeof dropoffAtVal === "string" ? dropoffAtVal.trim() : "";

  const daysVal = pick(b, ["days", "rentalDays", "rental_days", "durationDays", "duration_days"]);
  const rentalDays = toNumOrNull(daysVal);

  const carTypeVal = pick(b, ["carType", "car_type", "category"]);
  const carType = typeof carTypeVal === "string" ? carTypeVal.trim().toLowerCase() : null;

  const basePriceVal = pick(b, ["basePriceEur", "base_price_eur", "basePrice", "base_price"]);
  const basePriceEur = toNumOrNull(basePriceVal);

  const prevBestPriceVal = pick(b, ["previousBestPriceEur", "previous_best_price_eur", "prevBestPriceEur", "prev_best_price_eur"]);
  const previousBestPriceEur = toNumOrNull(prevBestPriceVal);

  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;
  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";

  const missingFields = [];
  if (!pickupLocation) missingFields.push("pickupLocation");
  if (!pickupAt) missingFields.push("pickupAt");
  if (!dropoffAt) missingFields.push("dropoffAt");
  if (missingFields.length > 0) return { ok: false, error: "missing_fields", missingFields };

  const p = new Date(pickupAt);
  const d = new Date(dropoffAt);
  if (Number.isNaN(p.getTime())) return { ok: false, error: "invalid_pickup_at" };
  if (Number.isNaN(d.getTime())) return { ok: false, error: "invalid_dropoff_at" };
  if (!(d.getTime() > p.getTime())) return { ok: false, error: "dropoff_must_be_after_pickup" };

  const derivedDays = (() => {
    if (Number.isFinite(rentalDays) && rentalDays > 0) return Math.floor(rentalDays);
    const ms = d.getTime() - p.getTime();
    const days = Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
    return days;
  })();

  if (derivedDays < 1 || derivedDays > 60) return { ok: false, error: "invalid_days" };
  if (basePriceEur != null && (!Number.isFinite(basePriceEur) || basePriceEur <= 0)) return { ok: false, error: "invalid_base_price" };

  return {
    ok: true,
    value: {
      pickupLocation,
      dropoffLocation: dropoffLocation || pickupLocation,
      pickupAt: p.toISOString(),
      dropoffAt: d.toISOString(),
      rentalDays: derivedDays,
      carType,
      market,
      currency,
      basePriceEur: Number.isFinite(basePriceEur) && basePriceEur > 0 ? basePriceEur : null,
      previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
    },
  };
}

function buildMockCarRentalOffers(input) {
  const days = Number(input.rentalDays) || 1;
  const observedAt = new Date().toISOString();

  const baseDaily = 22;
  const typeMul = (() => {
    const t = (input.carType || "").toLowerCase();
    if (t === "compact") return 1.0;
    if (t === "economy") return 0.95;
    if (t === "suv") return 1.35;
    if (t === "luxury") return 1.8;
    return 1.1;
  })();

  const candidates = [
    { provider: "Dealsense Cars", title: "Economy (manual, limited)", daily: round2(baseDaily * typeMul * 0.95), depositEur: 350 },
    { provider: "Dealsense Cars", title: "Compact (auto, standard)", daily: round2(baseDaily * typeMul * 1.1), depositEur: 500 },
    { provider: "Dealsense Cars", title: "SUV (auto, full)", daily: round2(baseDaily * typeMul * 1.35), depositEur: 800 },
  ].map((c) => {
    const total = round2(c.daily * days);
    const score = clamp01(1 - total / Math.max(1, baseDaily * days * 2.0));
    return {
      offerId: `${input.pickupLocation}:${c.title}`.toLowerCase().replace(/\s+/g, "_").slice(0, 90),
      provider: c.provider,
      title: c.title,
      estTotalEur: total,
      estDailyEur: c.daily,
      depositEur: c.depositEur,
      matchScore: round2(score),
      priceObservedAt: observedAt,
    };
  });

  candidates.sort((a, b) => (a.estTotalEur || 0) - (b.estTotalEur || 0));
  return candidates;
}

function registerCarRental(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/car-rental/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.TRAVEL_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "travel", res })) return;

      const parsed = validateCarRentalInput(req.body);
      if (!parsed.ok) {
        return res.status(400).json({
          ok: false,
          module: "car_rental",
          vertical: "car_rental",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(5, Math.min(Number(process.env.TRAVEL_PRICE_TTL_SECONDS) || 60, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const quotes = buildMockCarRentalOffers(parsed.value).slice(0, 3);
      const prices = quotes
        .map((q) => (q && typeof q.estTotalEur === "number" ? q.estTotalEur : Number(q && q.estTotalEur)))
        .filter((n) => Number.isFinite(n));
      const bestPriceEur = prices.length ? Math.min.apply(null, prices) : null;
      const avgPriceEur = prices.length ? round2(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
      const spreadEur = prices.length ? round2(Math.max.apply(null, prices) - Math.min.apply(null, prices)) : null;

      const basePriceEur = parsed.value && typeof parsed.value.basePriceEur === "number" ? parsed.value.basePriceEur : null;
      const isCheaperThanBase = Number.isFinite(basePriceEur) && basePriceEur > 0 && Number.isFinite(bestPriceEur)
        ? bestPriceEur < basePriceEur
        : null;
      const savingsBestEur = isCheaperThanBase === true ? round2(basePriceEur - bestPriceEur) : null;

      const prevBest = parsed.value && typeof parsed.value.previousBestPriceEur === "number" ? parsed.value.previousBestPriceEur : null;
      const priceDeltaEur = Number.isFinite(prevBest) && Number.isFinite(bestPriceEur) ? round2(bestPriceEur - prevBest) : null;

      const comparableKey = [
        parsed.value.market || "",
        parsed.value.currency || "EUR",
        parsed.value.pickupLocation,
        parsed.value.dropoffLocation,
        String(parsed.value.pickupAt),
        String(parsed.value.dropoffAt),
        String(parsed.value.rentalDays),
        String(parsed.value.carType || ""),
      ]
        .join("|")
        .toLowerCase();

      const offersTop3 = quotes.map((q) => ({
        seller: q.provider,
        title: q.title,
        price: { amount: q.estTotalEur, currency: "EUR", period: "one_time" },
        url: null,
        meta: {
          offerId: q.offerId,
          estDailyEur: q.estDailyEur,
          depositEur: q.depositEur,
          matchScore: q.matchScore,
          pickupLocation: parsed.value.pickupLocation,
          dropoffLocation: parsed.value.dropoffLocation,
          pickupAt: parsed.value.pickupAt,
          dropoffAt: parsed.value.dropoffAt,
          rentalDays: parsed.value.rentalDays,
          priceObservedAt: q.priceObservedAt || nowIso,
          comparableKey,
        },
      }));

      const recommendations = (() => {
        const rec = [];
        if (!Number.isFinite(basePriceEur) || basePriceEur <= 0) {
          rec.push({
            id: "provide_base_price",
            title: "Provide your current price",
            message: "To estimate savings, include basePriceEur from your current car rental offer.",
          });
          return rec;
        }
        if (isCheaperThanBase === false) {
          rec.push({
            id: "no_cheaper_found",
            title: "No cheaper offer found",
            message: "We did not find a lower total price than your base. Try changing carType or adjusting pickup/dropoff times.",
          });
        }
        return rec;
      })();

      return res.json({
        ok: true,
        module: "car_rental",
        vertical: "car_rental",
        session: { session_id: sessionId, planId: plan.id },
        input: parsed.value,
        quotes,
        offersTop3,
        comparableKey,
        freshness: {
          generatedAt: nowIso,
          ttlSeconds,
          validUntil,
          pricesMayChange: true,
        },
        stats: {
          bestPriceEur,
          avgPriceEur,
          spreadEur,
          basePriceEur: Number.isFinite(basePriceEur) && basePriceEur > 0 ? basePriceEur : null,
          savingsBestEur,
          isCheaperThanBase,
          previousBestPriceEur: Number.isFinite(prevBest) && prevBest > 0 ? prevBest : null,
          priceDeltaEur,
          offerCount: offersTop3.length,
        },
        recommendations,
        ranking: "euro_first",
      });
    }
  );
}

module.exports = {
  registerCarRental,
};
