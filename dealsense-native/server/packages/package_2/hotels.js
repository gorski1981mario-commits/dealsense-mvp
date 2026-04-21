"use strict";

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function validateHotelsInput(body) {
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

  const destinationVal = pick(b, ["destination", "dest", "city", "where", "query", "q"]);
  const destination = typeof destinationVal === "string" ? destinationVal.trim() : "";

  const checkinVal = pick(b, ["checkIn", "check_in", "checkinAt", "checkin_at", "departAt", "depart_at", "startDate", "start_date"]);
  const checkoutVal = pick(b, ["checkOut", "check_out", "checkoutAt", "checkout_at", "returnAt", "return_at", "endDate", "end_date"]);
  const checkInRaw = typeof checkinVal === "string" ? checkinVal.trim() : "";
  const checkOutRaw = typeof checkoutVal === "string" ? checkoutVal.trim() : "";

  const guestsVal = pick(b, ["guests", "travelers", "travellers", "travelersCount", "travelers_count"]);
  const guests = toNumOrNull(guestsVal) != null ? toNumOrNull(guestsVal) : 2;

  const roomsVal = pick(b, ["rooms", "roomsCount", "rooms_count"]);
  const rooms = toNumOrNull(roomsVal) != null ? toNumOrNull(roomsVal) : 1;

  const starsVal = pick(b, ["stars", "hotelStars", "hotel_stars"]);
  const stars = toNumOrNull(starsVal);

  const boardVal = pick(b, ["board", "mealPlan", "meal_plan"]);
  const board = typeof boardVal === "string" ? boardVal.trim().toLowerCase() : null;

  const basePriceVal = pick(b, ["basePriceEur", "base_price_eur", "basePrice", "base_price"]);
  const basePriceEur = toNumOrNull(basePriceVal);

  const prevBestPriceVal = pick(b, ["previousBestPriceEur", "previous_best_price_eur", "prevBestPriceEur", "prev_best_price_eur"]);
  const previousBestPriceEur = toNumOrNull(prevBestPriceVal);

  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;
  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";

  const missingFields = [];
  if (!destination) missingFields.push("destination_or_query");
  if (!checkInRaw) missingFields.push("checkIn");
  if (!checkOutRaw) missingFields.push("checkOut");
  if (missingFields.length > 0) return { ok: false, error: "missing_fields", missingFields };

  const checkIn = new Date(checkInRaw);
  const checkOut = new Date(checkOutRaw);
  if (Number.isNaN(checkIn.getTime())) return { ok: false, error: "invalid_check_in" };
  if (Number.isNaN(checkOut.getTime())) return { ok: false, error: "invalid_check_out" };
  if (!(checkOut.getTime() > checkIn.getTime())) return { ok: false, error: "check_out_must_be_after_check_in" };

  if (!Number.isFinite(guests) || guests <= 0 || guests > 12) return { ok: false, error: "invalid_guests" };
  if (!Number.isFinite(rooms) || rooms <= 0 || rooms > 6) return { ok: false, error: "invalid_rooms" };
  if (stars != null && (!Number.isFinite(stars) || stars < 1 || stars > 5)) return { ok: false, error: "invalid_stars" };

  return {
    ok: true,
    value: {
      destination,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests: Math.floor(guests),
      rooms: Math.floor(rooms),
      stars: stars != null ? Math.floor(stars) : null,
      board,
      market,
      currency,
      basePriceEur: Number.isFinite(basePriceEur) && basePriceEur > 0 ? basePriceEur : null,
      previousBestPriceEur: Number.isFinite(previousBestPriceEur) && previousBestPriceEur > 0 ? previousBestPriceEur : null,
    },
  };
}

function nightsBetween(checkInIso, checkOutIso) {
  const a = new Date(checkInIso);
  const b = new Date(checkOutIso);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
}

function buildMockHotelOffers(input) {
  const observedAt = new Date().toISOString();
  const nights = nightsBetween(input.checkIn, input.checkOut);

  const stars = input.stars != null ? input.stars : 4;
  const board = input.board || "room_only";

  const starsMul = 0.85 + (Math.max(1, Math.min(5, stars)) - 1) * 0.1;
  const boardMul = board === "all_inclusive" ? 1.35 : board === "bed_and_breakfast" ? 1.1 : 1.0;
  const guestsMul = 0.9 + Math.min(1.5, (Number(input.guests) || 2) / 2) * 0.35;
  const roomsMul = 0.95 + Math.min(1.8, (Number(input.rooms) || 1)) * 0.25;

  const base = 95 * nights * starsMul * boardMul * guestsMul * roomsMul;

  const candidates = [
    { provider: "Dealsense Hotels", title: `${input.destination} Budget Hotel`, price: round2(base * 0.88), stars: Math.max(2, stars - 1), board },
    { provider: "Dealsense Hotels", title: `${input.destination} City Hotel`, price: round2(base * 1.0), stars, board },
    { provider: "Dealsense Hotels", title: `${input.destination} Premium Stay`, price: round2(base * 1.12), stars: Math.min(5, stars + 1), board },
  ].map((c) => {
    const score = clamp01(1 - c.price / Math.max(1, base * 1.9));
    return {
      offerId: `${c.title}`.toLowerCase().replace(/\s+/g, "_").slice(0, 90),
      provider: c.provider,
      title: c.title,
      estPriceEur: c.price,
      hotel: { name: c.title, stars: c.stars, board: c.board },
      matchScore: round2(score),
      priceObservedAt: observedAt,
    };
  });

  candidates.sort((a, b) => (a.estPriceEur || 0) - (b.estPriceEur || 0));
  return candidates;
}

function registerHotels(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/hotels/search",
    rateLimit({ windowMs: 60_000, max: Number(process.env.TRAVEL_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "travel", res })) return;

      const parsed = validateHotelsInput(req.body);
      if (!parsed.ok) {
        return res.status(400).json({
          ok: false,
          module: "hotels",
          vertical: "hotels",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(5, Math.min(Number(process.env.TRAVEL_PRICE_TTL_SECONDS) || 60, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const offers = buildMockHotelOffers(parsed.value).slice(0, 3);
      const prices = offers.map((o) => (o && typeof o.estPriceEur === "number" ? o.estPriceEur : Number(o && o.estPriceEur))).filter((n) => Number.isFinite(n));
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
        parsed.value.destination,
        String(parsed.value.checkIn),
        String(parsed.value.checkOut),
        String(parsed.value.guests),
        String(parsed.value.rooms),
        String(parsed.value.stars || ""),
        String(parsed.value.board || ""),
      ]
        .join("|")
        .toLowerCase();

      const offersTop3 = offers.map((o) => ({
        seller: o.provider,
        title: o.title,
        price: { amount: o.estPriceEur, currency: "EUR", period: "one_time" },
        url: null,
        meta: {
          offerId: o.offerId,
          hotel: o.hotel,
          matchScore: o.matchScore,
          priceObservedAt: o.priceObservedAt || nowIso,
          comparableKey,
        },
      }));

      const recommendations = (() => {
        const rec = [];
        if (!Number.isFinite(basePriceEur) || basePriceEur <= 0) {
          rec.push({
            id: "provide_base_price",
            title: "Provide your current price",
            message: "To estimate savings, include basePriceEur from your current hotel offer.",
          });
          return rec;
        }
        if (isCheaperThanBase === false) {
          rec.push({
            id: "no_cheaper_found",
            title: "No cheaper offer found",
            message: "We did not find a lower total price than your base. Try changing stars or board.",
          });
        }
        return rec;
      })();

      return res.json({
        ok: true,
        module: "hotels",
        vertical: "hotels",
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
  registerHotels,
};
