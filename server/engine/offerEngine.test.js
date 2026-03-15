"use strict";

const assert = require("assert");

// unit-level test: we only validate selection glue, not external API calls
const { computeTitleMatchScore } = require("../scoring/match");
const { parseDeliveryDays } = require("../scoring/delivery");

function run() {
  assert.ok(computeTitleMatchScore("Samsung QN74F", "SAMSUNG QN74F Neo QLED") > 0);
  assert.strictEqual(parseDeliveryDays("1-3 werkdagen"), 3);
  console.log("OK: engine sanity passed");
}

run();
