"use strict";

const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function loadManifest(root) {
  const manifestPath = path.join(root, "tools", "module2_engine_manifest.json");
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const files = (manifest && manifest.files) || {};
  const rels = Object.keys(files);
  if (rels.length === 0) throw new Error("module2_engine_manifest.json has no files");
  return { manifest, rels };
}

function writeJson(dst, obj) {
  ensureDir(path.dirname(dst));
  fs.writeFileSync(dst, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function main() {
  const root = path.join(__dirname, "..");
  const { rels } = loadManifest(root);

  const name = String(process.env.MODULE2_SNAPSHOT_NAME || "module2-stable").trim() || "module2-stable";
  const outDir = path.join(root, "frozen", name);
  ensureDir(outDir);

  const copied = [];
  for (const rel of rels) {
    const src = path.join(root, rel);
    if (!fs.existsSync(src)) throw new Error(`Missing file to freeze: ${src}`);
    const dst = path.join(outDir, rel);
    copyFile(src, dst);
    copied.push(rel);
  }

  writeJson(path.join(outDir, "MANIFEST.json"), {
    frozenAt: new Date().toISOString(),
    snapshot: name,
    copied,
  });

  console.log(outDir);
}

main();
