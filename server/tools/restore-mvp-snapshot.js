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

function writeJson(dst, obj) {
  ensureDir(path.dirname(dst));
  fs.writeFileSync(dst, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function loadManifest(snapDir) {
  const manifestPath = path.join(snapDir, "MANIFEST.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`Snapshot manifest not found: ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const files = Array.isArray(manifest.copied) ? manifest.copied : [];
  if (files.length === 0) throw new Error("Snapshot manifest has no files");
  return { manifest, files };
}

function archiveCurrent(root, files, backupsDir) {
  ensureDir(backupsDir);
  const archived = [];
  for (const rel of files) {
    const src = path.join(root, rel);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(backupsDir, rel);
    copyFile(src, dst);
    archived.push(rel);
  }
  writeJson(path.join(backupsDir, "MANIFEST.json"), {
    archivedAt: new Date().toISOString(),
    archived,
  });
}

function freezeTo(root, files, outDir) {
  ensureDir(outDir);
  for (const rel of files) {
    const src = path.join(root, rel);
    if (!fs.existsSync(src)) throw new Error(`Missing file to freeze: ${src}`);
    const dst = path.join(outDir, rel);
    copyFile(src, dst);
  }
  writeJson(path.join(outDir, "MANIFEST.json"), {
    frozenAt: new Date().toISOString(),
    copied: files,
  });
}

function main() {
  const root = path.join(__dirname, "..");
  const candidates = [
    { name: "mvp-stable", dir: path.join(root, "frozen", "mvp-stable") },
    { name: "mvp-latest", dir: path.join(root, "frozen", "mvp-latest") },
  ];

  const confirm = String(process.env.RESTORE_CONFIRM || "").trim().toUpperCase();
  if (confirm !== "YES") {
    console.error("Refusing to restore snapshot without RESTORE_CONFIRM=YES");
    process.exitCode = 2;
    return;
  }

  let snapshotName = null;
  let snapDir = null;
  let manifest = null;
  let files = null;
  for (const c of candidates) {
    try {
      const r = loadManifest(c.dir);
      // Ensure snapshot files exist before choosing.
      for (const rel of r.files) {
        const p = path.join(c.dir, rel);
        if (!fs.existsSync(p)) throw new Error(`Snapshot file missing: ${p}`);
      }
      snapshotName = c.name;
      snapDir = c.dir;
      manifest = r.manifest;
      files = r.files;
      break;
    } catch (_) {
      // try next candidate
    }
  }
  if (!snapDir || !files) {
    throw new Error("No valid snapshot found (tried mvp-stable, mvp-latest)");
  }

  // Always keep one more safe copy: archive current operational state first.
  const backupsDir = path.join(root, "frozen", "backups", `mvp-${isoStamp()}`);
  archiveCurrent(root, files, backupsDir);

  for (const rel of files) {
    const src = path.join(snapDir, rel);
    const dst = path.join(root, rel);
    if (!fs.existsSync(src)) throw new Error(`Missing snapshot file: ${src}`);
    copyFile(src, dst);
  }

  // After restoring stable, immediately freeze a fresh copy as mvp-latest.
  const latestDir = path.join(root, "frozen", "mvp-latest");
  freezeTo(root, files, latestDir);

  // Persist restore metadata.
  writeJson(path.join(root, "frozen", "RESTORE_LOG.json"), {
    restoredAt: new Date().toISOString(),
    from: snapshotName,
    backupCreated: backupsDir,
    latestCreated: latestDir,
    stableFrozenAt: manifest && manifest.frozenAt ? manifest.frozenAt : null,
  });

  console.log("restored");
}

main();
