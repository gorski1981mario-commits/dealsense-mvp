"use strict";

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function normalizeText(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function tokenize(s) {
  const t = normalizeText(s);
  if (!t) return [];
  return t
    .split(/\s+/)
    .map((x) => x.replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean);
}

function computeTravelMatchScore(query, candidate) {
  const q = tokenize(query).filter((x) => x.length >= 3);
  const c = tokenize(candidate);
  if (q.length === 0 || c.length === 0) return 0;

  const STOP = new Set([
    "the",
    "and",
    "with",
    "voor",
    "met",
    "een",
    "van",
    "naar",
    "in",
    "op",
    "bij",
    "trip",
    "travel",
    "vakantie",
    "holiday",
  ]);

  const qFiltered = q.filter((x) => !STOP.has(x));
  const qFinal = qFiltered.length > 0 ? qFiltered : q;

  const candText = c.join(" ");
  let hits = 0;
  let strongHits = 0;

  for (const tok of qFinal) {
    if (candText.includes(tok)) {
      hits += 1;
      if (tok.length >= 6 || /\d/.test(tok)) strongHits += 1;
    }
  }

  const base = hits / qFinal.length;
  const boost = qFinal.length > 0 ? strongHits / qFinal.length : 0;
  return clamp01(base * 0.85 + boost * 0.15);
}

function validateTravelInput(body) {
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

  const destinationVal = pick(b, ["destination", "dest", "to"]);
  const destination = typeof destinationVal === "string" ? destinationVal.trim() : "";
  const originVal = pick(b, ["origin", "from"]);
  const origin = typeof originVal === "string" ? originVal.trim() : "";
  const tripTypeVal = pick(b, ["tripType", "trip_type", "type"]);
  const tripType = typeof tripTypeVal === "string" ? tripTypeVal.trim() : "";
  const budgetVal = pick(b, ["budgetEur", "budget_eur", "budget", "maxBudgetEur", "max_budget_eur"]);
  const budgetEur = toNumOrNull(budgetVal);
  const travelersVal = pick(b, ["travelers", "travellers", "travelersCount", "travelers_count"]);
  const travelersRaw = toNumOrNull(travelersVal);
  const queryVal = pick(b, ["query", "q"]);
  const query = typeof queryVal === "string" ? queryVal.trim() : "";

  const maxAgeSecondsVal = pick(b, ["maxAgeSeconds", "max_age_seconds", "maxAge", "max_age"]);
  const maxAgeSeconds = maxAgeSecondsVal != null ? Number(maxAgeSecondsVal) : null;
  const forceRefreshVal = pick(b, ["forceRefresh", "force_refresh"]);
  const forceRefresh = forceRefreshVal != null ? Boolean(forceRefreshVal) : false;

  const departAtVal = pick(b, ["departAt", "depart_at", "startDate", "start_date"]);
  const returnAtVal = pick(b, ["returnAt", "return_at", "endDate", "end_date"]);
  const departAt = typeof departAtVal === "string" ? departAtVal.trim() : "";
  const returnAt = typeof returnAtVal === "string" ? returnAtVal.trim() : "";

  const localeVal = pick(b, ["locale", "uiLocale", "ui_locale", "lang"]);
  const locale = typeof localeVal === "string" ? localeVal.trim() : null;
  const marketVal = pick(b, ["market", "country", "countryCode", "country_code", "marketCountry"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;
  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";

  const adultsVal = pick(b, ["adults", "adultsCount", "adults_count"]);
  const adults = toNumOrNull(adultsVal);
  const childrenVal = pick(b, ["children", "childrenCount", "children_count", "kids"]);
  const children = toNumOrNull(childrenVal);
  const childrenAgesVal = pick(b, ["childrenAges", "children_ages", "kidsAges", "kids_ages"]);
  const childrenAges = Array.isArray(childrenAgesVal) ? childrenAgesVal.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n >= 0 && n <= 17) : null;
  const roomsVal = pick(b, ["rooms", "roomsCount", "rooms_count"]);
  const rooms = toNumOrNull(roomsVal);

  const directOnlyVal = pick(b, ["directOnly", "direct_only", "nonstop", "non_stop"]);
  const directOnly = directOnlyVal != null ? Boolean(directOnlyVal) : null;
  const cabinClassVal = pick(b, ["cabinClass", "cabin_class"]);
  const cabinClass = typeof cabinClassVal === "string" ? cabinClassVal.trim().toLowerCase() : null;
  const luggageVal = pick(b, ["luggage", "bags", "baggage"]);
  const luggage = luggageVal != null ? String(luggageVal).trim() : null;

  const basePriceVal = pick(b, ["basePriceEur", "base_price_eur", "basePrice", "base_price", "finalPriceEur", "final_price_eur"]);
  const basePriceEur = toNumOrNull(basePriceVal);

  const previousBestPriceVal = pick(b, ["previousBestPriceEur", "previous_best_price_eur", "prevBestPriceEur", "prev_best_price_eur"]);
  const previousBestPriceEur = toNumOrNull(previousBestPriceVal);

  const derivedTravelers = (() => {
    if (Number.isFinite(travelersRaw) && travelersRaw > 0) return travelersRaw;
    if (Number.isFinite(adults) || Number.isFinite(children)) {
      const a = Number.isFinite(adults) ? adults : 0;
      const c = Number.isFinite(children) ? children : 0;
      const sum = a + c;
      if (sum > 0) return sum;
    }
    return 1;
  })();

  const missingFields = [];
  if (!destination && !query) missingFields.push("destination_or_query");

  if (missingFields.length > 0) {
    return {
      ok: false,
      error: "missing_fields",
      missingFields,
    };
  }

  if (!Number.isFinite(derivedTravelers) || derivedTravelers <= 0 || derivedTravelers > 12) return { ok: false, error: "invalid_travelers" };
  if (budgetEur != null && (!Number.isFinite(budgetEur) || budgetEur <= 0)) return { ok: false, error: "invalid_budget" };

  return {
    ok: true,
    value: {
      destination,
      origin,
      tripType,
      budgetEur,
      travelers: derivedTravelers,
      query,
      nights: b.nights != null ? Number(b.nights) : null,
      month: typeof b.month === "string" ? b.month.trim() : null,
      preferences: typeof b.preferences === "string" ? b.preferences.trim() : null,
      maxAgeSeconds,
      forceRefresh,
      departAt: departAt || null,
      returnAt: returnAt || null,
      locale,
      market,
      currency,
      adults,
      children,
      childrenAges,
      rooms,
      directOnly,
      cabinClass,
      luggage,
      basePriceEur: Number.isFinite(basePriceEur) && basePriceEur > 0 ? basePriceEur : null,
      previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
    },
  };
}

function buildMockTravelQuotes(input) {
  const destination = input.destination || (input.query ? input.query : "");
  const travelers = input.travelers || 1;
  const baseBudget = input.budgetEur != null ? input.budgetEur : 1200;
  const q = input.query || [input.origin, destination, input.tripType, input.preferences].filter(Boolean).join(" ");

  const observedAt = new Date().toISOString();

  const candidates = [
    {
      provider: "Dealsense Travel",
      title: `Budget smart: ${destination} (3★, flexibel)` ,
      tags: ["budget", "flex"],
      estPriceEur: Math.round(baseBudget * 0.8),
    },
    {
      provider: "Dealsense Travel",
      title: `City break: ${destination} (4★ hotel + vlucht)` ,
      tags: ["city", "4star", "flight"],
      estPriceEur: Math.round(baseBudget * 0.95),
    },
    {
      provider: "Dealsense Travel",
      title: `Relax: ${destination} (all-inclusive, strand)` ,
      tags: ["beach", "allinclusive"],
      estPriceEur: Math.round(baseBudget * 1.05),
    },
  ].map((c) => {
    const matchText = [c.title, c.tags.join(" ")].join(" ");
    const score = computeTravelMatchScore(q, matchText);
    const perPerson = Math.max(1, travelers);
    return {
      offerId: `${destination}:${c.title}`.toLowerCase().replace(/\s+/g, "_").slice(0, 80),
      ...c,
      travelers,
      estPriceEur: c.estPriceEur,
      estPricePerPersonEur: Math.round((c.estPriceEur / perPerson) * 100) / 100,
      matchScore: Math.round(score * 1000) / 1000,
      priceObservedAt: observedAt,
    };
  });

  // V2: euro-first
  candidates.sort((a, b) => (a.estPriceEur || 0) - (b.estPriceEur || 0));
  return candidates;
}

function registerTravel(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/v2/travel/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.TRAVEL_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "travel", res })) return;

      const parsed = validateTravelInput(req.body);
      if (!parsed.ok) {
        return res.json({
          ok: false,
          module: "travel",
          vertical: "travel",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
          message: parsed.error === "missing_fields" ? "Missing required fields." : "Invalid input.",
          session: { session_id: sessionId, planId: plan.id },
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(5, Math.min(Number(process.env.TRAVEL_PRICE_TTL_SECONDS) || 60, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const quotes = buildMockTravelQuotes(parsed.value).slice(0, 3);
      const prices = quotes.map((q) => (q && typeof q.estPriceEur === "number" ? q.estPriceEur : Number(q && q.estPriceEur))).filter((n) => Number.isFinite(n));
      const bestPriceEur = prices.length ? Math.min.apply(null, prices) : null;
      const avgPriceEur = prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null;
      const spreadEur = prices.length ? Math.round((Math.max.apply(null, prices) - Math.min.apply(null, prices)) * 100) / 100 : null;
      const basePriceEur = parsed.value && typeof parsed.value.basePriceEur === "number" ? parsed.value.basePriceEur : null;
      const savingsBestEur = Number.isFinite(basePriceEur) && basePriceEur > 0 && Number.isFinite(bestPriceEur) ? Math.round((basePriceEur - bestPriceEur) * 100) / 100 : null;

      const previousBestPriceEur = parsed.value && typeof parsed.value.previousBestPriceEur === "number" ? parsed.value.previousBestPriceEur : null;
      const priceDeltaEur = Number.isFinite(previousBestPriceEur) && Number.isFinite(bestPriceEur)
        ? Math.round((bestPriceEur - previousBestPriceEur) * 100) / 100
        : null;

      const comparableKey = [
        parsed.value.market || "",
        parsed.value.currency || "EUR",
        parsed.value.origin || "",
        parsed.value.destination || "",
        String(parsed.value.travelers || ""),
        String(parsed.value.departAt || ""),
        String(parsed.value.returnAt || ""),
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
          estPricePerPersonEur: q.estPricePerPersonEur,
          matchScore: q.matchScore,
          travelers: q.travelers,
          tags: q.tags,
          priceObservedAt: q.priceObservedAt || nowIso,
          comparableKey,
        },
      }));

      return res.json({
        ok: true,
        module: "travel",
        vertical: "travel",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          destination: parsed.value.destination || null,
          origin: parsed.value.origin || null,
          tripType: parsed.value.tripType || null,
          travelers: parsed.value.travelers,
          budgetEur: parsed.value.budgetEur,
          month: parsed.value.month,
          maxAgeSeconds: parsed.value.maxAgeSeconds,
          forceRefresh: parsed.value.forceRefresh,
          departAt: parsed.value.departAt,
          returnAt: parsed.value.returnAt,
          locale: parsed.value.locale,
          market: parsed.value.market,
          currency: parsed.value.currency,
          adults: parsed.value.adults,
          children: parsed.value.children,
          childrenAges: parsed.value.childrenAges,
          rooms: parsed.value.rooms,
          directOnly: parsed.value.directOnly,
          cabinClass: parsed.value.cabinClass,
          luggage: parsed.value.luggage,
          basePriceEur: parsed.value.basePriceEur,
          previousBestPriceEur: parsed.value.previousBestPriceEur,
        },
        quotes,
        offersTop3,
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
          previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
          priceDeltaEur,
          offerCount: offersTop3.length,
        },
        ranking: "euro_first",
        comparableKey,
      });
    }
  );
}

module.exports = {
  registerTravel,
  computeTravelMatchScore,
};
