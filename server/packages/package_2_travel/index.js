"use strict";

const { registerTravel: registerTravelV1, computeTravelMatchScore: computeTravelMatchScoreV1 } = require("../package_2/travel");
const { registerTravel: registerTravelV2, computeTravelMatchScore: computeTravelMatchScoreV2 } = require("../package_2_next/travel");

function registerPackage2Travel(app, deps) {
  registerTravelV1(app, deps);
  registerTravelV2(app, deps);
}

module.exports = {
  registerPackage2Travel,
  computeTravelMatchScoreV1,
  computeTravelMatchScoreV2,
};
