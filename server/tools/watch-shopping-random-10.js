"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : def;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const allow = (() => {
    const v = String(process.env.DEALSENSE_ALLOW_WATCH || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  if (!allow) {
    console.error("[watch-shopping-random-10] blocked: set DEALSENSE_ALLOW_WATCH=1 to enable.");
    return;
  }

  const root = path.join(__dirname, "..");
  const intervalSec = Math.max(5, Math.min(toInt(process.env.SHOPPING_WATCH_INTERVAL_SEC, 30), 600));

  const cycleTimeoutMs = (() => {
    const raw = String(process.env.SHOPPING_WATCH_CYCLE_TIMEOUT_MS || "").trim();
    const n = raw ? Number(raw) : NaN;
    // Default: 4 minutes per step (test + render), but allow configuration.
    const def = 240000;
    if (!Number.isFinite(n) || n <= 0) return def;
    return Math.max(5000, Math.min(Math.floor(n), 30 * 60 * 1000));
  })();

  // Force LIVE behavior for the loop
  process.env.USE_MOCK_FALLBACK = "false";

  // Keep noise down
  if (!process.env.MARKET_LOG_SILENT) process.env.MARKET_LOG_SILENT = "1";

  // Make HTML auto-refresh in browser
  if (!process.env.AUTO_REFRESH_SECONDS) process.env.AUTO_REFRESH_SECONDS = String(intervalSec);

  console.log(`[watch-shopping-random-10] intervalSec=${intervalSec} cycleTimeoutMs=${cycleTimeoutMs}`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const started = Date.now();
    try {
      execFileSync("node", ["tools/test-shopping-random-10.js"], {
        cwd: root,
        env: process.env,
        timeout: cycleTimeoutMs,
        stdio: "inherit",
      });

      execFileSync("node", ["tools/render-shopping-random-10-simple-html.js"], {
        cwd: root,
        env: process.env,
        timeout: cycleTimeoutMs,
        stdio: "inherit",
      });

      const tookMs = Date.now() - started;
      const waitMs = Math.max(0, intervalSec * 1000 - tookMs);
      console.log(`[watch-shopping-random-10] cycle_ok tookMs=${tookMs} next_in_ms=${waitMs}`);
      await sleep(waitMs);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      console.error(`[watch-shopping-random-10] cycle_fail: ${msg}`);
      await sleep(intervalSec * 1000);
    }
  }
}

main().catch((err) => {
  console.error("watch-shopping-random-10 failed:", (err && err.message) || err);
  process.exitCode = 1;
});
