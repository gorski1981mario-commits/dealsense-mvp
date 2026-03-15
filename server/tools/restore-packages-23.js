"use strict";

const fs = require("fs");
const path = require("path");

function copyFileSync(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDirSync(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Source directory does not exist: ${srcDir}`);
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  fs.mkdirSync(dstDir, { recursive: true });
  for (const e of entries) {
    const src = path.join(srcDir, e.name);
    const dst = path.join(dstDir, e.name);
    if (e.isDirectory()) {
      copyDirSync(src, dst);
    } else if (e.isFile()) {
      copyFileSync(src, dst);
    }
  }
}

function main() {
  const root = path.join(__dirname, "..");
  const frozenRoot = path.join(root, "frozen", "packages-23-snapshot");
  const stamp = String(process.env.PACKAGES_23_RESTORE_STAMP || "").trim();

  if (!stamp) {
    throw new Error(`Set PACKAGES_23_RESTORE_STAMP to a snapshot timestamp directory name under: ${frozenRoot}`);
  }

  const srcDir = path.join(frozenRoot, stamp);
  const src2 = path.join(srcDir, "package_2");
  const src3 = path.join(srcDir, "package_3");

  const dstPackages = path.join(root, "packages");
  const dst2 = path.join(dstPackages, "package_2");
  const dst3 = path.join(dstPackages, "package_3");

  const unlock = String(process.env.PACKAGES_23_RESTORE_UNLOCK || "").trim();
  if (unlock !== "I_UNDERSTAND_RESTORE_PACKAGES_23") {
    throw new Error("Refused: set PACKAGES_23_RESTORE_UNLOCK=I_UNDERSTAND_RESTORE_PACKAGES_23 to restore package_2/package_3.");
  }

  if (fs.existsSync(src2)) copyDirSync(src2, dst2);
  if (fs.existsSync(src3)) copyDirSync(src3, dst3);

  const meta = {
    ts: new Date().toISOString(),
    restoredFrom: srcDir,
    restored: {
      package_2: fs.existsSync(src2),
      package_3: fs.existsSync(src3),
    },
  };

  console.log(JSON.stringify(meta, null, 2));
}

main();
