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

  const req = {
    session_id: "test_session",
    fingerprint: "fp_test",
    market: "NL",
    currency: "EUR",
    baseMonthlyFeeEur: 6,
    previousBestMonthlyFeeEur: 5,
  };

  const r = await post("/api/v2/finance/credit-cards/compare", req);
  assert.strictEqual(r.status, 200);
  assert.ok(r.body && r.body.ok === true);
  assert.ok(Array.isArray(r.body.offersTop3) && r.body.offersTop3.length > 0);

  console.log(
    JSON.stringify(
      {
        ok: true,
        tests_total: 1,
        results: [{ name: "finance credit cards v2 base+delta", status: r.status, request: req, response: pickImportant(r.body) }],
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error("Finance credit cards V2 test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
