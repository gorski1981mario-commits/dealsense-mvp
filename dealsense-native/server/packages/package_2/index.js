"use strict";

const { registerInsurance, computeInsuranceMatchScore } = require("./insurance");
const { registerTravel, computeTravelMatchScore } = require("./travel");
const { registerVacations, computeVacationsMatchScore } = require("./vacations");
const { registerCarRental } = require("./car-rental");
const { registerFlights } = require("./flights");
const { registerHotels } = require("./hotels");

function registerModule2Config(app, deps) {
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
          id: "car_rental_quote",
          method: "POST",
          path: "/api/car-rental/quote",
          capability: "travel",
          requiredAll: ["pickupLocation", "pickupAt", "dropoffAt"],
          optional: ["dropoffLocation", "days", "carType", "market", "currency", "basePriceEur", "previousBestPriceEur"],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            pickupLocation: "AMS",
            dropoffLocation: "AMS",
            pickupAt: start.toISOString(),
            dropoffAt: end.toISOString(),
            carType: "compact",
            basePriceEur: 260,
            previousBestPriceEur: 240,
          },
        },
        {
          id: "flights_quote",
          method: "POST",
          path: "/api/flights/quote",
          capability: "travel",
          requiredAll: ["origin", "destination", "departAt", "returnAt"],
          optional: ["travelers", "directOnly", "cabinClass", "market", "currency", "basePriceEur", "previousBestPriceEur"],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            origin: "AMS",
            destination: "BCN",
            departAt: depart.toISOString(),
            returnAt: ret.toISOString(),
            travelers: 2,
            directOnly: true,
            cabinClass: "economy",
            basePriceEur: 420,
            previousBestPriceEur: 399,
          },
        },
        {
          id: "hotels_search",
          method: "POST",
          path: "/api/hotels/search",
          capability: "travel",
          requiredAll: ["destination", "checkIn", "checkOut"],
          optional: ["guests", "rooms", "stars", "board", "market", "currency", "basePriceEur", "previousBestPriceEur"],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            destination: "Barcelona",
            checkIn: depart.toISOString(),
            checkOut: ret.toISOString(),
            guests: 2,
            rooms: 1,
            stars: 4,
            board: "room_only",
            basePriceEur: 900,
            previousBestPriceEur: 850,
          },
        },
        {
          id: "travel_quote",
          method: "POST",
          path: "/api/travel/quote",
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
          responseExample: {
            ok: true,
            module: "travel",
            session: { session_id: sessionId, planId: plan && plan.id },
            input: { destination: "Barcelona", travelers: 2, budgetEur: 1200 },
            quotes: [
              { provider: "Dealsense Travel", title: "...", estPriceEur: 999, matchScore: 0.88 },
            ],
          },
        },
        {
          id: "vacations_search",
          method: "POST",
          path: "/api/vacations/search",
          capability: "vacations",
          requiredAll: ["departAt", "returnAt", "stars", "roomType", "board"],
          requiredAnyOf: ["destination", "query"],
          optional: ["origin", "travelers", "nights", "budgetEur", "preferences"],
          invariants: ["offers comparableKey includes departAt+returnAt+stars+roomType+board"],
          enums: {
            board: ["room_only", "bed_and_breakfast", "half_board", "full_board", "all_inclusive"],
            roomTypeExamples: ["single", "double", "twin", "family", "suite"],
            starsRange: [1, 5],
          },
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
          responseExample: {
            ok: true,
            module: "vacations",
            session: { session_id: sessionId, planId: plan && plan.id },
            input: {
              destination: "Mallorca",
              travelers: 2,
              nights: 7,
              departAt: depart.toISOString(),
              returnAt: ret.toISOString(),
              stars: 4,
              roomType: "double",
              board: "all_inclusive",
            },
            offers: [
              {
                provider: "Dealsense Vacations",
                title: "...",
                hotel: { name: "...", stars: 4, board: "all_inclusive" },
                room: { type: "double" },
                estPriceEur: 1299,
                matchScore: 0.82,
                comparableKey: "...",
              },
            ],
          },
        },
        {
          id: "insurance_quote",
          method: "POST",
          path: "/api/insurance/quote",
          capability: "insurance",
          requiredAll: ["baseMonthlyEur", "startDate", "endDate"],
          requiredAnyOf: ["type", "query"],
          optional: ["tripDestination", "tripType", "travelers", "durationDays", "budgetEur", "coverage", "excessEur", "currency", "billingPeriod"],
          invariants: ["billingPeriod=monthly", "offer.price.amount < baseMonthlyEur", "comparableKey includes startDate+endDate"],
          enums: {
            billingPeriod: ["monthly"],
            currency: ["EUR"],
          },
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
          responseExample: {
            ok: true,
            module: "insurance",
            session: { session_id: sessionId, planId: plan && plan.id },
            input: {
              type: "travel",
              baseMonthlyEur: 30,
              startDate: start.toISOString(),
              endDate: end.toISOString(),
              billingPeriod: "monthly",
            },
            quotes: [
              {
                offerId: "travel:basic:150",
                type: "travel",
                price: { amount: 24.99, currency: "EUR", period: "monthly" },
                basePrice: { amount: 30, currency: "EUR", period: "monthly" },
                savings: { amount: 5.01, currency: "EUR", period: "monthly" },
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                quoteValidUntil: depart.toISOString(),
                comparableKey: "...",
                matchScore: 0.8,
                overallScore: 0.82,
                review: { score: 4.4, count: 500 },
              },
            ],
          },
        },
      ],
    });
  });
}

function registerPackage2(app, deps) {
  registerCarRental(app, deps);
  registerFlights(app, deps);
  registerHotels(app, deps);
  registerTravel(app, deps);
  registerVacations(app, deps);
  registerInsurance(app, deps);
  registerModule2Config(app, deps);
}

module.exports = {
  registerPackage2,
  computeTravelMatchScore,
  computeVacationsMatchScore,
  computeInsuranceMatchScore,
};
