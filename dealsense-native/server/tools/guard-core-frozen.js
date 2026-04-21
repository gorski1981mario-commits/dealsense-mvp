"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const manifestPath = path.join(__dirname, "core_frozen_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const files = (manifest && manifest.files) || {};

  const mismatches = [];
  const uninitialized = [];

  for (const rel of Object.keys(files)) {
    const expected = files[rel];
    if (!expected || typeof expected !== "string" || expected.trim().length < 10) {
      uninitialized.push(rel);
      continue;
    }

    const abs = path.join(__dirname, "..", rel);
    let actual;
    try {
      actual = sha256File(abs);
    } catch (e) {
      mismatches.push({ file: rel, expected, actual: null, reason: "missing" });
      continue;
    }

    if (actual !== expected) {
      mismatches.push({ file: rel, expected, actual, reason: "sha256_mismatch" });
    }
  }

  if (uninitialized.length > 0) {
    console.error("Core frozen modules guard refused: manifest not initialized.");
    console.error("Run: npm run guard:core:frozen:update (requires CORE_FROZEN_GUARD_UNLOCK)");
    for (const rel of uninitialized) {
      console.error(`- ${rel}`);
    }
    process.exitCode = 1;
    return;
  }

  if (mismatches.length > 0) {
    console.error("Core frozen modules guard failed: unexpected fingerprints");
    for (const m of mismatches) {
      console.error(`- ${m.file}: ${m.reason}`);
      console.error(`  expected: ${m.expected}`);
      console.error(`  actual:   ${m.actual}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("OK: core frozen modules fingerprints match manifest.");
}

main();
