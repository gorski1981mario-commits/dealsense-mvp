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
    amountEur: 250000,
    termMonths: 360,
    interestType: "fixed",
    market: "NL",
    currency: "EUR",
  };

  // Test A: manual (no baseMonthlyPaymentEur)
  const aReq = { ...base };
  const a = await post("/api/v2/finance/loans/quote", aReq);
  assert.strictEqual(a.status, 200);
  assert.ok(a.body && a.body.ok === true);

  // Test B: base + delta
  const bReq = { ...base, baseMonthlyPaymentEur: 1550, previousBestMonthlyPaymentEur: 1490 };
  const b = await post("/api/v2/finance/loans/quote", bReq);
  assert.strictEqual(b.status, 200);
  assert.ok(b.body && b.body.ok === true);

  console.log(
    JSON.stringify(
      {
        ok: true,
        tests_total: 2,
        results: [
          { name: "finance loans v2 manual", mode: "manual", status: a.status, request: aReq, response: pickImportant(a.body) },
          { name: "finance loans v2 base+delta", mode: "base_delta", status: b.status, request: bReq, response: pickImportant(b.body) },
        ],
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error("Finance loans V2 test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
