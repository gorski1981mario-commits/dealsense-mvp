"use strict";

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function validateLoansInputV2(body) {
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

  const amountVal = pick(b, ["amountEur", "amount_eur", "amount", "loanAmountEur", "loan_amount_eur"]);
  const amountEur = toNumOrNull(amountVal);
  const termVal = pick(b, ["termMonths", "term_months", "months", "durationMonths", "duration_months"]);
  const termMonths = toNumOrNull(termVal);
  const purposeVal = pick(b, ["purpose", "loanPurpose", "loan_purpose"]);
  const purpose = typeof purposeVal === "string" ? purposeVal.trim() : null;
  const interestTypeVal = pick(b, ["interestType", "interest_type", "rateType", "rate_type"]);
  const interestType = typeof interestTypeVal === "string" ? interestTypeVal.trim().toLowerCase() : null;

  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";
  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;

  const baseMonthlyVal = pick(b, ["baseMonthlyPaymentEur", "base_monthly_payment_eur", "baseMonthlyEur", "base_monthly_eur", "basePaymentEur", "base_payment_eur"]);
  const baseMonthlyPaymentEur = toNumOrNull(baseMonthlyVal);
  const prevBestVal = pick(b, ["previousBestMonthlyPaymentEur", "previous_best_monthly_payment_eur", "prevBestMonthlyPaymentEur"]);
  const previousBestMonthlyPaymentEur = toNumOrNull(prevBestVal);

  const missingFields = [];
  if (amountEur == null) missingFields.push("amountEur");
  if (termMonths == null) missingFields.push("termMonths");
  if (missingFields.length > 0) return { ok: false, error: "missing_fields", missingFields };

  if (!Number.isFinite(amountEur) || amountEur <= 0 || amountEur > 5_000_000) return { ok: false, error: "invalid_amount" };
  if (!Number.isFinite(termMonths) || termMonths < 1 || termMonths > 480) return { ok: false, error: "invalid_term" };

  return {
    ok: true,
    value: {
      amountEur,
      termMonths: Math.floor(termMonths),
      purpose,
      interestType,
      currency,
      market,
      baseMonthlyPaymentEur: Number.isFinite(baseMonthlyPaymentEur) && baseMonthlyPaymentEur > 0 ? baseMonthlyPaymentEur : null,
      previousBestMonthlyPaymentEur: Number.isFinite(previousBestMonthlyPaymentEur) && previousBestMonthlyPaymentEur > 0 ? previousBestMonthlyPaymentEur : null,
    },
  };
}

function buildMockLoanQuotesV2(input) {
  const amount = Number(input.amountEur);
  const term = Number(input.termMonths);
  const baseMonthly = amount / Math.max(1, term);
  const observedAt = new Date().toISOString();

  const candidates = [
    { provider: "Dealsense Finance", product: "Loan Basic", aprPct: 6.9, feeEur: 199 },
    { provider: "Dealsense Finance", product: "Loan Plus", aprPct: 5.8, feeEur: 349 },
    { provider: "Dealsense Finance", product: "Loan Premium", aprPct: 4.9, feeEur: 499 },
  ].map((c) => {
    const apr = Number(c.aprPct) / 100;
    const interestMonthly = (amount * apr) / 12;
    const monthly = round2(baseMonthly + interestMonthly + (Number(c.feeEur) || 0) / Math.max(1, term));
    const score = clamp01(1 - monthly / Math.max(1, baseMonthly * 1.6));
    return {
      offerId: `${c.product}:${c.aprPct}`.toLowerCase().replace(/\s+/g, "_"),
      provider: c.provider,
      product: c.product,
      monthlyPaymentEur: monthly,
      totalCostEur: round2(monthly * term),
      aprPct: Number(c.aprPct),
      feeEur: Number(c.feeEur) || 0,
      matchScore: round2(score),
      priceObservedAt: observedAt,
    };
  });

  candidates.sort((a, b) => (a.monthlyPaymentEur || 0) - (b.monthlyPaymentEur || 0));
  return candidates;
}

function registerLoans(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/finance/loans/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.FINANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "finance", res })) return;

      return res.json({ ok: true, module: "finance_loans", session: { session_id: sessionId, planId: plan.id }, quotes: [] });
    }
  );

  app.post(
    "/api/v2/finance/loans/quote",
    rateLimit({ windowMs: 60_000, max: Number(process.env.FINANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "finance", res })) return;

      const parsed = validateLoansInputV2(req.body);
      if (!parsed.ok) {
        return res.json({
          ok: false,
          module: "finance_loans",
          vertical: "finance_loans",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
          message: parsed.error === "missing_fields" ? "Missing required fields." : "Invalid input.",
          session: { session_id: sessionId, planId: plan.id },
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(30, Math.min(Number(process.env.FINANCE_PRICE_TTL_SECONDS) || 600, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const quotes = buildMockLoanQuotesV2(parsed.value).slice(0, 3);
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
            message: "To estimate savings, include baseMonthlyPaymentEur from your current bank offer.",
          });
          return rec;
        }
        if (isCheaperThanBase === false) {
          rec.push({
            id: "no_cheaper_found",
            title: "No cheaper monthly payment found",
            message: "Based on current inputs, we did not find a lower monthly payment than your base. Consider adjusting termMonths or interestType.",
          });
          rec.push({
            id: "try_longer_term",
            title: "Try longer term",
            message: "Increasing termMonths can reduce monthly payment (but may increase total cost).",
            suggestionPatch: { termMonths: Math.min(480, Math.max(1, Number(parsed.value.termMonths) + 60)) },
          });
          rec.push({
            id: "try_fixed_vs_variable",
            title: "Try different rate type",
            message: "Try interestType 'variable' vs 'fixed' to explore options.",
            suggestionPatch: { interestType: parsed.value.interestType === "fixed" ? "variable" : "fixed" },
          });
        }
        return rec;
      })();

      const prevBest = parsed.value && typeof parsed.value.previousBestMonthlyPaymentEur === "number" ? parsed.value.previousBestMonthlyPaymentEur : null;
      const priceDeltaEur = Number.isFinite(prevBest) && Number.isFinite(bestMonthlyPaymentEur) ? round2(bestMonthlyPaymentEur - prevBest) : null;

      const comparableKey = [
        parsed.value.market || "",
        parsed.value.currency || "EUR",
        String(parsed.value.amountEur),
        String(parsed.value.termMonths),
        String(parsed.value.interestType || ""),
        String(parsed.value.purpose || ""),
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
        module: "finance_loans",
        vertical: "finance_loans",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          amountEur: parsed.value.amountEur,
          termMonths: parsed.value.termMonths,
          purpose: parsed.value.purpose,
          interestType: parsed.value.interestType,
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
  registerLoans,
};
