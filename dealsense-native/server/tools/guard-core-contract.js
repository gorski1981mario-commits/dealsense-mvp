"use strict";

const fs = require("fs");
const path = require("path");

function readUtf8(relPath) {
  const abs = path.join(__dirname, "..", relPath);
  return fs.readFileSync(abs, "utf8");
}

function assertIncludes(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing contract: ${label}`);
  }
}

function main() {
  const failures = [];

  try {
    const server = readUtf8("server.js");
    assertIncludes(server, "async function getSession(sessionId, fingerprint, ip)", "getSession(sessionId, fingerprint, ip) in server.js");
    assertIncludes(server, "createSessionKey(fingerprint, ip)", "createSessionKey(fingerprint, ip) usage in server.js");
    assertIncludes(server, "\"/billing/redeem-code\"", "POST /billing/redeem-code route in server.js");
    assertIncludes(server, "consumeCode(code)", "consumeCode(code) usage in /billing/redeem-code");
    assertIncludes(server, "applyPlanToSession", "applyPlanToSession usage in server.js (codes/plan apply chain)");
    assertIncludes(server, "getPlanById(planId)", "getPlanById(planId) usage in server.js (plan lookup for codes/packages)");
    assertIncludes(server, "fingerprint", "fingerprint field handling in server.js");
    assertIncludes(server, "\"/api/vision/extract\"", "POST /api/vision/extract route in server.js");
  } catch (e) {
    failures.push(String((e && e.message) || e));
  }

  try {
    const codes = readUtf8(path.join("billing", "codes.js"));
    assertIncludes(codes, "function createCode", "createCode() in billing/codes.js");
    assertIncludes(codes, "function consumeCode", "consumeCode() in billing/codes.js");
    assertIncludes(codes, "planId", "planId stored on code entry in billing/codes.js");
    assertIncludes(codes, "module.exports", "module.exports in billing/codes.js");
  } catch (e) {
    failures.push(String((e && e.message) || e));
  }

  try {
    const plans = readUtf8(path.join("billing", "plans.js"));
    assertIncludes(plans, "function getPlans()", "getPlans() in billing/plans.js");
    assertIncludes(plans, "function getPlanById", "getPlanById() in billing/plans.js");
    assertIncludes(plans, "getPackages", "getPackages() usage/import in billing/plans.js");
  } catch (e) {
    failures.push(String((e && e.message) || e));
  }

  try {
    const packages = readUtf8(path.join("billing", "packages.js"));
    assertIncludes(packages, "function getPackages", "getPackages() in billing/packages.js");
    assertIncludes(packages, "package_1", "package_1 id in billing/packages.js");
    assertIncludes(packages, "package_2", "package_2 id in billing/packages.js");
    assertIncludes(packages, "package_3", "package_3 id in billing/packages.js");
  } catch (e) {
    failures.push(String((e && e.message) || e));
  }

  try {
    const applyPlan = readUtf8(path.join("billing", "applyPlan.js"));
    assertIncludes(applyPlan, "function applyPlanToSession", "applyPlanToSession() in billing/applyPlan.js");
    assertIncludes(applyPlan, "paidScansRemaining", "paidScansRemaining crediting in billing/applyPlan.js");
    assertIncludes(applyPlan, "function getEffectivePlanId", "getEffectivePlanId() in billing/applyPlan.js");
  } catch (e) {
    failures.push(String((e && e.message) || e));
  }

  if (failures.length > 0) {
    console.error("Core contract guard failed:");
    for (const f of failures) {
      console.error(`- ${f}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("OK: core contract guard passed.");
}

main();
