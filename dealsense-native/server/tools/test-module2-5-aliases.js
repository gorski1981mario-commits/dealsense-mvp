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

  return { state, post };
}

async function run() {
  const { post } = createTestApp();

  const out = [];

  // 1) insurance OK using snake_case aliases
  {
    const r = await post("/api/insurance/quote", {
      type: "travel",
      base_monthly_eur: 30,
      start_date: isoNowPlusDays(0),
      end_date: isoNowPlusDays(7),
      trip_destination: "Spanje",
      travelers_count: 2,
      billing_period: "monthly",
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body && r.body.ok === true);
    assert.strictEqual(r.body.module, "insurance");
    assert.ok(Array.isArray(r.body.quotes) && r.body.quotes.length > 0);
    out.push({ name: "insurance alias snake_case ok", status: r.status, ok: true, quotes: r.body.quotes.length });
  }

  // 2) insurance OK using vacations-style date aliases (departAt/returnAt)
  {
    const r = await post("/api/insurance/quote", {
      type: "travel",
      baseMonthly: 30,
      departAt: isoNowPlusDays(0),
      returnAt: isoNowPlusDays(7),
      destination: "Portugal",
      travelers: 2,
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body && r.body.ok === true);
    out.push({ name: "insurance alias depart/return ok", status: r.status, ok: true, quotes: r.body.quotes.length });
  }

  // 3) vacations OK using alias fields
  {
    const r = await post("/api/vacations/search", {
      q: "Mallorca",
      travelers_count: 2,
      nights_count: 7,
      budget_eur: 1500,
      start_date: isoNowPlusDays(0),
      end_date: isoNowPlusDays(7),
      hotel_stars: 4,
      room_type: "dbl",
      meal_plan: "ai",
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body && r.body.ok === true);
    assert.strictEqual(r.body.module, "vacations");
    assert.ok(Array.isArray(r.body.offers) && r.body.offers.length > 0);
    out.push({ name: "vacations alias ok", status: r.status, ok: true, offers: r.body.offers.length });
  }

  // 4) travel OK using alias fields
  {
    const r = await post("/api/travel/quote", {
      q: "Barcelona",
      travellers: 2,
      budget_eur: 1200,
      from: "AMS",
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body && r.body.ok === true);
    assert.strictEqual(r.body.module, "travel");
    assert.ok(Array.isArray(r.body.quotes) && r.body.quotes.length > 0);
    out.push({ name: "travel alias ok", status: r.status, ok: true, quotes: r.body.quotes.length });
  }

  // 5) negative: vacations missing required board/room/stars should still be 400
  {
    const r = await post("/api/vacations/search", {
      destination: "Mallorca",
      depart_at: isoNowPlusDays(0),
      return_at: isoNowPlusDays(7),
    });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body && r.body.ok === false);
    out.push({ name: "vacations negative still 400", status: r.status, ok: true, error: r.body.error });
  }

  console.log(JSON.stringify({ ok: true, tests_total: out.length, results: out }, null, 2));
}

run().catch((e) => {
  console.error("Module2 aliases test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
