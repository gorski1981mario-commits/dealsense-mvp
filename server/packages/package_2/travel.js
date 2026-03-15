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

  const destinationVal = pick(b, ["destination", "dest", "to"]);
  const destination = typeof destinationVal === "string" ? destinationVal.trim() : "";
  const originVal = pick(b, ["origin", "from"]);
  const origin = typeof originVal === "string" ? originVal.trim() : "";
  const tripTypeVal = pick(b, ["tripType", "trip_type", "type"]);
  const tripType = typeof tripTypeVal === "string" ? tripTypeVal.trim() : "";
  const budgetVal = pick(b, ["budgetEur", "budget_eur", "budget", "maxBudgetEur", "max_budget_eur"]);
  const budgetEur = budgetVal != null ? Number(budgetVal) : null;
  const travelersVal = pick(b, ["travelers", "travellers", "travelersCount", "travelers_count"]);
  const travelers = travelersVal != null ? Number(travelersVal) : 1;
  const queryVal = pick(b, ["query", "q"]);
  const query = typeof queryVal === "string" ? queryVal.trim() : "";

  if (!destination && !query) return { ok: false, error: "destination_or_query_required" };
  if (!Number.isFinite(travelers) || travelers <= 0 || travelers > 12) return { ok: false, error: "invalid_travelers" };
  if (budgetEur != null && (!Number.isFinite(budgetEur) || budgetEur <= 0)) return { ok: false, error: "invalid_budget" };

  return {
    ok: true,
    value: {
      destination,
      origin,
      tripType,
      budgetEur,
      travelers,
      query,
      nights: b.nights != null ? Number(b.nights) : null,
      month: typeof b.month === "string" ? b.month.trim() : null,
      preferences: typeof b.preferences === "string" ? b.preferences.trim() : null,
    },
  };
}

function buildMockTravelQuotes(input) {
  const destination = input.destination || (input.query ? input.query : "");
  const travelers = input.travelers || 1;
  const baseBudget = input.budgetEur != null ? input.budgetEur : 1200;
  const q = input.query || [input.origin, destination, input.tripType, input.preferences].filter(Boolean).join(" ");

  const candidates = [
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
    {
      provider: "Dealsense Travel",
      title: `Budget smart: ${destination} (3★, flexibel)` ,
      tags: ["budget", "flex"],
      estPriceEur: Math.round(baseBudget * 0.8),
    },
  ].map((c) => {
    const matchText = [c.title, c.tags.join(" ")].join(" ");
    const score = computeTravelMatchScore(q, matchText);
    const perPerson = Math.max(1, travelers);
    return {
      ...c,
      travelers,
      estPriceEur: c.estPriceEur,
      estPricePerPersonEur: Math.round((c.estPriceEur / perPerson) * 100) / 100,
      matchScore: Math.round(score * 1000) / 1000,
    };
  });

  candidates.sort((a, b) => b.matchScore - a.matchScore);
  return candidates;
}

function registerTravel(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/travel/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.TRAVEL_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "travel", res })) return;

      const parsed = validateTravelInput(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ ok: false, error: parsed.error });
      }

      const quotes = buildMockTravelQuotes(parsed.value);

      return res.json({
        ok: true,
        module: "travel",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          destination: parsed.value.destination || null,
          origin: parsed.value.origin || null,
          tripType: parsed.value.tripType || null,
          travelers: parsed.value.travelers,
          budgetEur: parsed.value.budgetEur,
          month: parsed.value.month,
        },
        quotes,
      });
    }
  );
}

module.exports = {
  registerTravel,
  computeTravelMatchScore,
};
