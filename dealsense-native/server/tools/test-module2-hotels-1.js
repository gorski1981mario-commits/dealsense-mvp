"use strict";

const assert = require("assert");
const express = require("express");

const { registerPackage2 } = require("../packages/package_2/index");

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

  registerPackage2(app, deps);

  async function post(p, body) {
    return new Promise((resolve) => {
      const req = {
        method: "POST",
        url: p,
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
    destination: "Barcelona",
    checkIn: isoNowPlusDays(0),
    checkOut: isoNowPlusDays(7),
    guests: 2,
    rooms: 1,
    stars: 4,
    board: "room_only",
    basePriceEur: 900,
    previousBestPriceEur: 850,
    market: "NL",
    currency: "EUR",
  };

  const r = await post("/api/hotels/search", req);
  assert.strictEqual(r.status, 200);
  assert.ok(r.body && r.body.ok === true);
  assert.strictEqual(r.body.module, "hotels");
  assert.ok(Array.isArray(r.body.offersTop3) && r.body.offersTop3.length > 0);
  assert.ok(r.body.freshness && typeof r.body.freshness === "object");

  console.log(
    JSON.stringify(
      {
        ok: true,
        tests_total: 1,
        results: [{ name: "module2 hotels search", status: r.status, request: req, response: pickImportant(r.body) }],
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error("Module2 hotels test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
