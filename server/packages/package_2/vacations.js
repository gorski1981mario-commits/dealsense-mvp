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

  const destinationVal = pick(b, ["destination", "dest", "to"]);
  const destination = typeof destinationVal === "string" ? destinationVal.trim() : "";
  const originVal = pick(b, ["origin", "from"]);
  const origin = typeof originVal === "string" ? originVal.trim() : "";
  const travelersVal = pick(b, ["travelers", "travellers", "travelersCount", "travelers_count"]);
  const travelers = travelersVal != null ? Number(travelersVal) : 2;
  const nightsVal = pick(b, ["nights", "nightsCount", "nights_count"]);
  const nights = nightsVal != null ? Number(nightsVal) : null;
  const budgetVal = pick(b, ["budgetEur", "budget_eur", "budget", "maxBudgetEur", "max_budget_eur"]);
  const budgetEur = budgetVal != null ? Number(budgetVal) : null;
  const queryVal = pick(b, ["query", "q"]);
  const query = typeof queryVal === "string" ? queryVal.trim() : "";

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

  if (!destination && !query) return { ok: false, error: "destination_or_query_required" };
  if (!Number.isFinite(travelers) || travelers <= 0 || travelers > 12) return { ok: false, error: "invalid_travelers" };
  if (nights != null && (!Number.isFinite(nights) || nights <= 0 || nights > 60)) return { ok: false, error: "invalid_nights" };
  if (budgetEur != null && (!Number.isFinite(budgetEur) || budgetEur <= 0)) return { ok: false, error: "invalid_budget" };

  if (!departAtRaw) return { ok: false, error: "depart_at_required" };
  if (!returnAtRaw) return { ok: false, error: "return_at_required" };
  if (!departAt) return { ok: false, error: "invalid_depart_at" };
  if (!returnAt) return { ok: false, error: "invalid_return_at" };
  if (!(returnAt.getTime() > departAt.getTime())) return { ok: false, error: "return_at_must_be_after_depart_at" };

  if (stars == null) return { ok: false, error: "stars_required" };
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) return { ok: false, error: "invalid_stars" };
  if (!roomType) return { ok: false, error: "room_type_required" };
  if (!board) return { ok: false, error: "board_required" };

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
    },
  };
}

function buildMockVacationOffers(input) {
  const destination = input.destination || input.query || "";
  const travelers = input.travelers || 2;
  const nights = input.nights != null ? input.nights : 7;
  const budget = input.budgetEur != null ? input.budgetEur : 1500;
  const q = input.query || [input.origin, destination, input.preferences].filter(Boolean).join(" ");

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
      title: `Zon & strand: ${destination}`,
      tags: ["beach", "allinclusive"],
      estPriceEur: Math.round(budget * 0.95),
      hotel: { name: `${destination} Beach Resort`, stars: stars, board: board },
      room: { type: roomType },
    },
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
    };
  });

  const comparable = candidates.filter((x) => x && x.isComparable === true && x.comparableKey === comparableKey);
  comparable.sort((a, b) => b.matchScore - a.matchScore);
  return comparable;
}

function registerVacations(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/vacations/search",
    rateLimit({ windowMs: 60_000, max: Number(process.env.VACATIONS_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "vacations", res })) return;

      const parsed = validateVacationsInput(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ ok: false, error: parsed.error });
      }

      const offers = buildMockVacationOffers(parsed.value);
      return res.json({
        ok: true,
        module: "vacations",
        session: { session_id: sessionId, planId: plan.id },
        input: parsed.value,
        offers,
      });
    }
  );
}

module.exports = {
  registerVacations,
  computeVacationsMatchScore,
};
