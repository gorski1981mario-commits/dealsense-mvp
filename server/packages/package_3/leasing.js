"use strict";

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function validateLeasingInputV2(body) {
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

  const vehiclePriceVal = pick(b, ["vehiclePriceEur", "vehicle_price_eur", "carPriceEur", "car_price_eur", "priceEur", "price_eur"]);
  const vehiclePriceEur = toNumOrNull(vehiclePriceVal);

  const termVal = pick(b, ["termMonths", "term_months", "months", "durationMonths", "duration_months"]);
  const termMonths = toNumOrNull(termVal);

  const downPaymentVal = pick(b, ["downPaymentEur", "down_payment_eur", "depositEur", "deposit_eur", "upfrontEur", "upfront_eur"]);
  const downPaymentEur = toNumOrNull(downPaymentVal);

  const mileageVal = pick(b, ["mileageKmPerYear", "mileage_km_per_year", "annualMileageKm", "annual_mileage_km"]);
  const mileageKmPerYear = toNumOrNull(mileageVal);

  const residualPctVal = pick(b, ["residualPct", "residual_pct", "residualValuePct", "residual_value_pct"]);
  const residualPct = toNumOrNull(residualPctVal);

  const rateTypeVal = pick(b, ["rateType", "rate_type", "interestType", "interest_type"]);
  const rateType = typeof rateTypeVal === "string" ? rateTypeVal.trim().toLowerCase() : null;

  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";
  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;

  const baseMonthlyVal = pick(b, ["baseMonthlyPaymentEur", "base_monthly_payment_eur", "baseMonthlyEur", "base_monthly_eur"]);
  const baseMonthlyPaymentEur = toNumOrNull(baseMonthlyVal);

  const prevBestVal = pick(b, ["previousBestMonthlyPaymentEur", "previous_best_monthly_payment_eur", "prevBestMonthlyPaymentEur"]);
  const previousBestMonthlyPaymentEur = toNumOrNull(prevBestVal);

  const missingFields = [];
  if (vehiclePriceEur == null) missingFields.push("vehiclePriceEur");
  if (termMonths == null) missingFields.push("termMonths");
  if (missingFields.length > 0) return { ok: false, error: "missing_fields", missingFields };

  if (!Number.isFinite(vehiclePriceEur) || vehiclePriceEur <= 1000 || vehiclePriceEur > 500_000) return { ok: false, error: "invalid_vehicle_price" };
  if (!Number.isFinite(termMonths) || termMonths < 6 || termMonths > 84) return { ok: false, error: "invalid_term" };

  const cleanDown = Number.isFinite(downPaymentEur) && downPaymentEur >= 0 ? downPaymentEur : 0;
  const cleanMileage = Number.isFinite(mileageKmPerYear) && mileageKmPerYear > 0 ? mileageKmPerYear : null;
  const cleanResidual = Number.isFinite(residualPct) && residualPct > 0 && residualPct < 100 ? residualPct : null;
  const cleanRateType = rateType === "fixed" || rateType === "variable" ? rateType : null;

  return {
    ok: true,
    value: {
      vehiclePriceEur,
      termMonths: Math.floor(termMonths),
      downPaymentEur: round2(cleanDown),
      mileageKmPerYear: cleanMileage,
      residualPct: cleanResidual,
      rateType: cleanRateType,
      currency,
      market,
      baseMonthlyPaymentEur: Number.isFinite(baseMonthlyPaymentEur) && baseMonthlyPaymentEur > 0 ? baseMonthlyPaymentEur : null,
      previousBestMonthlyPaymentEur: Number.isFinite(previousBestMonthlyPaymentEur) && previousBestMonthlyPaymentEur > 0 ? previousBestMonthlyPaymentEur : null,
    },
  };
}

function buildMockLeasingQuotesV2(input) {
  const price = Number(input.vehiclePriceEur);
  const term = Number(input.termMonths);
  const down = Number(input.downPaymentEur) || 0;

  const observedAt = new Date().toISOString();

  const mileage = Number.isFinite(input.mileageKmPerYear) ? input.mileageKmPerYear : 12000;
  const mileageMul = clamp01(0.75 + Math.min(1, mileage / 30000) * 0.5); // ~0.75..1.25

  const residualPct = Number.isFinite(input.residualPct) ? input.residualPct : 55;
  const residualValue = (price * residualPct) / 100;

  const principal = Math.max(0, price - down - residualValue);

  const candidates = [
    { provider: "Dealsense Leasing", product: "Lease Basic", aprPct: 6.2, feeEur: 250 },
    { provider: "Dealsense Leasing", product: "Lease Plus", aprPct: 5.4, feeEur: 350 },
    { provider: "Dealsense Leasing", product: "Lease Premium", aprPct: 4.8, feeEur: 500 },
  ].map((c) => {
    const apr = Number(c.aprPct) / 100;
    const interestMonthly = (principal * apr) / 12;
    const baseMonthly = principal / Math.max(1, term);
    const monthly = round2((baseMonthly + interestMonthly + (Number(c.feeEur) || 0) / Math.max(1, term)) * mileageMul);
    const score = clamp01(1 - monthly / Math.max(1, (price / Math.max(1, term)) * 2.2));
    return {
      offerId: `${c.product}:${c.aprPct}`.toLowerCase().replace(/\s+/g, "_"),
      provider: c.provider,
      product: c.product,
      monthlyPaymentEur: monthly,
      totalCostEur: round2(monthly * term + down),
      aprPct: Number(c.aprPct),
      feeEur: Number(c.feeEur) || 0,
      matchScore: round2(score),
      priceObservedAt: observedAt,
    };
  });

  candidates.sort((a, b) => (a.monthlyPaymentEur || 0) - (b.monthlyPaymentEur || 0));
  return candidates;
}

function registerLeasing(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/v2/finance/leasing/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.FINANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "finance", res })) return;

      const parsed = validateLeasingInputV2(req.body);
      if (!parsed.ok) {
        return res.json({
          ok: false,
          module: "finance_leasing",
          vertical: "finance_leasing",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
          message: parsed.error === "missing_fields" ? "Missing required fields." : "Invalid input.",
          session: { session_id: sessionId, planId: plan.id },
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(30, Math.min(Number(process.env.FINANCE_PRICE_TTL_SECONDS) || 600, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const quotes = buildMockLeasingQuotesV2(parsed.value).slice(0, 3);
      const prices = quotes.map((q) => (q && typeof q.monthlyPaymentEur === "number" ? q.monthlyPaymentEur : Number(q && q.monthlyPaymentEur))).filter((n) => Number.isFinite(n));
      const bestMonthlyPaymentEur = prices.length ? Math.min.apply(null, prices) : null;
      const avgMonthlyPaymentEur = prices.length ? round2(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
      const spreadMonthlyPaymentEur = prices.length ? round2(Math.max.apply(null, prices) - Math.min.apply(null, prices)) : null;

      const baseMonthlyPaymentEur = parsed.value && typeof parsed.value.baseMonthlyPaymentEur === "number" ? parsed.value.baseMonthlyPaymentEur : null;
      const isCheaperThanBase = Number.isFinite(baseMonthlyPaymentEur) && baseMonthlyPaymentEur > 0 && Number.isFinite(bestMonthlyPaymentEur)
        ? bestMonthlyPaymentEur < baseMonthlyPaymentEur
        : null;
      const savingsBestEur = isCheaperThanBase === true ? round2(baseMonthlyPaymentEur - bestMonthlyPaymentEur) : null;

      const recommendations = (() => {
        const rec = [];
        if (!Number.isFinite(baseMonthlyPaymentEur) || baseMonthlyPaymentEur <= 0) {
          rec.push({
            id: "provide_base_monthly_payment",
            title: "Provide your current monthly payment",
            message: "To estimate savings, include baseMonthlyPaymentEur from your current leasing contract.",
          });
          return rec;
        }
        if (isCheaperThanBase === false) {
          rec.push({
            id: "no_cheaper_found",
            title: "No cheaper monthly payment found",
            message: "We did not find a lower monthly payment than your base. Consider adjusting termMonths, downPaymentEur, or mileageKmPerYear.",
          });
        }
        return rec;
      })();

      const prevBest = parsed.value && typeof parsed.value.previousBestMonthlyPaymentEur === "number" ? parsed.value.previousBestMonthlyPaymentEur : null;
      const priceDeltaEur = Number.isFinite(prevBest) && Number.isFinite(bestMonthlyPaymentEur) ? round2(bestMonthlyPaymentEur - prevBest) : null;

      const comparableKey = [
        parsed.value.market || "",
        parsed.value.currency || "EUR",
        String(parsed.value.vehiclePriceEur),
        String(parsed.value.termMonths),
        String(parsed.value.downPaymentEur || 0),
        String(parsed.value.mileageKmPerYear || ""),
        String(parsed.value.residualPct || ""),
      ]
        .join("|")
        .replace(/\|+$/g, "")
        .toLowerCase();

      const offersTop3 = quotes.map((q) => ({
        seller: q.provider,
        title: q.product,
        price: { amount: q.monthlyPaymentEur, currency: "EUR", period: "monthly" },
        url: null,
        meta: {
          offerId: q.offerId,
          aprPct: q.aprPct,
          feeEur: q.feeEur,
          totalCostEur: q.totalCostEur,
          matchScore: q.matchScore,
          priceObservedAt: q.priceObservedAt || nowIso,
          comparableKey,
        },
      }));

      return res.json({
        ok: true,
        module: "finance_leasing",
        vertical: "finance_leasing",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          vehiclePriceEur: parsed.value.vehiclePriceEur,
          termMonths: parsed.value.termMonths,
          downPaymentEur: parsed.value.downPaymentEur,
          mileageKmPerYear: parsed.value.mileageKmPerYear,
          residualPct: parsed.value.residualPct,
          rateType: parsed.value.rateType,
          market: parsed.value.market,
          currency: parsed.value.currency,
          baseMonthlyPaymentEur: parsed.value.baseMonthlyPaymentEur,
          previousBestMonthlyPaymentEur: parsed.value.previousBestMonthlyPaymentEur,
        },
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
          bestMonthlyPaymentEur,
          avgMonthlyPaymentEur,
          spreadMonthlyPaymentEur,
          baseMonthlyPaymentEur: Number.isFinite(baseMonthlyPaymentEur) && baseMonthlyPaymentEur > 0 ? baseMonthlyPaymentEur : null,
          savingsBestEur,
          isCheaperThanBase,
          previousBestMonthlyPaymentEur: Number.isFinite(prevBest) && prevBest > 0 ? prevBest : null,
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
  registerLeasing,
};
