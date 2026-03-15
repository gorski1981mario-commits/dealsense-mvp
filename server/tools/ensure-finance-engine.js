"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

function main() {
  const guardPath = path.join(__dirname, "guard-finance-engine.js");
  const restorePath = path.join(__dirname, "restore-finance-engine.js");

  const guard = spawnSync(process.execPath, [guardPath], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });

  if (guard.status === 0) {
    console.log("OK: Finance baseline is intact.");
    return;
  }

  console.error("WARN: Finance baseline mismatch detected. Attempting auto-restore...");

  const env = { ...process.env, RESTORE_FINANCE_CONFIRM: "YES" };
  const restore = spawnSync(process.execPath, [restorePath], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env,
  });

  if (restore.status !== 0) {
    console.error("FAIL: auto-restore failed.");
    process.exitCode = 1;
    return;
  }

  const guard2 = spawnSync(process.execPath, [guardPath], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });

  if (guard2.status !== 0) {
    console.error("FAIL: baseline still mismatched after restore.");
    process.exitCode = 1;
    return;
  }

  console.log("OK: Finance restored and verified.");
}

main();
