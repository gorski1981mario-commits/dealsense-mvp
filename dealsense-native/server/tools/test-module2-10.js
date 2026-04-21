"use strict";

const assert = require("assert");
const express = require("express");

const { registerPackage2 } = require("../packages/package_2/index");

function noRateLimit() {
  return (req, res, next) => next();
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

  return { app, state, post };
}

function isoNowPlusDays(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function assertInsuranceQuotesInvariant(r, baseMonthlyEur) {
  assert.strictEqual(r.status, 200);
  assert.ok(r.body && r.body.ok === true);
  assert.strictEqual(r.body.module, "insurance");
  assert.ok(Array.isArray(r.body.quotes));
  for (const q of r.body.quotes) {
    assert.ok(q && typeof q === "object");
    assert.ok(q.price && typeof q.price.amount === "number");
    assert.ok(q.basePrice && typeof q.basePrice.amount === "number");
    assert.ok(q.savings && typeof q.savings.amount === "number");
    assert.ok(q.price.amount < baseMonthlyEur);
    assert.ok(q.comparableKey && typeof q.comparableKey === "string");
    assert.ok(q.startDate && q.endDate);
    assert.ok(q.overallScore != null);
  }
}

async function run() {
  const { state, post } = createTestApp();

  const tests = [];

  // 1) insurance missing base
  tests.push(async () => {
    const r = await post("/api/insurance/quote", { type: "travel", startDate: isoNowPlusDays(0), endDate: isoNowPlusDays(7) });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body && r.body.error, "base_monthly_required");
    return { name: "insurance: missing base", ok: true };
  });

  // 2) insurance missing dates
  tests.push(async () => {
    const r = await post("/api/insurance/quote", { type: "travel", baseMonthlyEur: 30 });
    assert.strictEqual(r.status, 400);
    assert.ok(["start_date_required", "end_date_required"].includes(r.body && r.body.error));
    return { name: "insurance: missing dates", ok: true, error: r.body.error };
  });

  // 3) insurance endDate <= startDate
  tests.push(async () => {
    const d = isoNowPlusDays(7);
    const r = await post("/api/insurance/quote", { type: "travel", baseMonthlyEur: 30, startDate: d, endDate: d });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body && r.body.error, "end_date_must_be_after_start_date");
    return { name: "insurance: invalid window", ok: true };
  });

  // 4) insurance valid
  tests.push(async () => {
    const base = 30;
    const r = await post("/api/insurance/quote", {
      type: "travel",
      baseMonthlyEur: base,
      startDate: isoNowPlusDays(0),
      endDate: isoNowPlusDays(7),
      travelers: 2,
      tripDestination: "Spanje",
    });
    assertInsuranceQuotesInvariant(r, base);
    return { name: "insurance: valid", ok: true, quotes: r.body.quotes.length };
  });

  // 5) vacations gated (capability off)
  tests.push(async () => {
    state.plan = { id: "package_2", capabilities: { travel: true, insurance: true, vacations: false } };
    const r = await post("/api/vacations/search", { destination: "Mallorca" });
    assert.strictEqual(r.status, 402);
    assert.strictEqual(r.body && r.body.requiredCapability, "vacations");
    return { name: "vacations: gated when vacations=false", ok: true };
  });

  // 6) vacations missing destination/query
  tests.push(async () => {
    state.plan = { id: "package_2", capabilities: { travel: true, insurance: true, vacations: true } };
    const r = await post("/api/vacations/search", { destination: "Mallorca", travelers: 2 });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body && r.body.error, "depart_at_required");
    return { name: "vacations: missing destination/query", ok: true };
  });

  // 7) vacations valid
  tests.push(async () => {
    const r = await post("/api/vacations/search", {
      destination: "Mallorca",
      travelers: 2,
      nights: 7,
      budgetEur: 1500,
      departAt: isoNowPlusDays(0),
      returnAt: isoNowPlusDays(7),
      stars: 4,
      roomType: "double",
      board: "all_inclusive",
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body && r.body.ok === true);
    assert.strictEqual(r.body.module, "vacations");
    assert.ok(Array.isArray(r.body.offers) && r.body.offers.length > 0);
    return { name: "vacations: valid", ok: true, offers: r.body.offers.length };
  });

  // 8) travel gated (capability off)
  tests.push(async () => {
    state.plan = { id: "package_2", capabilities: { travel: false, insurance: true, vacations: true } };
    const r = await post("/api/travel/quote", { destination: "Barcelona" });
    assert.strictEqual(r.status, 402);
    assert.strictEqual(r.body && r.body.requiredCapability, "travel");
    return { name: "travel: gated when travel=false", ok: true };
  });

  // 9) travel invalid
  tests.push(async () => {
    state.plan = { id: "package_2", capabilities: { travel: true, insurance: true, vacations: true } };
    const r = await post("/api/travel/quote", { travelers: 2 });
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body && r.body.error, "destination_or_query_required");
    return { name: "travel: missing destination/query", ok: true };
  });

  // 10) travel valid
  tests.push(async () => {
    const r = await post("/api/travel/quote", { destination: "Barcelona", travelers: 2, budgetEur: 1200 });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body && r.body.ok === true);
    assert.strictEqual(r.body.module, "travel");
    assert.ok(Array.isArray(r.body.quotes) && r.body.quotes.length > 0);
    return { name: "travel: valid", ok: true, quotes: r.body.quotes.length };
  });

  const results = [];
  for (const t of tests) {
    const out = await t();
    results.push(out);
  }

  // High-level insights
  const insights = {
    insurance_requires_base_and_dates: true,
    insurance_enforces_price_down: true,
    vacations_has_own_capability: true,
    travel_gated_by_travel: true,
  };

  console.log(JSON.stringify({ ok: true, results, insights }, null, 2));
}

run().catch((e) => {
  console.error("Module2 test runner failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
