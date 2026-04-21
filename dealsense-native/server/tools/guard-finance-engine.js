"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const bypass = (() => {
    const v = String(process.env.GUARD_FINANCE_BYPASS || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();

  const manifestPath = path.join(__dirname, "finance_engine_manifest.json");
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const files = (manifest && manifest.files) || {};

  const root = path.join(__dirname, "..");
  const mismatches = [];

  for (const relPath of Object.keys(files)) {
    const expected = String(files[relPath] || "").trim().toLowerCase();
    const absPath = path.join(root, relPath);
    let actual = null;
    try {
      actual = sha256File(absPath);
    } catch (_) {
      mismatches.push({ file: relPath, reason: "missing_or_unreadable", expected, actual: null });
      continue;
    }
    if (expected && actual !== expected) {
      mismatches.push({ file: relPath, reason: "sha_mismatch", expected, actual });
    }
  }

  if (mismatches.length > 0) {
    console.error("Finance engine guard failed: unexpected fingerprints");
    console.error(JSON.stringify({ mismatches }, null, 2));
    if (!bypass) {
      process.exitCode = 1;
      return;
    }
    console.error("[guard-finance-engine] Bypassing mismatches due to GUARD_FINANCE_BYPASS=1");
    return;
  }

  console.log("OK: Finance engine fingerprints match expected baseline.");
}

main();
