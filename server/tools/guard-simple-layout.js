const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function fail(msg) {
  console.error(`[guard-simple-layout] FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[guard-simple-layout] OK: ${msg}`);
}

function mustInclude(haystack, needle, label) {
  if (!haystack.includes(needle)) fail(`${label} missing: ${needle}`);
}

function runGenerate() {
  const env = {
    ...process.env,
    TEST_OUTPUT_FORMAT: "html",
    TEST_HTML_VIEW: "simple",
    TEST_PRODUCT_SET: process.env.TEST_PRODUCT_SET || "bench10",
    TEST_GATE: "0",
    TEST_PRICE_SUFFIX: process.env.TEST_PRICE_SUFFIX || "€",
  };

  execFileSync("node", ["tools/test-v3-top3-table.js"], {
    cwd: path.join(__dirname, ".."),
    env,
    stdio: "inherit",
  });

  const outPath = path.join(__dirname, `test-report-${env.TEST_PRODUCT_SET}-simple.html`);
  if (!fs.existsSync(outPath)) fail(`output not found: ${outPath}`);
  return { outPath, priceSuffix: env.TEST_PRICE_SUFFIX };
}

function pickInputFile() {
  const fromEnv = String(process.env.GUARD_FILE || "").trim();
  if (fromEnv) {
    const p = path.isAbsolute(fromEnv) ? fromEnv : path.join(__dirname, fromEnv);
    if (!fs.existsSync(p)) fail(`GUARD_FILE not found: ${p}`);
    return p;
  }

  const stable = [
    path.join(__dirname, "test-report-bench10-simple.STABLE.html"),
    path.join(__dirname, "test-report-bench10b-simple.STABLE.html"),
  ];
  const existing = stable.filter((p) => fs.existsSync(p));
  if (existing.length === 0) fail("No STABLE html snapshots found in tools/. Run snapshot first.");
  // Prefer bench10 as canonical
  return existing[0];
}

function validateHtml({ html, priceSuffix, label }) {
  mustInclude(html, "server_returns_total", "metrics");
  mustInclude(html, "products_total", "metrics");

  mustInclude(html, "1 (best)", "header");
  mustInclude(html, "2 (mid)", "header");
  mustInclude(html, "3 (worst)", "header");
  mustInclude(html, "ret", "header");
  mustInclude(html, "%_diff", "header");

  mustInclude(html, "td.good", "colors");
  mustInclude(html, "td.warn", "colors");
  mustInclude(html, "td.bad", "colors");
  mustInclude(html, "td.ret", "colors");

  // Layout invariants (compact view)
  mustInclude(html, "table-layout: fixed", "css");
  mustInclude(html, "max-width: 760px", "css");
  mustInclude(html, "font-size: 10px", "css");

  // Resize functionality (mouse drag on header handles)
  mustInclude(html, "id=\"metricsTable\"", "resize");
  mustInclude(html, "id=\"productsTable\"", "resize");
  mustInclude(html, "class=\"resizer\"", "resize");
  mustInclude(html, "cursor: col-resize", "resize");

  if (!html.includes(` ${priceSuffix}<`) && !html.includes(` ${priceSuffix}`)) {
    fail(`price suffix not found in HTML: ${priceSuffix}`);
  }

  const baseUserRe = /<td[^>]*class="[^"]*\bbase\b[^"]*"[^>]*>\s*(user|użytkownik|uzytkownik)\b/i;
  if (baseUserRe.test(html)) {
    fail("'user/użytkownik' label present in base column (should be suppressed)");
  }

  ok(`layout stable: ${label}`);
}

function main() {
  const doGenerate = String(process.env.GUARD_GENERATE || "0").trim() === "1";
  if (doGenerate) {
    const { outPath, priceSuffix } = runGenerate();
    const html = fs.readFileSync(outPath, "utf8");
    validateHtml({ html, priceSuffix, label: path.basename(outPath) });
    return;
  }

  // Fast path: validate existing HTML snapshots (no network)
  const filePath = pickInputFile();
  const html = fs.readFileSync(filePath, "utf8");
  const priceSuffix = String(process.env.TEST_PRICE_SUFFIX || "€");
  validateHtml({ html, priceSuffix, label: path.basename(filePath) });
}

main();
