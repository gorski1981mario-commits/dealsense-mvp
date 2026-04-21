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
    locale: "pl-PL",
    market: "NL",
    currency: "EUR",
    origin: "AMS",
    destination: "Barcelona",
    departAt: isoNowPlusDays(14),
    returnAt: isoNowPlusDays(21),
    adults: 2,
    children: 0,
    childrenAges: [],
    rooms: 1,
    directOnly: true,
    cabinClass: "economy",
    luggage: "1x cabin",
    budgetEur: 1200,
    preferences: "city break",
    maxAgeSeconds: 10,
    forceRefresh: true,
  };

  // Mode A: manual configuration (no basePriceEur)
  const manualReq = { ...base };
  const manual = await post("/api/v2/travel/quote", manualReq);
  assert.strictEqual(manual.status, 200);
  assert.ok(manual.body && manual.body.ok === true);
  assert.strictEqual(manual.body.module, "travel");
  assert.ok(manual.body.freshness && manual.body.freshness.pricesMayChange === true);

  // Mode B: base price from e.g. TUI final
  const basePriceReq = { ...base, basePriceEur: 1499.99 };
  const withBase = await post("/api/v2/travel/quote", basePriceReq);
  assert.strictEqual(withBase.status, 200);
  assert.ok(withBase.body && withBase.body.ok === true);
  assert.strictEqual(withBase.body.module, "travel");
  assert.ok(withBase.body.stats && Object.prototype.hasOwnProperty.call(withBase.body.stats, "basePriceEur"));
  assert.ok(Object.prototype.hasOwnProperty.call(withBase.body.stats, "savingsBestEur"));

  const out = {
    ok: true,
    tests_total: 2,
    results: [
      {
        name: "travel v2 manual",
        mode: "manual",
        status: manual.status,
        request: manualReq,
        response: pickImportant(manual.body),
      },
      {
        name: "travel v2 basePriceEur (TUI final)",
        mode: "base_price",
        status: withBase.status,
        request: basePriceReq,
        response: pickImportant(withBase.body),
      },
    ],
  };

  console.log(JSON.stringify(out, null, 2));
}

run().catch((e) => {
  console.error("Module2 travel maxpayload test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
