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

function isoDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

function parseIso(s) {
  const str = typeof s === "string" ? s.trim() : "";
  if (!str) return null;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function normalizeBoard(raw) {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!v) return "";
  if (v === "ai" || v === "allinclusive" || v === "all-inclusive" || v === "all inclusive") return "all_inclusive";
  if (v === "bb" || v === "b&b" || v === "bedandbreakfast" || v === "bed-and-breakfast" || v === "bed and breakfast") return "bed_and_breakfast";
  if (v === "hb" || v === "halfboard" || v === "half-board" || v === "half board") return "half_board";
  if (v === "fb" || v === "fullboard" || v === "full-board" || v === "full board") return "full_board";
  if (v === "ro" || v === "roomonly" || v === "room-only" || v === "room only") return "room_only";
  return v;
}

function normalizeRoomType(raw) {
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!v) return "";
  if (v === "dbl" || v === "2p" || v === "double room") return "double";
  if (v === "twin room") return "twin";
  if (v === "fam" || v === "family room") return "family";
  if (v === "suite room") return "suite";
  if (v === "sng" || v === "single room") return "single";
  return v;
}

function computeVacationsMatchScore(query, candidate) {
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
    "vakantie",
    "vacation",
    "holiday",
    "reisen",
    "reis",
    "trip",
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

function validateVacationsInput(body) {
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
  const travelersVal = pick(b, ["travelers", "travellers", "travelersCount", "travelers_count"]);
  const travelers = toNumOrNull(travelersVal) != null ? toNumOrNull(travelersVal) : 2;
  const nightsVal = pick(b, ["nights", "nightsCount", "nights_count"]);
  const nights = toNumOrNull(nightsVal);
  const budgetVal = pick(b, ["budgetEur", "budget_eur", "budget", "maxBudgetEur", "max_budget_eur"]);
  const budgetEur = toNumOrNull(budgetVal);
  const queryVal = pick(b, ["query", "q"]);
  const query = typeof queryVal === "string" ? queryVal.trim() : "";

  const maxAgeSecondsVal = pick(b, ["maxAgeSeconds", "max_age_seconds", "maxAge", "max_age"]);
  const maxAgeSeconds = maxAgeSecondsVal != null ? Number(maxAgeSecondsVal) : null;
  const forceRefreshVal = pick(b, ["forceRefresh", "force_refresh"]);
  const forceRefresh = forceRefreshVal != null ? Boolean(forceRefreshVal) : false;

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

  const flightIncludedVal = pick(b, ["flightIncluded", "flight_included", "withFlight", "with_flight"]);
  const flightIncluded = flightIncludedVal != null ? Boolean(flightIncludedVal) : null;
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

  const departAtVal = pick(b, ["departAt", "depart_at", "startDate", "start_date"]);
  const returnAtVal = pick(b, ["returnAt", "return_at", "endDate", "end_date"]);
  const departAtRaw = typeof departAtVal === "string" ? departAtVal.trim() : "";
  const returnAtRaw = typeof returnAtVal === "string" ? returnAtVal.trim() : "";
  const departAt = parseIso(departAtRaw);
  const returnAt = parseIso(returnAtRaw);

  const starsVal = pick(b, ["stars", "hotelStars", "hotel_stars"]);
  const stars = starsVal != null ? Number(starsVal) : null;
  const roomTypeVal = pick(b, ["roomType", "room_type", "room"]);
  const roomType = normalizeRoomType(roomTypeVal);
  const boardVal = pick(b, ["board", "board_type", "mealPlan", "meal_plan"]);
  const board = normalizeBoard(boardVal);

  const missingFields = [];
  if (!destination && !query) missingFields.push("destination_or_query");
  if (!departAtRaw) missingFields.push("departAt");
  if (!returnAtRaw) missingFields.push("returnAt");
  if (stars == null) missingFields.push("stars");
  if (!roomType) missingFields.push("roomType");
  if (!board) missingFields.push("board");

  if (missingFields.length > 0) {
    return { ok: false, error: "missing_fields", missingFields };
  }

  if (!Number.isFinite(travelers) || travelers <= 0 || travelers > 12) return { ok: false, error: "invalid_travelers" };
  if (nights != null && (!Number.isFinite(nights) || nights <= 0 || nights > 60)) return { ok: false, error: "invalid_nights" };
  if (budgetEur != null && (!Number.isFinite(budgetEur) || budgetEur <= 0)) return { ok: false, error: "invalid_budget" };

  if (!departAt) return { ok: false, error: "invalid_depart_at" };
  if (!returnAt) return { ok: false, error: "invalid_return_at" };
  if (!(returnAt.getTime() > departAt.getTime())) return { ok: false, error: "return_at_must_be_after_depart_at" };

  if (!Number.isFinite(stars) || stars < 1 || stars > 5) return { ok: false, error: "invalid_stars" };

  const BOARD_ALLOWED = new Set(["room_only", "bed_and_breakfast", "half_board", "full_board", "all_inclusive"]);
  if (!BOARD_ALLOWED.has(board)) return { ok: false, error: "invalid_board" };

  return {
    ok: true,
    value: {
      destination,
      origin,
      travelers,
      nights,
      budgetEur,
      query,
      departAt: isoDate(departAt),
      returnAt: isoDate(returnAt),
      stars: Math.floor(stars),
      roomType,
      board,
      preferences: typeof b.preferences === "string" ? b.preferences.trim() : null,
      maxAgeSeconds,
      forceRefresh,
      locale,
      market,
      currency,
      adults,
      children,
      childrenAges,
      rooms,
      flightIncluded,
      directOnly,
      cabinClass,
      luggage,
      basePriceEur: Number.isFinite(basePriceEur) && basePriceEur > 0 ? basePriceEur : null,
      previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
    },
  };
}

function buildMockVacationOffers(input) {
  const destination = input.destination || input.query || "";
  const travelers = input.travelers || 2;
  const nights = input.nights != null ? input.nights : 7;
  const budget = input.budgetEur != null ? input.budgetEur : 1500;
  const q = input.query || [input.origin, destination, input.preferences].filter(Boolean).join(" ");

  const observedAt = new Date().toISOString();

  const departAt = typeof input.departAt === "string" ? input.departAt : null;
  const returnAt = typeof input.returnAt === "string" ? input.returnAt : null;
  const stars = typeof input.stars === "number" ? input.stars : null;
  const roomType = typeof input.roomType === "string" ? input.roomType : null;
  const board = typeof input.board === "string" ? input.board : null;

  const comparableKey = [
    destination,
    input.origin || "",
    String(travelers),
    String(nights),
    String(stars),
    String(roomType),
    String(board),
    String(departAt),
    String(returnAt),
  ]
    .join("|")
    .toLowerCase();

  const candidates = [
    {
      provider: "Dealsense Vacations",
      title: `City break: ${destination}`,
      tags: ["city", "hotel"],
      estPriceEur: Math.round(budget * 0.85),
      hotel: { name: `${destination} Central Hotel`, stars: stars, board: board },
      room: { type: roomType },
    },
    {
      provider: "Dealsense Vacations",
      title: `Actief & natuur: ${destination}`,
      tags: ["nature", "active"],
      estPriceEur: Math.round(budget * 0.9),
      hotel: { name: `${destination} Nature Lodge`, stars: stars, board: board },
      room: { type: roomType },
    },
    {
      provider: "Dealsense Vacations",
      title: `Zon & strand: ${destination}`,
      tags: ["beach", "allinclusive"],
      estPriceEur: Math.round(budget * 0.95),
      hotel: { name: `${destination} Beach Resort`, stars: stars, board: board },
      room: { type: roomType },
    },
  ].map((c) => {
    const matchText = [c.title, c.tags.join(" "), c.hotel && c.hotel.name, String(c.hotel && c.hotel.stars), String(c.hotel && c.hotel.board), c.room && c.room.type].join(" ");
    const matchScore = computeVacationsMatchScore(q, matchText);
    return {
      offerId: `${destination}:${c.title}`.toLowerCase().replace(/\s+/g, "_").slice(0, 80),
      ...c,
      travelers,
      nights,
      departAt,
      returnAt,
      comparableKey,
      isComparable: true,
      estPriceEur: c.estPriceEur,
      estPricePerPersonEur: Math.round((c.estPriceEur / Math.max(1, travelers)) * 100) / 100,
      matchScore: Math.round(matchScore * 1000) / 1000,
      priceObservedAt: observedAt,
    };
  });

  const comparable = candidates.filter((x) => x && x.isComparable === true && x.comparableKey === comparableKey);
  // V2: euro-first
  comparable.sort((a, b) => (a.estPriceEur || 0) - (b.estPriceEur || 0));
  return comparable;
}

function registerVacations(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/v2/vacations/search",
    rateLimit({ windowMs: 60_000, max: Number(process.env.VACATIONS_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "vacations", res })) return;

      const parsed = validateVacationsInput(req.body);
      if (!parsed.ok) {
        return res.json({
          ok: false,
          module: "vacations",
          vertical: "vacations",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
          message: parsed.error === "missing_fields" ? "Missing required fields." : "Invalid input.",
          session: { session_id: sessionId, planId: plan.id },
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(5, Math.min(Number(process.env.VACATIONS_PRICE_TTL_SECONDS) || 120, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const offers = buildMockVacationOffers(parsed.value).slice(0, 3);
      const prices = offers.map((o) => (o && typeof o.estPriceEur === "number" ? o.estPriceEur : Number(o && o.estPriceEur))).filter((n) => Number.isFinite(n));
      const bestPriceEur = prices.length ? Math.min.apply(null, prices) : null;
      const avgPriceEur = prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null;
      const spreadEur = prices.length ? Math.round((Math.max.apply(null, prices) - Math.min.apply(null, prices)) * 100) / 100 : null;
      const basePriceEur = parsed.value && typeof parsed.value.basePriceEur === "number" ? parsed.value.basePriceEur : null;
      const savingsBestEur = Number.isFinite(basePriceEur) && basePriceEur > 0 && Number.isFinite(bestPriceEur) ? Math.round((basePriceEur - bestPriceEur) * 100) / 100 : null;

      const previousBestPriceEur = parsed.value && typeof parsed.value.previousBestPriceEur === "number" ? parsed.value.previousBestPriceEur : null;
      const priceDeltaEur = Number.isFinite(previousBestPriceEur) && Number.isFinite(bestPriceEur)
        ? Math.round((bestPriceEur - previousBestPriceEur) * 100) / 100
        : null;

      const comparableKey = offers && offers[0] && typeof offers[0].comparableKey === "string" ? offers[0].comparableKey : null;
      const offersTop3 = offers.map((o) => ({
        seller: o.provider,
        title: o.title,
        price: { amount: o.estPriceEur, currency: "EUR", period: "one_time" },
        url: null,
        meta: {
          offerId: o.offerId,
          hotel: o.hotel,
          room: o.room,
          board: o.hotel && o.hotel.board,
          stars: o.hotel && o.hotel.stars,
          travelers: o.travelers,
          nights: o.nights,
          departAt: o.departAt,
          returnAt: o.returnAt,
          comparableKey: o.comparableKey,
          matchScore: o.matchScore,
          priceObservedAt: o.priceObservedAt || nowIso,
        },
      }));
      return res.json({
        ok: true,
        module: "vacations",
        vertical: "vacations",
        session: { session_id: sessionId, planId: plan.id },
        input: parsed.value,
        offers,
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
          previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
          priceDeltaEur,
          offerCount: offersTop3.length,
        },
        ranking: "euro_first",
      });
    }
  );
}

module.exports = {
  registerVacations,
  computeVacationsMatchScore,
};
