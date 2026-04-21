"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
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

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
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

  return { state, post };
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

async function runTests() {
  const { state, post } = createTestApp();

  const tests = [];

  tests.push({
    name: "insurance: missing base",
    fn: async () => {
      const r = await post("/api/insurance/quote", { type: "travel", startDate: isoNowPlusDays(0), endDate: isoNowPlusDays(7) });
      assert.strictEqual(r.status, 400);
      assert.strictEqual(r.body && r.body.error, "base_monthly_required");
      return { ok: true, httpStatus: r.status, error: r.body.error };
    },
  });

  tests.push({
    name: "insurance: missing dates",
    fn: async () => {
      const r = await post("/api/insurance/quote", { type: "travel", baseMonthlyEur: 30 });
      assert.strictEqual(r.status, 400);
      assert.ok(["start_date_required", "end_date_required"].includes(r.body && r.body.error));
      return { ok: true, httpStatus: r.status, error: r.body.error };
    },
  });

  tests.push({
    name: "insurance: invalid window",
    fn: async () => {
      const d = isoNowPlusDays(7);
      const r = await post("/api/insurance/quote", { type: "travel", baseMonthlyEur: 30, startDate: d, endDate: d });
      assert.strictEqual(r.status, 400);
      assert.strictEqual(r.body && r.body.error, "end_date_must_be_after_start_date");
      return { ok: true, httpStatus: r.status, error: r.body.error };
    },
  });

  tests.push({
    name: "insurance: valid",
    fn: async () => {
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
      return { ok: true, httpStatus: r.status, quotes: r.body.quotes.length };
    },
  });

  tests.push({
    name: "vacations: gated when vacations=false",
    fn: async () => {
      state.plan = { id: "package_2", capabilities: { travel: true, insurance: true, vacations: false } };
      const r = await post("/api/vacations/search", { destination: "Mallorca" });
      assert.strictEqual(r.status, 402);
      assert.strictEqual(r.body && r.body.requiredCapability, "vacations");
      return { ok: true, httpStatus: r.status, requiredCapability: r.body.requiredCapability };
    },
  });

  tests.push({
    name: "vacations: missing destination/query",
    fn: async () => {
      state.plan = { id: "package_2", capabilities: { travel: true, insurance: true, vacations: true } };
      const r = await post("/api/vacations/search", { destination: "Mallorca", travelers: 2 });
      assert.strictEqual(r.status, 400);
      assert.strictEqual(r.body && r.body.error, "depart_at_required");
      return { ok: true, httpStatus: r.status, error: r.body.error };
    },
  });

  tests.push({
    name: "vacations: valid",
    fn: async () => {
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
      return { ok: true, httpStatus: r.status, offers: r.body.offers.length };
    },
  });

  tests.push({
    name: "travel: gated when travel=false",
    fn: async () => {
      state.plan = { id: "package_2", capabilities: { travel: false, insurance: true, vacations: true } };
      const r = await post("/api/travel/quote", { destination: "Barcelona" });
      assert.strictEqual(r.status, 402);
      assert.strictEqual(r.body && r.body.requiredCapability, "travel");
      return { ok: true, httpStatus: r.status, requiredCapability: r.body.requiredCapability };
    },
  });

  tests.push({
    name: "travel: missing destination/query",
    fn: async () => {
      state.plan = { id: "package_2", capabilities: { travel: true, insurance: true, vacations: true } };
      const r = await post("/api/travel/quote", { travelers: 2 });
      assert.strictEqual(r.status, 400);
      assert.strictEqual(r.body && r.body.error, "destination_or_query_required");
      return { ok: true, httpStatus: r.status, error: r.body.error };
    },
  });

  tests.push({
    name: "travel: valid",
    fn: async () => {
      const r = await post("/api/travel/quote", { destination: "Barcelona", travelers: 2, budgetEur: 1200 });
      assert.strictEqual(r.status, 200);
      assert.ok(r.body && r.body.ok === true);
      assert.strictEqual(r.body.module, "travel");
      assert.ok(Array.isArray(r.body.quotes) && r.body.quotes.length > 0);
      return { ok: true, httpStatus: r.status, quotes: r.body.quotes.length };
    },
  });

  const startedAt = Date.now();
  const out = [];
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const t0 = Date.now();
    try {
      const details = await t.fn();
      const ms = Date.now() - t0;
      passed += 1;
      out.push({ name: t.name, status: "pass", ms, details });
    } catch (e) {
      const ms = Date.now() - t0;
      failed += 1;
      out.push({ name: t.name, status: "fail", ms, error: (e && e.message) || String(e) });
    }
  }

  const durationMs = Date.now() - startedAt;

  const metrics = {
    tests_total: out.length,
    passed,
    failed,
    duration_ms: durationMs,
  };

  return { metrics, results: out };
}

function renderReport({ metrics, results }) {
  const rowsMetrics = Object.keys(metrics)
    .map((k) => `<tr><td>${escapeHtml(k)}</td><td class="num">${escapeHtml(metrics[k])}</td></tr>`)
    .join("");

  function summarizeDetails(d) {
    if (!d || typeof d !== "object") return "";
    const parts = [];
    if (d.httpStatus != null) parts.push(`http=${d.httpStatus}`);
    if (d.error) parts.push(`error=${d.error}`);
    if (d.requiredCapability) parts.push(`cap=${d.requiredCapability}`);
    if (d.quotes != null) parts.push(`quotes=${d.quotes}`);
    if (d.offers != null) parts.push(`offers=${d.offers}`);
    return parts.join(" ");
  }

  const head = [
    "test",
    "status",
    "http",
    "detail_1",
    "detail_2",
    "detail_3",
    "ms",
  ];

  const rows = results
    .map((r) => {
      const statusClass = r.status === "pass" ? "good" : "bad";
      const http = r.details && r.details.httpStatus != null ? String(r.details.httpStatus) : "";
      const d1 = r.status === "pass" ? summarizeDetails(r.details) : (r.error || "");
      const d2 = "";
      const d3 = "";
      return (
        `<tr>` +
        `<td>${escapeHtml(r.name)}</td>` +
        `<td class="${statusClass}">${escapeHtml(r.status)}</td>` +
        `<td class="num">${escapeHtml(http)}</td>` +
        `<td>${escapeHtml(d1)}</td>` +
        `<td>${escapeHtml(d2)}</td>` +
        `<td>${escapeHtml(d3)}</td>` +
        `<td class="num">${escapeHtml(r.ms)}</td>` +
        `</tr>`
      );
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dealsense Test Report (Module 2)</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { max-width: 760px; margin: 0 auto; padding: 6px; }
      .meta { color: var(--muted); font-size: 11px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead th { background: var(--head); font-size: 10px; font-weight: 600; color: var(--text); padding: 4px 5px; border: 1px solid var(--grid); text-align: left; }
      tbody td { font-size: 10px; padding: 2px 5px; border: 1px solid var(--grid); vertical-align: middle; }
      th { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      td { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
      td.good { background: rgba(34,197,94,.12); color: #166534; }
      td.warn { background: rgba(245,158,11,.14); color: #92400e; }
      td.bad { background: rgba(239,68,68,.12); color: #991b1b; }
      th.resizable { position: relative; }
      th.resizable .resizer { position: absolute; top: 0; right: 0; width: 10px; height: 100%; cursor: col-resize; user-select: none; z-index: 5; touch-action: none; pointer-events: auto; }
      th.resizable .resizer::after { content: ""; position: absolute; top: 15%; bottom: 15%; right: 2px; width: 2px; background: rgba(107,114,128,.55); border-radius: 1px; }
      th.resizable .resizer:hover { background: rgba(107,114,128,.12); }
      .spacer { height: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="meta">Dealsense Test Report (Module 2) · view=simple · set=module2x10</div>

      <table id="metricsTable">
        <thead>
          <tr>
            <th style="width: 70%">metric</th>
            <th class="num" style="width: 30%">value</th>
          </tr>
        </thead>
        <tbody>
          ${rowsMetrics}
        </tbody>
      </table>

      <div class="spacer"></div>

      <table id="productsTable">
        <thead>
          <tr>
            <th class="resizable" style="width: 30%">${head[0]}<div class="resizer" data-col="0"></div></th>
            <th class="resizable" style="width: 10%">${head[1]}<div class="resizer" data-col="1"></div></th>
            <th class="num resizable" style="width: 8%">${head[2]}<div class="resizer" data-col="2"></div></th>
            <th class="resizable" style="width: 30%">${head[3]}<div class="resizer" data-col="3"></div></th>
            <th class="resizable" style="width: 10%">${head[4]}<div class="resizer" data-col="4"></div></th>
            <th class="resizable" style="width: 4%">${head[5]}<div class="resizer" data-col="5"></div></th>
            <th class="num" style="width: 8%">${head[6]}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <script>
        (function () {
          function ensureResizers(tableId) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var ths = Array.prototype.slice.call(table.querySelectorAll('thead th'));
            ths.forEach(function (th, idx) {
              if (idx >= ths.length - 1) return;
              if (th.querySelector('.resizer')) return;
              th.classList.add('resizable');
              var h = document.createElement('div');
              h.className = 'resizer';
              h.setAttribute('data-col', String(idx));
              th.appendChild(h);
            });
          }

          function initResize(tableId) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var ths = table.querySelectorAll('thead th');
            var active = null;

            function setThWidthPx(th, px) {
              if (!th) return;
              var v = Math.max(60, px);
              th.style.width = v + 'px';
            }

            function onPointerMove(e) {
              if (!active) return;
              var dx = e.clientX - active.startX;
              setThWidthPx(active.th, active.startW + dx);
            }

            function onPointerUp() {
              if (!active) return;
              try {
                if (active.handle && active.pointerId != null) {
                  active.handle.releasePointerCapture(active.pointerId);
                }
              } catch (_) {}
              if (active.handle) {
                active.handle.removeEventListener('pointermove', onPointerMove);
                active.handle.removeEventListener('pointerup', onPointerUp);
                active.handle.removeEventListener('pointercancel', onPointerUp);
              }
              active = null;
            }

            table.querySelectorAll('.resizer').forEach(function (h) {
              h.addEventListener('pointerdown', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var col = Number(h.getAttribute('data-col'));
                var th = ths[col];
                if (!th) return;
                var rect = th.getBoundingClientRect();
                active = { th: th, startX: e.clientX, startW: rect.width, handle: h, pointerId: e.pointerId };
                try { h.setPointerCapture(e.pointerId); } catch (_) {}
                h.addEventListener('pointermove', onPointerMove);
                h.addEventListener('pointerup', onPointerUp);
                h.addEventListener('pointercancel', onPointerUp);
              });
            });
          }

          ensureResizers('metricsTable');
          ensureResizers('productsTable');
          initResize('metricsTable');
          initResize('productsTable');
        })();
      </script>
    </div>
  </body>
</html>`;
}

async function main() {
  const data = await runTests();
  const html = renderReport(data);
  const outPath = path.join(__dirname, "test-report-module2x10-simple.html");
  fs.writeFileSync(outPath, html, "utf8");
  const publicPath = path.join(__dirname, "..", "public", "test-report-module2x10-simple.html");
  try {
    fs.writeFileSync(publicPath, html, "utf8");
  } catch (e) {
    console.error("Could not write report to public/:", (e && e.message) || e);
  }
  console.log(outPath);
  console.log(publicPath);
}

main().catch((e) => {
  console.error("Module2 simple report failed:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
