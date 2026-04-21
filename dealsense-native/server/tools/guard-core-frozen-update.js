"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256File(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function main() {
  const unlock = String(process.env.CORE_FROZEN_GUARD_UNLOCK || "").trim();
  if (unlock !== "I_UNDERSTAND_UNLOCK_CORE_FROZEN_MODULES") {
    console.error(
      "Refused: set CORE_FROZEN_GUARD_UNLOCK=I_UNDERSTAND_UNLOCK_CORE_FROZEN_MODULES to update core frozen manifest."
    );
    process.exitCode = 1;
    return;
  }

  const manifestPath = path.join(__dirname, "core_frozen_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const files = (manifest && manifest.files) || {};

  const nextFiles = {};
  for (const rel of Object.keys(files)) {
    const abs = path.join(__dirname, "..", rel);
    nextFiles[rel] = sha256File(abs);
  }

  const nextManifest = {
    ...manifest,
    createdAt: new Date().toISOString().slice(0, 10),
    files: nextFiles,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(nextManifest, null, 2) + "\n");
  console.log("OK: updated core_frozen_manifest.json");
}

main();
