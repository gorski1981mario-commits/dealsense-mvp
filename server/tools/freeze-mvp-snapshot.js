"use strict";

const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function normRel(p) {
  return String(p).replace(/\//g, "\\");
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function writeJson(dst, obj) {
  ensureDir(path.dirname(dst));
  fs.writeFileSync(dst, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function shouldExcludeRel(rel) {
  const r = normRel(rel);
  if (!r) return true;

  // Never snapshot dependencies or snapshots.
  if (r.startsWith("node_modules\\")) return true;
  if (r.startsWith("frozen\\")) return true;

  // Ignore VCS / editor stuff
  if (r.startsWith(".git\\")) return true;
  if (r.startsWith(".cursor\\")) return true;

  // Runtime / logs
  if (r === "events.jsonl") return true;
  if (r.endsWith(".log")) return true;
  if (r.endsWith(".tmp")) return true;

  // Big/binary artifacts
  if (r.endsWith(".zip") || r.endsWith(".7z") || r.endsWith(".gz")) return true;
  if (r.endsWith(".png") || r.endsWith(".jpg") || r.endsWith(".jpeg") || r.endsWith(".webp")) return true;

  // Keep test outputs out of MVP snapshot to keep it small.
  if (r.startsWith("tools\\") && (r.endsWith(".output.json") || r.endsWith("_output.json"))) return true;

  return false;
}

function shouldIncludeRel(rel) {
  const r = normRel(rel);
  if (shouldExcludeRel(r)) return false;

  const topAllowed = [
    "server.js",
    "market-api.js",
    "package.json",
    "START-MVP.bat",
    "STOP-MVP.bat",
    "run-mvp-top3.ps1",
    "run-echo-top3-dashboard.ps1",
    "run-bench-echo-cache.ps1",
  ];
  if (topAllowed.includes(r)) return true;

  const allowedDirs = [
    "engine\\",
    "scoring\\",
    "market\\",
    "pricing\\",
    "packages\\",
    "tools\\",
    "public\\",
  ];
  if (allowedDirs.some((d) => r.startsWith(d))) {
    // Only snapshot source-ish files.
    const ext = path.extname(r).toLowerCase();
    if ([".js", ".json", ".ps1", ".bat", ".cmd", ".html", ".css", ".md", ".txt"].includes(ext)) return true;
    return false;
  }

  return false;
}

function collectFilesRecursive(root, relDir) {
  const absDir = path.join(root, relDir);
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch (_) {
    return out;
  }

  for (const ent of entries) {
    const rel = relDir ? path.join(relDir, ent.name) : ent.name;
    const abs = path.join(root, rel);
    if (ent.isDirectory()) {
      if (shouldExcludeRel(rel + path.sep)) continue;
      out.push(...collectFilesRecursive(root, rel));
    } else if (ent.isFile()) {
      if (!shouldIncludeRel(rel)) continue;
      out.push(rel);
    }
  }
  return out;
}

function main() {
  const root = path.join(__dirname, "..");
  const snapshotDirFromEnv = String(process.env.SNAPSHOT_DIR || "").trim();
  const snapshotName = String(process.env.SNAPSHOT_NAME || "mvp-stable").trim() || "mvp-stable";
  const outDir = snapshotDirFromEnv
    ? (path.isAbsolute(snapshotDirFromEnv) ? snapshotDirFromEnv : path.join(root, snapshotDirFromEnv))
    : path.join(root, "frozen", snapshotName);
  ensureDir(outDir);

  const files = Array.from(new Set(collectFilesRecursive(root, "").map(normRel))).sort();

  const copied = [];
  for (const rel of files) {
    const src = path.join(root, rel);
    const dst = path.join(outDir, rel);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing file to freeze: ${src}`);
    }
    copyFile(src, dst);
    copied.push(rel);
  }

  writeJson(path.join(outDir, "MANIFEST.json"), {
    frozenAt: new Date().toISOString(),
    copied,
  });

  console.log(outDir);
}

main();
