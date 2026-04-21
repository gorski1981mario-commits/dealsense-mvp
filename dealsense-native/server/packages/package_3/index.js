"use strict";

const { registerLoans } = require("./loans");
const { registerSubscriptions } = require("./subscriptions");
const { registerMortgage } = require("./mortgage");
const { registerLeasing } = require("./leasing");
const { registerCreditCards } = require("./credit-cards");

function registerFinanceConfigV2(app, deps) {
  const { getClientIP, getSession, getEffectivePlanFromSession } = deps;

  app.get("/api/v2/finance/endpoints", async (req, res) => {
    const clientIP = typeof getClientIP === "function" ? getClientIP(req) : null;
    const fingerprint = typeof req.query.fingerprint === "string" ? req.query.fingerprint.trim() : null;
    const session_id = typeof req.query.session_id === "string" ? req.query.session_id.trim() : null;
    const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);
    const plan = getEffectivePlanFromSession(sessionData);

    res.json({
      ok: true,
      module: "finance_v2",
      session: { session_id: sessionId, planId: plan && plan.id },
      capabilities: (plan && plan.capabilities) || {},
      endpoints: [
        {
          id: "finance_credit_cards_compare_v2",
          method: "POST",
          path: "/api/v2/finance/credit-cards/compare",
          capability: "finance",
          requiredAll: ["baseMonthlyFeeEur"],
          optional: ["market", "currency", "previousBestMonthlyFeeEur"],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            market: "NL",
            currency: "EUR",
            baseMonthlyFeeEur: 6,
            previousBestMonthlyFeeEur: 5,
          },
        },
        {
          id: "finance_leasing_quote_v2",
          method: "POST",
          path: "/api/v2/finance/leasing/quote",
          capability: "finance",
          requiredAll: ["vehiclePriceEur", "termMonths"],
          optional: [
            "downPaymentEur",
            "mileageKmPerYear",
            "residualPct",
            "rateType",
            "market",
            "currency",
            "baseMonthlyPaymentEur",
            "previousBestMonthlyPaymentEur",
          ],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            vehiclePriceEur: 32000,
            termMonths: 48,
            downPaymentEur: 2000,
            mileageKmPerYear: 15000,
            residualPct: 55,
            rateType: "fixed",
            market: "NL",
            currency: "EUR",
            baseMonthlyPaymentEur: 499,
            previousBestMonthlyPaymentEur: 479,
          },
        },
        {
          id: "finance_mortgage_quote_v2",
          method: "POST",
          path: "/api/v2/finance/mortgage/quote",
          capability: "finance",
          requiredAll: ["principalEur", "termMonths"],
          optional: [
            "rateType",
            "market",
            "currency",
            "propertyValueEur",
            "ltvPct",
            "baseMonthlyPaymentEur",
            "previousBestMonthlyPaymentEur",
          ],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            principalEur: 350000,
            termMonths: 360,
            rateType: "fixed",
            market: "NL",
            currency: "EUR",
            propertyValueEur: 500000,
            ltvPct: 70,
            baseMonthlyPaymentEur: 1650,
            previousBestMonthlyPaymentEur: 1590,
          },
        },
        {
          id: "finance_loans_quote_v2",
          method: "POST",
          path: "/api/v2/finance/loans/quote",
          capability: "finance",
          requiredAll: ["amountEur", "termMonths"],
          optional: [
            "purpose",
            "interestType",
            "market",
            "currency",
            "baseMonthlyPaymentEur",
            "previousBestMonthlyPaymentEur",
          ],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            amountEur: 250000,
            termMonths: 360,
            interestType: "fixed",
            market: "NL",
            currency: "EUR",
            baseMonthlyPaymentEur: 1550,
            previousBestMonthlyPaymentEur: 1490,
          },
        },
        {
          id: "finance_subscriptions_compare_v2",
          method: "POST",
          path: "/api/v2/finance/subscriptions/compare",
          capability: "finance",
          requiredAll: ["category"],
          optional: [
            "currentProvider",
            "market",
            "currency",
            "baseMonthlyEur",
            "previousBestMonthlyEur",
          ],
          responseNotes: ["returns offersTop3 + stats + comparableKey + freshness"],
          requestExample: {
            session_id: sessionId,
            fingerprint: fingerprint || null,
            category: "mobile",
            currentProvider: "KPN",
            market: "NL",
            currency: "EUR",
            baseMonthlyEur: 45,
            previousBestMonthlyEur: 37,
          },
        },
      ],
    });
  });
}

function registerPackage3(app, deps) {
  registerCreditCards(app, deps);
  registerLeasing(app, deps);
  registerMortgage(app, deps);
  registerLoans(app, deps);
  registerSubscriptions(app, deps);
  registerFinanceConfigV2(app, deps);
}

module.exports = {
  registerPackage3,
};
