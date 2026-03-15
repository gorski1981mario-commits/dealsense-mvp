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
  const root = path.join(__dirname, "..");
  const intervalSec = Math.max(5, Math.min(toInt(process.env.ECHO_DASH_INTERVAL_SEC, 15), 600));

  if (!process.env.AUTO_REFRESH_SECONDS) process.env.AUTO_REFRESH_SECONDS = String(intervalSec);

  console.log(`[watch-echo-top3-dashboard] intervalSec=${intervalSec}`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const started = Date.now();
    try {
      execFileSync("node", ["tools/echo-top3-dashboard.js"], {
        cwd: root,
        env: process.env,
        stdio: "inherit",
      });

      const took = Date.now() - started;
      const wait = Math.max(0, intervalSec * 1000 - took);
      console.log(`[watch-echo-top3-dashboard] cycle_ok tookMs=${took} next_in_ms=${wait}`);
      await sleep(wait);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      console.error(`[watch-echo-top3-dashboard] cycle_fail: ${msg}`);
      await sleep(intervalSec * 1000);
    }
  }
}

main().catch((err) => {
  console.error("watch-echo-top3-dashboard failed:", (err && err.message) || err);
  process.exitCode = 1;
});
