"use strict";

function clamp01(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function validateCreditCardsInputV2(body) {
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

  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;
  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";

  const baseMonthlyVal = pick(b, ["baseMonthlyFeeEur", "base_monthly_fee_eur", "baseMonthlyEur", "base_monthly_eur", "baseMonthlyFee", "base_monthly_fee"]);
  const baseMonthlyFeeEur = toNumOrNull(baseMonthlyVal);

  const prevBestVal = pick(b, ["previousBestMonthlyFeeEur", "previous_best_monthly_fee_eur", "prevBestMonthlyFeeEur"]);
  const previousBestMonthlyFeeEur = toNumOrNull(prevBestVal);

  const hasAny = baseMonthlyFeeEur != null || previousBestMonthlyFeeEur != null || market != null;
  if (!hasAny) {
    return { ok: false, error: "missing_fields", missingFields: ["baseMonthlyFeeEur"] };
  }

  return {
    ok: true,
    value: {
      market,
      currency,
      baseMonthlyFeeEur: Number.isFinite(baseMonthlyFeeEur) && baseMonthlyFeeEur > 0 ? baseMonthlyFeeEur : null,
      previousBestMonthlyFeeEur: Number.isFinite(previousBestMonthlyFeeEur) && previousBestMonthlyFeeEur > 0 ? previousBestMonthlyFeeEur : null,
    },
  };
}

function buildMockCreditCardOffersV2(input) {
  const observedAt = new Date().toISOString();
  const base = input.baseMonthlyFeeEur != null ? input.baseMonthlyFeeEur : 6;

  const candidates = [
    { provider: "Dealsense Cards", product: "Card Basic", monthlyEur: round2(base * 0.75), cashbackPct: 0.25, foreignFeePct: 1.8 },
    { provider: "Dealsense Cards", product: "Card Plus", monthlyEur: round2(base * 0.95), cashbackPct: 0.5, foreignFeePct: 1.2 },
    { provider: "Dealsense Cards", product: "Card Premium", monthlyEur: round2(base * 1.15), cashbackPct: 1.0, foreignFeePct: 0.0 },
  ].map((c) => {
    const score = clamp01(1 - c.monthlyEur / Math.max(1, base * 1.6));
    return {
      offerId: `${c.product}:${c.monthlyEur}`.toLowerCase().replace(/\s+/g, "_"),
      provider: c.provider,
      product: c.product,
      monthlyFeeEur: c.monthlyEur,
      cashbackPct: c.cashbackPct,
      foreignFeePct: c.foreignFeePct,
      matchScore: round2(score),
      priceObservedAt: observedAt,
    };
  });

  candidates.sort((a, b) => (a.monthlyFeeEur || 0) - (b.monthlyFeeEur || 0));
  return candidates;
}

function registerCreditCards(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/v2/finance/credit-cards/compare",
    rateLimit({ windowMs: 60_000, max: Number(process.env.FINANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "finance", res })) return;

      const parsed = validateCreditCardsInputV2(req.body);
      if (!parsed.ok) {
        return res.json({
          ok: false,
          module: "finance_credit_cards",
          vertical: "finance_credit_cards",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
          message: parsed.error === "missing_fields" ? "Missing required fields." : "Invalid input.",
          session: { session_id: sessionId, planId: plan.id },
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(30, Math.min(Number(process.env.FINANCE_PRICE_TTL_SECONDS) || 600, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const results = buildMockCreditCardOffersV2(parsed.value).slice(0, 3);
      const prices = results.map((x) => (x && typeof x.monthlyFeeEur === "number" ? x.monthlyFeeEur : Number(x && x.monthlyFeeEur))).filter((n) => Number.isFinite(n));
      const bestMonthlyEur = prices.length ? Math.min.apply(null, prices) : null;
      const avgMonthlyEur = prices.length ? round2(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
      const spreadMonthlyEur = prices.length ? round2(Math.max.apply(null, prices) - Math.min.apply(null, prices)) : null;

      const baseMonthlyEur = parsed.value && typeof parsed.value.baseMonthlyFeeEur === "number" ? parsed.value.baseMonthlyFeeEur : null;
      const isCheaperThanBase = Number.isFinite(baseMonthlyEur) && baseMonthlyEur > 0 && Number.isFinite(bestMonthlyEur) ? bestMonthlyEur < baseMonthlyEur : null;
      const savingsBestEur = isCheaperThanBase === true ? round2(baseMonthlyEur - bestMonthlyEur) : null;

      const prevBest = parsed.value && typeof parsed.value.previousBestMonthlyFeeEur === "number" ? parsed.value.previousBestMonthlyFeeEur : null;
      const priceDeltaEur = Number.isFinite(prevBest) && Number.isFinite(bestMonthlyEur) ? round2(bestMonthlyEur - prevBest) : null;

      const comparableKey = [parsed.value.market || "", parsed.value.currency || "EUR", "credit_cards"].join("|").toLowerCase();

      const offersTop3 = results.map((o) => ({
        seller: o.provider,
        title: o.product,
        price: { amount: o.monthlyFeeEur, currency: "EUR", period: "monthly" },
        url: null,
        meta: {
          offerId: o.offerId,
          cashbackPct: o.cashbackPct,
          foreignFeePct: o.foreignFeePct,
          matchScore: o.matchScore,
          priceObservedAt: o.priceObservedAt || nowIso,
          comparableKey,
        },
      }));

      const recommendations = (() => {
        const rec = [];
        if (!Number.isFinite(baseMonthlyEur) || baseMonthlyEur <= 0) {
          rec.push({
            id: "provide_base_monthly_fee",
            title: "Provide your current monthly card fee",
            message: "To estimate savings, include baseMonthlyFeeEur from your current card.",
          });
          return rec;
        }
        if (isCheaperThanBase === false) {
          rec.push({
            id: "no_cheaper_found",
            title: "No cheaper fee found",
            message: "We did not find a lower monthly fee than your base. Consider focusing on cashback/foreign fees instead of monthly fee.",
          });
        }
        return rec;
      })();

      return res.json({
        ok: true,
        module: "finance_credit_cards",
        vertical: "finance_credit_cards",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          market: parsed.value.market,
          currency: parsed.value.currency,
          baseMonthlyFeeEur: parsed.value.baseMonthlyFeeEur,
          previousBestMonthlyFeeEur: parsed.value.previousBestMonthlyFeeEur,
        },
        results,
        offersTop3,
        comparableKey,
        freshness: { generatedAt: nowIso, ttlSeconds, validUntil, pricesMayChange: true },
        stats: {
          bestMonthlyEur,
          avgMonthlyEur,
          spreadMonthlyEur,
          baseMonthlyEur: Number.isFinite(baseMonthlyEur) && baseMonthlyEur > 0 ? baseMonthlyEur : null,
          savingsBestEur,
          isCheaperThanBase,
          previousBestMonthlyEur: Number.isFinite(prevBest) && prevBest > 0 ? prevBest : null,
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
  registerCreditCards,
};
