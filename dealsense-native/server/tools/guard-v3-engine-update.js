"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const unlock = String(process.env.V3_GUARD_UNLOCK || "").trim();
  if (unlock !== "I_UNDERSTAND_UNLOCK_V3_BASELINE") {
    console.error("Refused: set V3_GUARD_UNLOCK=I_UNDERSTAND_UNLOCK_V3_BASELINE to update baseline guard.");
    process.exitCode = 1;
    return;
  }

  const enginePath = path.join(__dirname, "..", "pricing", "v3-test-engine.js");
  const guardPath = path.join(__dirname, "guard-v3-engine.js");
  const sha = sha256File(enginePath);

  const src = fs.readFileSync(guardPath, "utf8");
  const next = src.replace(
    /const EXPECTED_SHA256 = "[a-f0-9]{64}";/i,
    `const EXPECTED_SHA256 = "${sha}";`
  );

  if (next === src) {
    console.error("Failed: could not locate EXPECTED_SHA256 constant in guard-v3-engine.js");
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(guardPath, next);
  console.log("OK: updated guard EXPECTED_SHA256 to:");
  console.log(sha);
}

main();
