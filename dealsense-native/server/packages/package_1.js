"use strict";

function registerPackage1(app, deps) {
  const {
    rateLimit,
    getClientIP,
    getSession,
    isLocked,
    getEffectivePlanFromSession,
    requireCapabilityOr402,
    suggestUpgradePlanId,
    parseEchoTop3Input,
    getTop3EchoOffers,
    getEffectivePlanId,
  } = deps;

  app.post(
    "/api/echo/top3",
    rateLimit({ windowMs: 60_000, max: Number(process.env.ECHO_RATE_LIMIT_PER_MIN) || 30 }),
    async (req, res) => {
      const parsed = parseEchoTop3Input(req.body);
      if (!parsed.ok) {
        return res.status(400).json(parsed);
      }

      const clientIP = getClientIP(req);
      const fingerprint = typeof req.body.fingerprint === "string" ? req.body.fingerprint.trim() : null;
      const session_id = typeof req.body.session_id === "string" ? req.body.session_id.trim() : null;
      const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
      const plan = getEffectivePlanFromSession(sessionData);
      const effectivePlanId = getEffectivePlanId(sessionData);
      if (!requireCapabilityOr402({ plan, capability: "shopping", res })) return;

      const basePriceNum = typeof parsed.value.base_price === "number" ? parsed.value.base_price : Number(parsed.value.base_price);
      const maxBase = plan && plan.maxBasePrice != null ? Number(plan.maxBasePrice) : null;
      if (Number.isFinite(basePriceNum) && Number.isFinite(maxBase) && basePriceNum > maxBase) {
        return res.status(402).json({
          ok: false,
          locked: true,
          error: "upgrade_required",
          maxBasePrice: maxBase,
          planId: plan.id,
          suggestedPlanId: suggestUpgradePlanId("shopping", plan.id),
          codeRedeemPath: "/billing/redeem-code",
        });
      }

      try {
        const result = await getTop3EchoOffers(parsed.value);
        const cacheMeta = result && typeof result === "object" ? result.__cache : null;
        if (result && typeof result === "object") delete result.__cache;
        if (isLocked(sessionData)) {
          result.offers = Array.isArray(result.offers)
            ? result.offers.map((o) => {
                const x = { ...o };
                delete x.seller;
                delete x.url;
                return x;
              })
            : result.offers;
        }
        if (parsed.value.debug) {
          return res.json({
            ...result,
            __cache: cacheMeta,
            input: parsed.value,
            session: { session_id: sessionId, planId: effectivePlanId, locked: isLocked(sessionData) },
          });
        }
        return res.json(result);
      } catch (err) {
        return res.status(502).json({ ok: false, error: (err && err.message) || "echo_engine_failed" });
      }
    }
  );
}

module.exports = {
  registerPackage1,
};
