"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const unlock = String(process.env.FINANCE_GUARD_UNLOCK || "").trim();
  if (unlock !== "I_UNDERSTAND_UNLOCK_FINANCE_BASELINE") {
    console.error("Refused: set FINANCE_GUARD_UNLOCK=I_UNDERSTAND_UNLOCK_FINANCE_BASELINE to update finance baseline manifest.");
    process.exitCode = 1;
    return;
  }

  const manifestPath = path.join(__dirname, "finance_engine_manifest.json");
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const files = (manifest && manifest.files) || {};

  const root = path.join(__dirname, "..");
  const next = {
    title: "Finance engine baseline (SHA256)",
    createdAt: new Date().toISOString(),
    files: {},
  };

  for (const relPath of Object.keys(files)) {
    const absPath = path.join(root, relPath);
    next.files[relPath] = sha256File(absPath);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log("OK: updated finance_engine_manifest.json");
}

main();
