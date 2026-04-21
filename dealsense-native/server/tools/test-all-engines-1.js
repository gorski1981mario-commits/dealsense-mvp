"use strict";

const assert = require("assert");
const express = require("express");

const { registerPackage1 } = require("../packages/package_1");
const { registerPackage2 } = require("../packages/package_2/index");
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
      capabilities: { shopping: true, travel: true, vacations: true, insurance: true, finance: true },
      maxBasePrice: null,
    },
  };

  const depsCommon = {
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

  registerPackage2(app, depsCommon);
  registerPackage3(app, depsCommon);

  registerPackage1(app, {
    ...depsCommon,
    isLocked: () => false,
    suggestUpgradePlanId: () => "package_1",
    getEffectivePlanId: () => state.plan.id,
    parseEchoTop3Input: () => ({ ok: true, value: { base_price: 100, debug: true } }),
    getTop3EchoOffers: async () => ({ ok: true, decision: "buy_now", offers: [{ seller: "mock", price: 90, url: null }] }),
  });

  async function handle({ method, url, body }) {
    return new Promise((resolve) => {
      const req = {
        method,
        url,
        body: body || {},
        query: {},
        headers: { "content-type": "application/json" },
      };

      const res = {
        _status: 200,
        _headers: {},
        status(code) {
          this._status = code;
          return this;
        },
        setHeader(k, v) {
          this._headers[String(k || "").toLowerCase()] = v;
        },
        json(payload) {
          resolve({ status: this._status, body: payload });
        },
        end() {
          resolve({ status: this._status, body: null });
        },
      };

      app.handle(req, res);
    });
  }

  return { handle };
}

async function run() {
  const { handle } = createTestApp();

  const r1 = await handle({ method: "POST", url: "/api/echo/top3", body: { fingerprint: "fp_test", base_price: 100 } });
  assert.strictEqual(r1.status, 200);
  assert.ok(r1.body && r1.body.ok === true);

  const r2 = await handle({ method: "GET", url: "/api/module2/endpoints" });
  assert.strictEqual(r2.status, 200);
  assert.ok(r2.body && r2.body.ok === true);
  assert.ok(Array.isArray(r2.body.endpoints) && r2.body.endpoints.length > 0);

  const r3 = await handle({ method: "GET", url: "/api/v2/finance/endpoints" });
  assert.strictEqual(r3.status, 200);
  assert.ok(r3.body && r3.body.ok === true);
  assert.ok(Array.isArray(r3.body.endpoints) && r3.body.endpoints.length > 0);

  console.log(
    JSON.stringify(
      {
        ok: true,
        tests_total: 3,
        results: [
          { name: "engine1 echo top3 route", status: r1.status, ok: true },
          { name: "engine2 module2 endpoints route", status: r2.status, ok: true, endpointsCount: r2.body.endpoints.length },
          { name: "engine3 finance endpoints route", status: r3.status, ok: true, endpointsCount: r3.body.endpoints.length },
        ],
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error("All-engines test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
