"use strict";

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function validateFlightsInput(body) {
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

  const originVal = pick(b, ["origin", "from", "fromAirport", "from_airport"]);
  const destinationVal = pick(b, ["destination", "to", "toAirport", "to_airport"]);
  const origin = typeof originVal === "string" ? originVal.trim().toUpperCase() : "";
  const destination = typeof destinationVal === "string" ? destinationVal.trim().toUpperCase() : "";

  const departAtVal = pick(b, ["departAt", "depart_at", "startDate", "start_date"]);
  const returnAtVal = pick(b, ["returnAt", "return_at", "endDate", "end_date"]);
  const departAtRaw = typeof departAtVal === "string" ? departAtVal.trim() : "";
  const returnAtRaw = typeof returnAtVal === "string" ? returnAtVal.trim() : "";

  const travelersVal = pick(b, ["travelers", "travellers", "travelersCount", "travelers_count", "passengers"]);
  const travelers = toNumOrNull(travelersVal) != null ? toNumOrNull(travelersVal) : 1;

  const directOnlyVal = pick(b, ["directOnly", "direct_only", "nonstop", "non_stop"]);
  const directOnly = directOnlyVal != null ? Boolean(directOnlyVal) : null;

  const cabinClassVal = pick(b, ["cabinClass", "cabin_class"]);
  const cabinClass = typeof cabinClassVal === "string" ? cabinClassVal.trim().toLowerCase() : null;

  const basePriceVal = pick(b, ["basePriceEur", "base_price_eur", "basePrice", "base_price", "finalPriceEur", "final_price_eur"]);
  const basePriceEur = toNumOrNull(basePriceVal);

  const prevBestPriceVal = pick(b, ["previousBestPriceEur", "previous_best_price_eur", "prevBestPriceEur", "prev_best_price_eur"]);
  const previousBestPriceEur = toNumOrNull(prevBestPriceVal);

  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;
  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";

  const missingFields = [];
  if (!origin) missingFields.push("origin");
  if (!destination) missingFields.push("destination");
  if (!departAtRaw) missingFields.push("departAt");
  if (!returnAtRaw) missingFields.push("returnAt");
  if (missingFields.length > 0) return { ok: false, error: "missing_fields", missingFields };

  const departAt = new Date(departAtRaw);
  const returnAt = new Date(returnAtRaw);
  if (Number.isNaN(departAt.getTime())) return { ok: false, error: "invalid_depart_at" };
  if (Number.isNaN(returnAt.getTime())) return { ok: false, error: "invalid_return_at" };
  if (!(returnAt.getTime() > departAt.getTime())) return { ok: false, error: "return_at_must_be_after_depart_at" };

  if (!Number.isFinite(travelers) || travelers <= 0 || travelers > 12) return { ok: false, error: "invalid_travelers" };
  if (basePriceEur != null && (!Number.isFinite(basePriceEur) || basePriceEur <= 0)) return { ok: false, error: "invalid_base_price" };

  return {
    ok: true,
    value: {
      origin,
      destination,
      departAt: departAt.toISOString(),
      returnAt: returnAt.toISOString(),
      travelers: Math.floor(travelers),
      directOnly,
      cabinClass,
      market,
      currency,
      basePriceEur: Number.isFinite(basePriceEur) && basePriceEur > 0 ? basePriceEur : null,
      previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
    },
  };
}

function buildMockFlightOffers(input) {
  const observedAt = new Date().toISOString();
  const travelers = Number(input.travelers) || 1;
  const directMul = input.directOnly === true ? 1.12 : 1.0;
  const cabinMul = (() => {
    const c = (input.cabinClass || "").toLowerCase();
    if (c === "business") return 2.2;
    if (c === "premium") return 1.45;
    return 1.0;
  })();

  const base = 120 * directMul * cabinMul;

  const candidates = [
    { provider: "Dealsense Flights", title: `Budget carrier ${input.origin}-${input.destination}`, price: round2(base * 0.85 * travelers), stops: input.directOnly === true ? 0 : 1 },
    { provider: "Dealsense Flights", title: `Standard airline ${input.origin}-${input.destination}`, price: round2(base * 1.0 * travelers), stops: input.directOnly === true ? 0 : 0 },
    { provider: "Dealsense Flights", title: `Flexible ticket ${input.origin}-${input.destination}`, price: round2(base * 1.18 * travelers), stops: input.directOnly === true ? 0 : 0 },
  ].map((c) => {
    const score = clamp01(1 - c.price / Math.max(1, base * travelers * 1.9));
    return {
      offerId: `${c.title}`.toLowerCase().replace(/\s+/g, "_").slice(0, 90),
      provider: c.provider,
      title: c.title,
      estPriceEur: c.price,
      stops: c.stops,
      matchScore: round2(score),
      priceObservedAt: observedAt,
    };
  });

  candidates.sort((a, b) => (a.estPriceEur || 0) - (b.estPriceEur || 0));
  return candidates;
}

function registerFlights(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/flights/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.TRAVEL_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "travel", res })) return;

      const parsed = validateFlightsInput(req.body);
      if (!parsed.ok) {
        return res.status(400).json({
          ok: false,
          module: "flights",
          vertical: "flights",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(5, Math.min(Number(process.env.TRAVEL_PRICE_TTL_SECONDS) || 60, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const quotes = buildMockFlightOffers(parsed.value).slice(0, 3);
      const prices = quotes.map((q) => (q && typeof q.estPriceEur === "number" ? q.estPriceEur : Number(q && q.estPriceEur))).filter((n) => Number.isFinite(n));
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
        parsed.value.origin,
        parsed.value.destination,
        String(parsed.value.departAt),
        String(parsed.value.returnAt),
        String(parsed.value.travelers),
        String(parsed.value.directOnly == null ? "" : parsed.value.directOnly),
        String(parsed.value.cabinClass || ""),
      ]
        .join("|")
        .toLowerCase();

      const offersTop3 = quotes.map((q) => ({
        seller: q.provider,
        title: q.title,
        price: { amount: q.estPriceEur, currency: "EUR", period: "one_time" },
        url: null,
        meta: {
          offerId: q.offerId,
          stops: q.stops,
          matchScore: q.matchScore,
          origin: parsed.value.origin,
          destination: parsed.value.destination,
          departAt: parsed.value.departAt,
          returnAt: parsed.value.returnAt,
          travelers: parsed.value.travelers,
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
            message: "To estimate savings, include basePriceEur from your current flight offer.",
          });
          return rec;
        }
        if (isCheaperThanBase === false) {
          rec.push({
            id: "no_cheaper_found",
            title: "No cheaper offer found",
            message: "We did not find a lower total price than your base. Try changing directOnly or cabinClass.",
          });
        }
        return rec;
      })();

      return res.json({
        ok: true,
        module: "flights",
        vertical: "flights",
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
  registerFlights,
};
