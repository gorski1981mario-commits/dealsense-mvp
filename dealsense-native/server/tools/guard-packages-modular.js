"use strict";

const fs = require("fs");
const path = require("path");

function readUtf8(relPath) {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

function fail(msg) {
  console.error(`[guard-packages-modular] FAIL: ${msg}`);
  process.exit(1);
}

function mustInclude(haystack, needle, label) {
  if (!haystack.includes(needle)) fail(`${label} missing: ${needle}`);
}

function mustNotInclude(haystack, needle, label) {
  if (haystack.includes(needle)) fail(`${label} present (should be modularized): ${needle}`);
}

function main() {
  const server = readUtf8("server.js");

  mustInclude(server, "registerPackage1(app", "server.js");
  mustInclude(server, "registerPackage2(app", "server.js");
  mustInclude(server, "registerPackage3(app", "server.js");

  mustNotInclude(server, "\"/api/echo/top3\"", "server.js");
  mustNotInclude(server, "\"/api/travel/quote\"", "server.js");
  mustNotInclude(server, "\"/api/insurance/quote\"", "server.js");
  mustNotInclude(server, "\"/api/vacations/search\"", "server.js");
  mustNotInclude(server, "\"/api/finance/loans/quote\"", "server.js");
  mustNotInclude(server, "\"/api/finance/subscriptions/compare\"", "server.js");

  const p1 = readUtf8(path.join("packages", "package_1.js"));
  mustInclude(p1, "registerPackage1", "packages/package_1.js");
  mustInclude(p1, "\"/api/echo/top3\"", "packages/package_1.js");

  const p2 = readUtf8(path.join("packages", "package_2", "index.js"));
  mustInclude(p2, "registerPackage2", "packages/package_2/index.js");
  const p2Travel = readUtf8(path.join("packages", "package_2", "travel.js"));
  mustInclude(p2Travel, "\"/api/travel/quote\"", "packages/package_2/travel.js");
  const p2Vacations = readUtf8(path.join("packages", "package_2", "vacations.js"));
  mustInclude(p2Vacations, "\"/api/vacations/search\"", "packages/package_2/vacations.js");
  const p2Insurance = readUtf8(path.join("packages", "package_2", "insurance.js"));
  mustInclude(p2Insurance, "\"/api/insurance/quote\"", "packages/package_2/insurance.js");

  const p3 = readUtf8(path.join("packages", "package_3", "index.js"));
  mustInclude(p3, "registerPackage3", "packages/package_3/index.js");
  const p3Loans = readUtf8(path.join("packages", "package_3", "loans.js"));
  mustInclude(p3Loans, "\"/api/finance/loans/quote\"", "packages/package_3/loans.js");
  const p3Subs = readUtf8(path.join("packages", "package_3", "subscriptions.js"));
  mustInclude(p3Subs, "\"/api/finance/subscriptions/compare\"", "packages/package_3/subscriptions.js");

  console.log("OK: package routing is modularized.");
}

main();
