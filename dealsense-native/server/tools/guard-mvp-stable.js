"use strict";

const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error(`[guard-mvp-stable] FAIL: ${msg}`);
  process.exit(1);
}

function mustExist(p) {
  if (!fs.existsSync(p)) fail(`missing: ${p}`);
}

function mustInclude(filePath, needle) {
  const s = fs.readFileSync(filePath, "utf8");
  if (!s.includes(needle)) fail(`missing '${needle}' in ${path.basename(filePath)}`);
}

function main() {
  const root = path.join(__dirname, "..");

  mustExist(path.join(root, "START-MVP.bat"));
  mustExist(path.join(root, "run-mvp-top3.ps1"));
  mustExist(path.join(root, "run-echo-top3-dashboard.ps1"));

  mustExist(path.join(root, "tools", "echo-top3-dashboard.js"));
  mustExist(path.join(root, "public"));

  mustInclude(path.join(root, "server.js"), "/tools/echo-top3-dashboard/refresh");
  mustInclude(path.join(root, "tools", "echo-top3-dashboard.js"), "Odśwież teraz");

  console.log("[guard-mvp-stable] OK");
}

main();
