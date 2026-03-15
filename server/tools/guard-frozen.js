"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const manifestPath = path.join(__dirname, "frozen_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const files = (manifest && manifest.files) || {};

  const mismatches = [];
  for (const rel of Object.keys(files)) {
    const expected = files[rel];
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

  if (mismatches.length > 0) {
    console.error("Frozen modules guard failed: unexpected fingerprints");
    for (const m of mismatches) {
      console.error(`- ${m.file}: ${m.reason}`);
      console.error(`  expected: ${m.expected}`);
      console.error(`  actual:   ${m.actual}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("OK: frozen modules fingerprints match manifest.");
}

main();
