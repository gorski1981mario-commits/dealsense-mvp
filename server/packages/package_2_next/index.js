"use strict";

const { registerInsurance, computeInsuranceMatchScore } = require("./insurance");
const { registerTravel, computeTravelMatchScore } = require("./travel");
const { registerVacations, computeVacationsMatchScore } = require("./vacations");

function registerModule2ConfigV2(app, deps) {
  const { getClientIP, getSession, getEffectivePlanFromSession } = deps;

  app.get("/api/v2/module2/endpoints", async (req, res) => {
    const clientIP = typeof getClientIP === "function" ? getClientIP(req) : null;
    const fingerprint = typeof req.query.fingerprint === "string" ? req.query.fingerprint.trim() : null;
    const session_id = typeof req.query.session_id === "string" ? req.query.session_id.trim() : null;
    const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
    const plan = getEffectivePlanFromSession(sessionData);

    const now = new Date();
    const start = new Date(now.getTime());
    const end = new Date(now.getTime());
    end.setUTCDate(end.getUTCDate() + 7);
    const depart = new Date(now.getTime());
    const ret = new Date(now.getTime());
    ret.setUTCDate(ret.getUTCDate() + 7);

    res.json({
      ok: true,
      module: "module2_v2",
      session: { session_id: sessionId, planId: plan && plan.id },
      capabilities: (plan && plan.capabilities) || {},
      endpoints: [
        {
          id: "travel_quote_v2",
          method: "POST",
          path: "/api/v2/travel/quote",
          capability: "travel",
          requiredAnyOf: ["destination", "query"],
          optional: ["origin", "tripType", "travelers", "budgetEur", "month", "preferences", "nights"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Barcelona",
            travelers: 2,
            budgetEur: 1200,
          },
        },
        {
          id: "vacations_search_v2",
          method: "POST",
          path: "/api/v2/vacations/search",
          capability: "vacations",
          requiredAll: ["departAt", "returnAt", "stars", "roomType", "board"],
          requiredAnyOf: ["destination", "query"],
          optional: ["origin", "travelers", "nights", "budgetEur", "preferences"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Mallorca",
            travelers: 2,
            nights: 7,
            budgetEur: 1500,
            departAt: depart.toISOString(),
            returnAt: ret.toISOString(),
            stars: 4,
            roomType: "double",
            board: "all_inclusive",
          },
        },
        {
          id: "insurance_quote_v2",
          method: "POST",
          path: "/api/v2/insurance/quote",
          capability: "insurance",
          requiredAll: ["baseMonthlyEur", "startDate", "endDate"],
          requiredAnyOf: ["type", "query"],
          optional: ["tripDestination", "tripType", "travelers", "durationDays", "budgetEur", "coverage", "excessEur", "currency", "billingPeriod"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            type: "travel",
            baseMonthlyEur: 30,
            billingPeriod: "monthly",
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            travelers: 2,
            tripDestination: "Spanje",
          },
        },
      ],
    });
  });
}

function registerPackage2Next(app, deps) {
  registerTravel(app, deps);
  registerVacations(app, deps);
  registerInsurance(app, deps);
  registerModule2ConfigV2(app, deps);
}

module.exports = {
  registerPackage2Next,
  computeTravelMatchScore,
  computeVacationsMatchScore,
  computeInsuranceMatchScore,
};
