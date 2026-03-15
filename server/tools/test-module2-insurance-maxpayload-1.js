"use strict";

const assert = require("assert");
const express = require("express");

const { registerPackage2Travel } = require("../packages/package_2_travel");
const { registerPackage2InsuranceVacations } = require("../packages/package_2_insurance_vacations");

function noRateLimit() {
  return (req, res, next) => next();
}

function isoNowPlusDays(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function createTestApp() {
  const app = express();
  app.use(express.json());

  const state = {
    plan: {
      id: "package_2",
      capabilities: { travel: true, insurance: true, vacations: true },
    },
  };

  const deps = {
    rateLimit: noRateLimit,
    getClientIP: () => "127.0.0.1",
    getSession: async () => ({ sessionId: "test_session", data: { usageCount: 0, unlocked: true, planId: state.plan.id } }),
    getEffectivePlanFromSession: () => state.plan,
    requireCapabilityOr402: ({ plan, capability, res }) => {
      const caps = (plan && plan.capabilities) || {};
      if (caps[capability] === true) return true;
      res.status(402).json({ ok: false, locked: true, error: "upgrade_required", requiredCapability: capability, planId: plan && plan.id });
      return false;
    },
  };

  registerPackage2Travel(app, deps);
  registerPackage2InsuranceVacations(app, deps);

  async function post(path, body) {
    return new Promise((resolve) => {
      const req = {
        method: "POST",
        url: path,
        body: body || {},
        headers: { "content-type": "application/json" },
      };

      const res = {
        _status: 200,
        status(code) {
          this._status = code;
          return this;
        },
        json(payload) {
          resolve({ status: this._status, body: payload });
        },
        setHeader() {},
        end() {
          resolve({ status: this._status, body: null });
        },
      };

      app.handle(req, res);
    });
  }

  return { post };
}

function pickImportant(body) {
  if (!body || typeof body !== "object") return body;
  return {
    ok: body.ok,
    module: body.module,
    vertical: body.vertical,
    input: body.input,
    quotesCount: Array.isArray(body.quotes) ? body.quotes.length : null,
    offersTop3Count: Array.isArray(body.offersTop3) ? body.offersTop3.length : null,
    comparableKey: body.comparableKey,
    stats: body.stats,
    freshness: body.freshness,
    ranking: body.ranking,
  };
}

async function run() {
  const { post } = createTestApp();

  const base = {
    session_id: "test_session",
    fingerprint: "fp_test",
    type: "travel",
    baseMonthlyEur: 30,
    billingPeriod: "monthly",
    startDate: isoNowPlusDays(0),
    endDate: isoNowPlusDays(7),
    travelers: 2,
    tripDestination: "Spanje",
    currency: "EUR",
  };

  // Mode A: manual (no previousBestPriceEur)
  const manualReq = { ...base };
  const manual = await post("/api/v2/insurance/quote", manualReq);
  assert.strictEqual(manual.status, 200);
  assert.ok(manual.body && manual.body.ok === true);
  assert.strictEqual(manual.body.module, "insurance");
  assert.ok(manual.body.freshness && manual.body.freshness.pricesMayChange === true);

  // Mode B: delta against previous best
  const prev = 24.99;
  const deltaReq = { ...base, previousBestPriceEur: prev };
  const withPrev = await post("/api/v2/insurance/quote", deltaReq);
  assert.strictEqual(withPrev.status, 200);
  assert.ok(withPrev.body && withPrev.body.ok === true);
  assert.strictEqual(withPrev.body.module, "insurance");
  assert.ok(withPrev.body.stats && Object.prototype.hasOwnProperty.call(withPrev.body.stats, "priceDeltaEur"));

  console.log(
    JSON.stringify(
      {
        ok: true,
        tests_total: 2,
        results: [
          { name: "insurance v2 manual", mode: "manual", status: manual.status, request: manualReq, response: pickImportant(manual.body) },
          { name: "insurance v2 previousBestPriceEur", mode: "delta", status: withPrev.status, request: deltaReq, response: pickImportant(withPrev.body) },
        ],
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error("Module2 insurance maxpayload test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
