"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const EXPECTED_SHA256 = "7abc894c77fab92e5a3cc9a4a70357944ba1d0a1f8af53c0a2097c00f6797d2d";

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const enginePath = path.join(__dirname, "..", "pricing", "v3-test-engine.js");
  const actual = sha256File(enginePath);
  const bypass = (() => {
    const v = String(process.env.GUARD_V3_BYPASS || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  if (actual !== EXPECTED_SHA256) {
    console.error("V3 engine guard failed: unexpected pricing/v3-test-engine.js fingerprint");
    console.error(`Expected: ${EXPECTED_SHA256}`);
    console.error(`Actual:   ${actual}`);
    if (!bypass) {
      process.exitCode = 1;
      return;
    }
    console.error("[guard-v3-engine] Bypassing mismatch due to GUARD_V3_BYPASS=1");
    return;
  }

  console.log("OK: V3 engine fingerprint matches expected reference.");
}

main();
