"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

function main() {
  const guardPath = path.join(__dirname, "guard-module2-engine.js");
  const restorePath = path.join(__dirname, "restore-module2-engine.js");

  const guard = spawnSync(process.execPath, [guardPath], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });

  if (guard.status === 0) {
    console.log("OK: Module2 baseline is intact.");
    return;
  }

  console.error("WARN: Module2 baseline mismatch detected. Attempting auto-restore...");

  const env = { ...process.env, RESTORE_MODULE2_CONFIRM: "YES" };
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

  console.log("OK: Module2 restored and verified.");
}

main();
