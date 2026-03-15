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

function loadSnapshotManifest(snapDir) {
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

  const confirm = String(process.env.RESTORE_MODULE2_CONFIRM || "").trim().toUpperCase();
  if (confirm !== "YES") {
    console.error("Refusing to restore Module2 snapshot without RESTORE_MODULE2_CONFIRM=YES");
    process.exitCode = 2;
    return;
  }

  const candidates = [
    { name: "module2-stable", dir: path.join(root, "frozen", "module2-stable") },
    { name: "module2-latest", dir: path.join(root, "frozen", "module2-latest") },
  ];

  let snapshotName = null;
  let snapDir = null;
  let files = null;
  let snapManifest = null;

  for (const c of candidates) {
    try {
      const r = loadSnapshotManifest(c.dir);
      for (const rel of r.files) {
        const p = path.join(c.dir, rel);
        if (!fs.existsSync(p)) throw new Error(`Snapshot file missing: ${p}`);
      }
      snapshotName = c.name;
      snapDir = c.dir;
      files = r.files;
      snapManifest = r.manifest;
      break;
    } catch (_) {
      // try next
    }
  }

  if (!snapDir || !files) {
    throw new Error("No valid Module2 snapshot found (tried module2-stable, module2-latest)");
  }

  const backupsDir = path.join(root, "frozen", "backups", `module2-${isoStamp()}`);
  archiveCurrent(root, files, backupsDir);

  for (const rel of files) {
    const src = path.join(snapDir, rel);
    const dst = path.join(root, rel);
    if (!fs.existsSync(src)) throw new Error(`Missing snapshot file: ${src}`);
    copyFile(src, dst);
  }

  const latestDir = path.join(root, "frozen", "module2-latest");
  freezeTo(root, files, latestDir);

  writeJson(path.join(root, "frozen", "RESTORE_LOG_MODULE2.json"), {
    restoredAt: new Date().toISOString(),
    from: snapshotName,
    backupCreated: backupsDir,
    latestCreated: latestDir,
    stableFrozenAt: snapManifest && snapManifest.frozenAt ? snapManifest.frozenAt : null,
  });

  console.log("restored");
}

main();
