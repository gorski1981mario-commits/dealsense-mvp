"use strict";

const fs = require("fs");
const path = require("path");

function copyFileSync(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDirSync(srcDir, dstDir, ignore) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  fs.mkdirSync(dstDir, { recursive: true });
  for (const e of entries) {
    const src = path.join(srcDir, e.name);
    const rel = path.relative(srcDir, src);
    const dst = path.join(dstDir, rel);
    if (ignore && ignore(src, e)) continue;
    if (e.isDirectory()) {
      copyDirSync(src, dst, ignore);
    } else if (e.isFile()) {
      copyFileSync(src, dst);
    }
  }
}

function main() {
  const root = path.join(__dirname, "..");
  const srcPackages = path.join(root, "packages");
  const outRoot = path.join(root, "frozen", "packages-23-snapshot");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(outRoot, stamp);

  const src2 = path.join(srcPackages, "package_2");
  const src3 = path.join(srcPackages, "package_3");

  copyDirSync(src2, path.join(outDir, "package_2"));
  copyDirSync(src3, path.join(outDir, "package_3"));

  const meta = {
    ts: new Date().toISOString(),
    root,
    outDir,
    copied: {
      package_2: fs.existsSync(src2),
      package_3: fs.existsSync(src3),
    },
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "snapshot.meta.json"), JSON.stringify(meta, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(meta, null, 2));
}

main();
