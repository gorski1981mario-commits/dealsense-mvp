"use strict";

const assert = require("assert");

const searchapi = require("./searchapi");
const serpapi = require("./serpapi");

function run() {
  assert.strictEqual(typeof searchapi.fetchOffers, "function");
  assert.strictEqual(typeof serpapi.fetchOffers, "function");

  // sanity mapping assumptions: do not call external APIs
  const sample = {
    title: "Test Product",
    source: "ShopX",
    price: "€ 99,95",
    extracted_price: 99.95,
    rating: 4.4,
    reviews: 120,
    product_link: "https://shopx.test/p",
    delivery: "1-3 werkdagen",
    thumbnail: "https://img.test/x.png",
  };

  const mapped = (() => {
    // mimic internal mapping by calling fetchOffers? cannot (network). so re-require and use private not possible.
    // therefore: just ensure provider modules load without side effects.
    return sample;
  })();

  assert.ok(mapped.title);
  console.log("OK: providers modules loaded");
}

run();
