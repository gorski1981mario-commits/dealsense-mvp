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

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function isoDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

function addDays(date, days) {
  const d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d;
}

function computeInsuranceMatchScore(query, candidate) {
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
    "verzekering",
    "insurance",
    "polis",
    "dekking",
    "coverage",
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

function validateInsuranceInput(body) {
  const b = body && typeof body === "object" ? body : {};
  const pick = (obj, keys) => {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
    }
    return undefined;
  };
  const type = typeof b.type === "string" ? b.type.trim().toLowerCase() : "";
  const tripDestinationRaw = pick(b, ["tripDestination", "trip_destination", "destination"]);
  const tripDestination = typeof tripDestinationRaw === "string" ? tripDestinationRaw.trim() : "";
  const tripType = typeof b.tripType === "string" ? b.tripType.trim() : "";
  const travelersRaw = pick(b, ["travelers", "travellers", "travelersCount", "travelers_count"]);
  const travelers = travelersRaw != null ? Number(travelersRaw) : 1;
  const durationDaysRaw = pick(b, ["durationDays", "duration_days", "duration"]);
  const durationDays = durationDaysRaw != null ? Number(durationDaysRaw) : null;
  const budgetEurRaw = pick(b, ["budgetEur", "budget_eur", "budget"]);
  const budgetEur = budgetEurRaw != null ? Number(budgetEurRaw) : null;
  const baseMonthlyRaw = pick(b, ["baseMonthlyEur", "base_monthly_eur", "baseMonthly", "base_monthly", "basePriceMonthlyEur"]);
  const baseMonthlyEur = baseMonthlyRaw != null ? Number(baseMonthlyRaw) : null;
  const queryRaw = pick(b, ["query", "q"]);
  const query = typeof queryRaw === "string" ? queryRaw.trim() : "";
  const billingPeriodVal = pick(b, ["billingPeriod", "billing_period", "period"]);
  const billingPeriodRaw = typeof billingPeriodVal === "string" ? billingPeriodVal.trim().toLowerCase() : "";

  if (!type && !query) return { ok: false, error: "type_or_query_required" };
  if (!Number.isFinite(travelers) || travelers <= 0 || travelers > 12) return { ok: false, error: "invalid_travelers" };
  if (durationDays != null && (!Number.isFinite(durationDays) || durationDays <= 0 || durationDays > 365)) return { ok: false, error: "invalid_duration" };
  if (budgetEur != null && (!Number.isFinite(budgetEur) || budgetEur <= 0)) return { ok: false, error: "invalid_budget" };
  if (baseMonthlyEur == null) return { ok: false, error: "base_monthly_required" };
  if (!Number.isFinite(baseMonthlyEur) || baseMonthlyEur <= 0) return { ok: false, error: "invalid_base_monthly" };

  const startDateVal = pick(b, ["startDate", "start_date", "departAt", "depart_at"]);
  const endDateVal = pick(b, ["endDate", "end_date", "returnAt", "return_at"]);
  const startDateRaw = typeof startDateVal === "string" ? startDateVal.trim() : "";
  const endDateRaw = typeof endDateVal === "string" ? endDateVal.trim() : "";
  if (!startDateRaw) return { ok: false, error: "start_date_required" };
  if (!endDateRaw) return { ok: false, error: "end_date_required" };

  const startParsed = new Date(startDateRaw);
  const endParsed = new Date(endDateRaw);
  if (Number.isNaN(startParsed.getTime())) return { ok: false, error: "invalid_start_date" };
  if (Number.isNaN(endParsed.getTime())) return { ok: false, error: "invalid_end_date" };
  if (!(endParsed.getTime() > startParsed.getTime())) return { ok: false, error: "end_date_must_be_after_start_date" };

  if (billingPeriodRaw && billingPeriodRaw !== "monthly") {
    return { ok: false, error: "billing_period_must_be_monthly" };
  }

  const normalizedType = type || "travel";
  return {
    ok: true,
    value: {
      type: normalizedType,
      tripDestination,
      tripType,
      travelers,
      durationDays,
      budgetEur,
      baseMonthlyEur,
      query,
      coverage: typeof pick(b, ["coverage"]) === "string" ? pick(b, ["coverage"]).trim() : null,
      excessEur: pick(b, ["excessEur", "excess_eur", "deductibleEur", "deductible_eur"]) != null ? Number(pick(b, ["excessEur", "excess_eur", "deductibleEur", "deductible_eur"])) : null,
      startDate: startDateRaw,
      endDate: endDateRaw,
      currency: typeof pick(b, ["currency"]) === "string" ? pick(b, ["currency"]).trim().toUpperCase() : "EUR",
      billingPeriod: "monthly",
    },
  };
}

function buildMockInsuranceQuotes(input) {
  const t = input.type || "travel";
  const destination = input.tripDestination || "";
  const travelers = input.travelers || 1;
  const currency = input.currency || "EUR";
  const billingPeriod = input.billingPeriod || "monthly";
  const baseMonthlyEur = Number(input.baseMonthlyEur);

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
  const quoteValidUntil = addDays(new Date(), 2);

  const q =
    input.query ||
    [
      t,
      destination,
      input.tripType,
      input.coverage,
      input.excessEur != null ? `excess${input.excessEur}` : null,
    ]
      .filter(Boolean)
      .join(" ");

  const base = 9 + Math.min(120, Math.max(0, durationDays)) * 0.35 + Math.max(0, travelers - 1) * 4;
  const candidates = [
    {
      provider: "Dealsense Insurance",
      title: `Basis ${t} verzekering` + (destination ? ` (${destination})` : ""),
      tags: ["basis", "eu"],
      monthlyEur: round2(base * 0.85),
      coverage: "Standard",
      deductibleEur: 150,
      region: "EU",
      tier: "basic",
      reviewScore: 4.2,
      reviewCount: 820,
    },
    {
      provider: "Dealsense Insurance",
      title: `Plus ${t} verzekering` + (destination ? ` (${destination})` : ""),
      tags: ["plus", "world"],
      monthlyEur: round2(base * 1.05),
      coverage: "Extended",
      deductibleEur: 100,
      region: "WORLD",
      tier: "plus",
      reviewScore: 4.4,
      reviewCount: 540,
    },
    {
      provider: "Dealsense Insurance",
      title: `Premium ${t} verzekering` + (destination ? ` (${destination})` : ""),
      tags: ["premium", "sports", "medical"],
      monthlyEur: round2(base * 1.25),
      coverage: "Premium",
      deductibleEur: 50,
      region: "WORLD",
      tier: "premium",
      reviewScore: 4.6,
      reviewCount: 260,
    },
  ].map((c) => {
    const matchText = [c.title, c.tags.join(" "), c.coverage, String(c.deductibleEur)].join(" ");
    const score = computeInsuranceMatchScore(q, matchText);
    const baseOk = Number(c.monthlyEur) < baseMonthlyEur;
    const savingsMonthly = baseOk ? round2(baseMonthlyEur - Number(c.monthlyEur)) : null;

    const reviewScore01 = clamp01((Number(c.reviewScore) || 0) / 5);
    const reviewStrength = clamp01(Math.log10(1 + (Number(c.reviewCount) || 0)) / 4);
    const review01 = clamp01(0.75 * reviewScore01 + 0.25 * reviewStrength);

    const priceAdv01 = baseOk && baseMonthlyEur > 0 ? clamp01((baseMonthlyEur - Number(c.monthlyEur)) / baseMonthlyEur) : 0;

    const overallScore = clamp01(0.45 * score + 0.35 * review01 + 0.20 * priceAdv01);

    return {
      offerId: `${t}:${c.tier}:${String(c.deductibleEur)}`.toLowerCase(),
      type: t,
      ...c,
      travelers,
      durationDays,
      price: { amount: Number(c.monthlyEur), currency, period: billingPeriod },
      basePrice: { amount: baseMonthlyEur, currency, period: billingPeriod },
      savings: { amount: Number(savingsMonthly), currency, period: billingPeriod },
      startDate: isoDate(start),
      endDate: isoDate(end),
      quoteValidUntil: isoDate(quoteValidUntil),
      baseRule: { requireLowerThanBase: true },
      comparableKey: `${t}:${billingPeriod}:${travelers}:${isoDate(start)}:${isoDate(end)}`.toLowerCase(),
      matchScore: Math.round(score * 1000) / 1000,
      review: { score: Number(c.reviewScore), count: Number(c.reviewCount) },
      overallScore: Math.round(overallScore * 1000) / 1000,
      isComparable: true,
      isCheaperThanBase: baseOk,
    };
  });

  const comparable = candidates.filter((x) => x && x.isComparable === true);
  const cheaper = comparable.filter((x) => x.isCheaperThanBase === true);
  cheaper.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
  return cheaper;
}

function registerInsurance(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/insurance/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.INSURANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "insurance", res })) return;

      const parsed = validateInsuranceInput(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ ok: false, error: parsed.error });
      }

      const quotes = buildMockInsuranceQuotes(parsed.value);

      return res.json({
        ok: true,
        module: "insurance",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          type: parsed.value.type,
          tripDestination: parsed.value.tripDestination || null,
          travelers: parsed.value.travelers,
          durationDays: parsed.value.durationDays,
          budgetEur: parsed.value.budgetEur,
          baseMonthlyEur: parsed.value.baseMonthlyEur,
          currency: parsed.value.currency,
          billingPeriod: parsed.value.billingPeriod,
          startDate: parsed.value.startDate,
          endDate: parsed.value.endDate,
        },
        quotes,
      });
    }
  );
}

module.exports = {
  registerInsurance,
  computeInsuranceMatchScore,
};
