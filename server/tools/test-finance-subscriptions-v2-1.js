"use strict";

const assert = require("assert");
const express = require("express");

const { registerPackage3 } = require("../packages/package_3");

function noRateLimit() {
  return (req, res, next) => next();
}

function createTestApp() {
  const app = express();
  app.use(express.json());

  const state = {
    plan: {
      id: "package_3",
      capabilities: { finance: true },
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

  registerPackage3(app, deps);

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
    resultsCount: Array.isArray(body.results) ? body.results.length : null,
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
    category: "mobile",
    currentProvider: "KPN",
    market: "NL",
    currency: "EUR",
  };

  // Test A: manual (no baseMonthlyEur)
  const aReq = { ...base };
  const a = await post("/api/v2/finance/subscriptions/compare", aReq);
  assert.strictEqual(a.status, 200);
  assert.ok(a.body && a.body.ok === true);

  // Test B: base + delta
  const bReq = { ...base, baseMonthlyEur: 45, previousBestMonthlyEur: 37 };
  const b = await post("/api/v2/finance/subscriptions/compare", bReq);
  assert.strictEqual(b.status, 200);
  assert.ok(b.body && b.body.ok === true);

  // Test C: no cheaper found (base too low)
  const cReq = { ...base, baseMonthlyEur: 12, previousBestMonthlyEur: 12 };
  const c = await post("/api/v2/finance/subscriptions/compare", cReq);
  assert.strictEqual(c.status, 200);
  assert.ok(c.body && c.body.ok === true);

  assert.ok(Array.isArray(a.body.recommendations));
  assert.ok(a.body.recommendations.length >= 1);
  assert.ok(Array.isArray(b.body.recommendations));
  assert.ok(Array.isArray(c.body.recommendations));
  assert.ok(c.body.recommendations.some((r) => r && r.id === "no_cheaper_found"));
  assert.ok(c.body.recommendations.some((r) => r && r.id === "try_yearly_discount"));

  // Test D: bank_account category
  const dReq = {
    session_id: "test_session",
    fingerprint: "fp_test",
    category: "bank_account",
    currentProvider: "ING",
    market: "NL",
    currency: "EUR",
    baseMonthlyEur: 4,
    previousBestMonthlyEur: 3,
  };
  const d = await post("/api/v2/finance/subscriptions/compare", dReq);
  assert.strictEqual(d.status, 200);
  assert.ok(d.body && d.body.ok === true);

  console.log(
    JSON.stringify(
      {
        ok: true,
        tests_total: 4,
        results: [
          { name: "finance subscriptions v2 manual", mode: "manual", status: a.status, request: aReq, response: pickImportant(a.body) },
          { name: "finance subscriptions v2 base+delta", mode: "base_delta", status: b.status, request: bReq, response: pickImportant(b.body) },
          { name: "finance subscriptions v2 no_cheaper", mode: "no_cheaper", status: c.status, request: cReq, response: pickImportant(c.body) },
          { name: "finance subscriptions v2 bank_account", mode: "bank_account", status: d.status, request: dReq, response: pickImportant(d.body) },
        ],
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error("Finance subscriptions V2 test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
