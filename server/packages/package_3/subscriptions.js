"use strict";

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function validateSubscriptionsInputV2(body) {
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

  const categoryVal = pick(b, ["category", "type", "subscriptionType", "subscription_type"]);
  const category = typeof categoryVal === "string" ? categoryVal.trim().toLowerCase() : "";
  const currentVal = pick(b, ["currentProvider", "current_provider", "provider"]);
  const currentProvider = typeof currentVal === "string" ? currentVal.trim() : null;

  const marketVal = pick(b, ["market", "country", "countryCode", "country_code"]);
  const market = typeof marketVal === "string" ? marketVal.trim().toUpperCase() : null;
  const currencyVal = pick(b, ["currency", "ccy"]);
  const currency = typeof currencyVal === "string" ? currencyVal.trim().toUpperCase() : "EUR";

  const baseMonthlyVal = pick(b, ["baseMonthlyEur", "base_monthly_eur", "basePriceEur", "base_price_eur", "currentMonthlyEur", "current_monthly_eur"]);
  const baseMonthlyEur = toNumOrNull(baseMonthlyVal);
  const prevBestVal = pick(b, ["previousBestMonthlyEur", "previous_best_monthly_eur", "prevBestMonthlyEur"]);
  const previousBestMonthlyEur = toNumOrNull(prevBestVal);

  if (!category) return { ok: false, error: "missing_fields", missingFields: ["category"] };

  return {
    ok: true,
    value: {
      category,
      currentProvider,
      market,
      currency,
      baseMonthlyEur: Number.isFinite(baseMonthlyEur) && baseMonthlyEur > 0 ? baseMonthlyEur : null,
      previousBestMonthlyEur: Number.isFinite(previousBestMonthlyEur) && previousBestMonthlyEur > 0 ? previousBestMonthlyEur : null,
    },
  };
}

function buildMockSubscriptionOffersV2(input) {
  const observedAt = new Date().toISOString();
  const category = input && typeof input.category === "string" ? input.category.trim().toLowerCase() : "";
  const baseDefault = category === "bank_account" ? 4 : 35;
  const base = input.baseMonthlyEur != null ? input.baseMonthlyEur : baseDefault;
  const floorEur = category === "bank_account" ? 0.5 : 12;
  const candidates = [
    { provider: "Dealsense Subscriptions", product: "Basic", monthlyEur: round2(Math.max(floorEur, base * 0.82)) },
    { provider: "Dealsense Subscriptions", product: "Plus", monthlyEur: round2(Math.max(floorEur, base * 0.95)) },
    { provider: "Dealsense Subscriptions", product: "Premium", monthlyEur: round2(Math.max(floorEur, base * 1.05)) },
  ].map((c) => ({
    offerId: `${input.category}:${c.product}`.toLowerCase(),
    provider: c.provider,
    product: c.product,
    monthlyEur: c.monthlyEur,
    priceObservedAt: observedAt,
  }));
  candidates.sort((a, b) => (a.monthlyEur || 0) - (b.monthlyEur || 0));
  return candidates;
}

function registerSubscriptions(app, deps) {
  const { rateLimit, getClientIP, getSession, getEffectivePlanFromSession, requireCapabilityOr402 } = deps;

  app.post(
    "/api/finance/subscriptions/compare",
    rateLimit({ windowMs: 60_000, max: Number(process.env.FINANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "finance", res })) return;

      return res.json({ ok: true, module: "finance_subscriptions", session: { session_id: sessionId, planId: plan.id }, results: [] });
    }
  );

  app.post(
    "/api/v2/finance/subscriptions/compare",
    rateLimit({ windowMs: 60_000, max: Number(process.env.FINANCE_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      res.setHeader("cache-control", "no-store");
      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "finance", res })) return;

      const parsed = validateSubscriptionsInputV2(req.body);
      if (!parsed.ok) {
        return res.json({
          ok: false,
          module: "finance_subscriptions",
          vertical: "finance_subscriptions",
          error: parsed.error,
          missingFields: parsed.missingFields || null,
          message: parsed.error === "missing_fields" ? "Missing required fields." : "Invalid input.",
          session: { session_id: sessionId, planId: plan.id },
        });
      }

      const nowIso = new Date().toISOString();
      const ttlSeconds = Math.max(30, Math.min(Number(process.env.FINANCE_PRICE_TTL_SECONDS) || 600, 3600));
      const validUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      const results = buildMockSubscriptionOffersV2(parsed.value).slice(0, 3);
      const prices = results.map((x) => (x && typeof x.monthlyEur === "number" ? x.monthlyEur : Number(x && x.monthlyEur))).filter((n) => Number.isFinite(n));
      const bestMonthlyEur = prices.length ? Math.min.apply(null, prices) : null;
      const avgMonthlyEur = prices.length ? round2(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
      const spreadMonthlyEur = prices.length ? round2(Math.max.apply(null, prices) - Math.min.apply(null, prices)) : null;

      const baseMonthlyEur = parsed.value && typeof parsed.value.baseMonthlyEur === "number" ? parsed.value.baseMonthlyEur : null;
      const isCheaperThanBase = Number.isFinite(baseMonthlyEur) && baseMonthlyEur > 0 && Number.isFinite(bestMonthlyEur)
        ? bestMonthlyEur < baseMonthlyEur
        : null;
      const savingsBestEur = isCheaperThanBase === true ? round2(baseMonthlyEur - bestMonthlyEur) : null;

      const prevBest = parsed.value && typeof parsed.value.previousBestMonthlyEur === "number" ? parsed.value.previousBestMonthlyEur : null;
      const priceDeltaEur = Number.isFinite(prevBest) && Number.isFinite(bestMonthlyEur) ? round2(bestMonthlyEur - prevBest) : null;

      const comparableKey = [
        parsed.value.market || "",
        parsed.value.currency || "EUR",
        parsed.value.category,
      ]
        .join("|")
        .toLowerCase();

      const offersTop3 = results.map((o) => ({
        seller: o.provider,
        title: `${parsed.value.category}:${o.product}`,
        price: { amount: o.monthlyEur, currency: "EUR", period: "monthly" },
        url: null,
        meta: {
          offerId: o.offerId,
          currentProvider: parsed.value.currentProvider,
          priceObservedAt: o.priceObservedAt || nowIso,
          comparableKey,
        },
      }));

      return res.json({
        ok: true,
        module: "finance_subscriptions",
        vertical: "finance_subscriptions",
        session: { session_id: sessionId, planId: plan.id },
        input: {
          category: parsed.value.category,
          currentProvider: parsed.value.currentProvider,
          market: parsed.value.market,
          currency: parsed.value.currency,
          baseMonthlyEur: parsed.value.baseMonthlyEur,
          previousBestMonthlyEur: parsed.value.previousBestMonthlyEur,
        },
        results,
        offersTop3,
        comparableKey,
        freshness: {
          generatedAt: nowIso,
          ttlSeconds,
          validUntil,
          pricesMayChange: true,
        },
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
        recommendations: (() => {
          const rec = [];
          if (!Number.isFinite(baseMonthlyEur) || baseMonthlyEur <= 0) {
            rec.push({
              id: "provide_base_monthly",
              title: "Provide your current monthly fee",
              message: "To estimate savings, include baseMonthlyEur from your current subscription.",
            });
            return rec;
          }
          if (isCheaperThanBase === false) {
            rec.push({
              id: "no_cheaper_found",
              title: "No cheaper offer found",
              message: "Based on current inputs, we did not find a lower monthly fee than your base. Consider adjusting category or checking yearly billing discounts.",
            });
            rec.push({
              id: "try_yearly_discount",
              title: "Try yearly billing",
              message: "Some providers offer a discount when billed yearly. Compare monthly vs yearly to maximize savings.",
            });
          }
          return rec;
        })(),
        ranking: "euro_first",
      });
    }
  );
}

module.exports = {
  registerSubscriptions,
};
