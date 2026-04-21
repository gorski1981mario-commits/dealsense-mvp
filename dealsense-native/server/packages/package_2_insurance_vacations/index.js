"use strict";

const { registerInsurance: registerInsuranceV1, computeInsuranceMatchScore: computeInsuranceMatchScoreV1 } = require("../package_2/insurance");
const { registerVacations: registerVacationsV1, computeVacationsMatchScore: computeVacationsMatchScoreV1 } = require("../package_2/vacations");

const { registerInsurance: registerInsuranceV2, computeInsuranceMatchScore: computeInsuranceMatchScoreV2 } = require("../package_2_next/insurance");
const { registerVacations: registerVacationsV2, computeVacationsMatchScore: computeVacationsMatchScoreV2 } = require("../package_2_next/vacations");

function registerModule2ConfigV1(app, deps) {
  const { getClientIP, getSession, getEffectivePlanFromSession } = deps;

  app.get("/api/module2/endpoints", async (req, res) => {
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
      module: "module2",
      session: { session_id: sessionId, planId: plan && plan.id },
      capabilities: (plan && plan.capabilities) || {},
      endpoints: [
        {
          id: "travel_quote",
          method: "POST",
          path: "/api/travel/quote",
          capability: "travel",
          requiredAnyOf: ["destination", "query"],
          optional: [
            "origin",
            "tripType",
            "travelers",
            "adults",
            "children",
            "childrenAges",
            "rooms",
            "budgetEur",
            "month",
            "preferences",
            "nights",
            "departAt",
            "returnAt",
            "directOnly",
            "cabinClass",
            "luggage",
            "basePriceEur",
            "previousBestPriceEur",
            "locale",
            "market",
            "currency",
          ],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Barcelona",
            origin: "AMS",
            adults: 2,
            budgetEur: 1200,
            departAt: depart.toISOString(),
            returnAt: ret.toISOString(),
            directOnly: true,
            cabinClass: "economy",
            basePriceEur: 1499.99,
          },
        },
        {
          id: "vacations_search",
          method: "POST",
          path: "/api/vacations/search",
          capability: "vacations",
          requiredAll: ["departAt", "returnAt", "stars", "roomType", "board"],
          requiredAnyOf: ["destination", "query"],
          optional: [
            "origin",
            "travelers",
            "adults",
            "children",
            "childrenAges",
            "rooms",
            "nights",
            "budgetEur",
            "preferences",
            "hotelName",
            "flightIncluded",
            "directOnly",
            "cabinClass",
            "luggage",
            "basePriceEur",
            "previousBestPriceEur",
            "locale",
            "market",
            "currency",
          ],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Mallorca",
            origin: "AMS",
            adults: 2,
            children: 2,
            childrenAges: [3, 7],
            rooms: 1,
            nights: 7,
            budgetEur: 1500,
            departAt: depart.toISOString(),
            returnAt: ret.toISOString(),
            stars: 4,
            roomType: "double",
            board: "all_inclusive",
            flightIncluded: true,
            basePriceEur: 2499.95,
          },
        },
        {
          id: "insurance_quote",
          method: "POST",
          path: "/api/insurance/quote",
          capability: "insurance",
          requiredAll: ["baseMonthlyEur", "startDate", "endDate"],
          requiredAnyOf: ["type", "query"],
          optional: ["tripDestination", "tripType", "travelers", "durationDays", "budgetEur", "coverage", "excessEur", "currency", "billingPeriod", "coverageArea", "cancellation", "sports", "previousBestPriceEur"],
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
            coverageArea: "EU",
            previousBestPriceEur: 24.99,
          },
        },
      ],
    });
  });
}

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
          optional: [
            "origin",
            "tripType",
            "travelers",
            "adults",
            "children",
            "childrenAges",
            "rooms",
            "budgetEur",
            "month",
            "preferences",
            "nights",
            "departAt",
            "returnAt",
            "directOnly",
            "cabinClass",
            "luggage",
            "basePriceEur",
            "previousBestPriceEur",
            "locale",
            "market",
            "currency",
            "maxAgeSeconds",
            "forceRefresh",
          ],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Barcelona",
            origin: "AMS",
            adults: 2,
            budgetEur: 1200,
            departAt: depart.toISOString(),
            returnAt: ret.toISOString(),
            directOnly: true,
            cabinClass: "economy",
            basePriceEur: 1499.99,
            previousBestPriceEur: 960,
            maxAgeSeconds: 10,
            forceRefresh: true,
          },
        },
        {
          id: "vacations_search_v2",
          method: "POST",
          path: "/api/v2/vacations/search",
          capability: "vacations",
          requiredAll: ["departAt", "returnAt", "stars", "roomType", "board"],
          requiredAnyOf: ["destination", "query"],
          optional: [
            "origin",
            "travelers",
            "adults",
            "children",
            "childrenAges",
            "rooms",
            "nights",
            "budgetEur",
            "preferences",
            "hotelName",
            "flightIncluded",
            "directOnly",
            "cabinClass",
            "luggage",
            "basePriceEur",
            "previousBestPriceEur",
            "locale",
            "market",
            "currency",
            "maxAgeSeconds",
            "forceRefresh",
          ],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Mallorca",
            origin: "AMS",
            adults: 2,
            children: 2,
            childrenAges: [3, 7],
            rooms: 1,
            nights: 7,
            budgetEur: 1500,
            departAt: depart.toISOString(),
            returnAt: ret.toISOString(),
            stars: 4,
            roomType: "double",
            board: "all_inclusive",
            flightIncluded: true,
            basePriceEur: 2499.95,
            previousBestPriceEur: 1870,
            maxAgeSeconds: 10,
            forceRefresh: true,
          },
        },
        {
          id: "insurance_quote_v2",
          method: "POST",
          path: "/api/v2/insurance/quote",
          capability: "insurance",
          requiredAll: ["baseMonthlyEur", "startDate", "endDate"],
          requiredAnyOf: ["type", "query"],
          optional: ["tripDestination", "tripType", "travelers", "durationDays", "budgetEur", "coverage", "excessEur", "currency", "billingPeriod", "coverageArea", "cancellation", "sports", "previousBestPriceEur", "maxAgeSeconds", "forceRefresh"],
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
            coverageArea: "EU",
            previousBestPriceEur: 24.99,
          },
        },
      ],
    });
  });
}

function registerPackage2InsuranceVacations(app, deps) {
  registerInsuranceV1(app, deps);
  registerVacationsV1(app, deps);
  registerInsuranceV2(app, deps);
  registerVacationsV2(app, deps);
  registerModule2ConfigV1(app, deps);
  registerModule2ConfigV2(app, deps);
}

module.exports = {
  registerPackage2InsuranceVacations,
  computeInsuranceMatchScoreV1,
  computeInsuranceMatchScoreV2,
  computeVacationsMatchScoreV1,
  computeVacationsMatchScoreV2,
};
