"use strict";

const fs = require("fs");
const path = require("path");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function toNum(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtTimeFromMs(ms) {
  const n = toNum(ms);
  if (n == null || n < 0) return "";
  if (n < 1000) return "<1s";
  const s = Math.round((n / 1000) * 100) / 100;
  // Always show exact seconds when >= 1s.
  return `${s.toFixed(2)}s`;
}

function fmtEur(n, suffix) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "";
  const rounded = Math.round(v * 100) / 100;
  const asInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  const num = asInt ? String(Math.round(rounded)) : rounded.toFixed(2);
  return `${num} ${suffix}`;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === "object" ? parsed : null;
}

function normSellerKey(seller) {
  const s = typeof seller === "string" ? seller.trim().toLowerCase() : "";
  if (!s) return "";
  const base = s.replace(/\s+/g, " ");

  // Collapse common Amazon variants seen in Shopping API results.
  // Examples: "Amazon.nl - Seller", "Amazon.nl - Retail", "Amazon.NLS", "Amazon.NLR"
  if (base === "amazon.nls" || base === "amazon.nlr") return "amazon.nl";
  if (base.startsWith("amazon.nl")) return "amazon.nl";
  if (base.startsWith("amazon.")) return "amazon";

  // Generic cleanup: remove trailing qualifiers like " - seller" / " - retail".
  return base
    .replace(/\s*-\s*(seller|retail)\b.*$/i, "")
    .trim();
}

function pickTop3(preview) {
  const list = Array.isArray(preview) ? preview : [];
  const normalized = list
    .filter((o) => o && typeof o === "object")
    .map((o) => {
      return {
        seller: typeof o.seller === "string" ? o.seller : "",
        price: toNum(o.price),
        url: typeof o.url === "string" ? o.url : "",
        _sellerKey: normSellerKey(o && o.seller),
      };
    })
    .filter((o) => o.seller || o.price != null);

  // Dedupe by seller: keep the lowest-priced offer per seller.
  // `preview` is usually already sorted by price; we still implement explicit safety.
  const bySeller = new Map();
  for (const o of normalized) {
    const key = o._sellerKey || "";
    // If seller is missing, treat as unique by keeping it as-is.
    if (!key) {
      bySeller.set(`__noseller_${bySeller.size}`, o);
      continue;
    }
    const existing = bySeller.get(key);
    if (!existing) {
      bySeller.set(key, o);
      continue;
    }
    const ep = existing.price == null ? Number.POSITIVE_INFINITY : existing.price;
    const np = o.price == null ? Number.POSITIVE_INFINITY : o.price;
    if (np < ep) bySeller.set(key, o);
  }

  const deduped = Array.from(bySeller.values())
    .map((o) => ({ seller: o.seller, price: o.price, url: o.url }))
    .sort((a, b) => {
      const ap = a.price == null ? Number.POSITIVE_INFINITY : a.price;
      const bp = b.price == null ? Number.POSITIVE_INFINITY : b.price;
      return ap - bp;
    });

  while (deduped.length < 3) deduped.push({ seller: "", price: null });
  return deduped.slice(0, 3);
}

function render({ payload, priceSuffix }) {
  const results = Array.isArray(payload && payload.results) ? payload.results : [];
  const summary = (payload && payload.summary && typeof payload.summary === "object") ? payload.summary : {};

  const clientStore = String(process.env.CLIENT_STORE || "").trim() || "client";
  const providerLabel = String(summary.provider || "").trim() || "";

  const autoRefreshSeconds = (() => {
    const raw = String(process.env.AUTO_REFRESH_SECONDS || "").trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    if (n <= 0) return null;
    return Math.max(1, Math.min(Math.floor(n), 3600));
  })();

  const metricsRows = [
    ["provider", summary.provider || ""],
    ["useMockFallback", summary.useMockFallback || ""],
    ["cacheBypass", summary.cacheBypass || ""],
    ["queries_total", summary.n ?? results.length],
    ["queries_ok", summary.okQueries ?? ""],
    ["queries_with_offers", summary.withOffers ?? ""],
    ["server_returns_total", summary.totalOffers ?? results.reduce((s, r) => s + Number((r && r.offersCount) || 0), 0)],
    ["retail_only", "true"],
    ["blocked_offers_total", summary.blockedOffersTotal ?? ""],
    ["raw_offers_total", summary.rawOffersTotal ?? ""],
    ["total_offers", summary.totalOffers ?? ""],
    ["avg_offers", summary.avgOffers != null ? Math.round(Number(summary.avgOffers) * 1000) / 1000 : ""],
    ["avg_duration", summary.avgDurationMs != null ? fmtTimeFromMs(Number(summary.avgDurationMs)) : ""],
  ];

  const metricsTrs = metricsRows
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td class="num">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");

  function offerCell(o, kind) {
    if (!o || (!o.seller && o.price == null)) return `<td class="${kind}"></td>`;
    const seller = o.seller ? String(o.seller) : "";
    const price = o.price != null ? fmtEur(o.price, priceSuffix) : "";
    const url = o.url ? String(o.url) : "";
    const dataUrl = url ? ` data-url="${escapeHtml(url)}"` : "";
    return `<td class="${kind}"${dataUrl}>${escapeHtml([seller, price].filter(Boolean).join(" "))}</td>`;
  }

  const rows = results
    .map((r) => {
      const q = r && typeof r.query === "string" ? r.query : "";
      const offersCount = toNum(r && r.offersCount) ?? 0;
      const rawCount = toNum(r && r.rawOffersCount) ?? null;
      const blockedCount = toNum(r && r.blockedOffersCount) ?? null;
      const duration = toNum(r && r.durationMs);
      const err = r && typeof r.error === "string" ? r.error : "";
      const status = r && typeof r.status === "string" ? r.status : "";
      const top3 = pickTop3(r && r.preview);

      const source = (() => {
        const p0 = top3 && top3[0] && typeof top3[0] === "object" ? top3[0] : null;
        const src = p0 && typeof p0._source === "string" ? p0._source : "";
        return src || clientStore || providerLabel;
      })();

      return `<tr>
        <td>${escapeHtml(source)}</td>
        <td>${escapeHtml(q)}</td>
        <td class="num base">${escapeHtml(String(offersCount))}</td>
        <td class="num">${escapeHtml(rawCount == null ? "" : String(rawCount))}</td>
        <td class="num">${escapeHtml(blockedCount == null ? "" : String(blockedCount))}</td>
        ${offerCell(top3[0], "good")}
        ${offerCell(top3[1], "warn")}
        ${offerCell(top3[2], "bad")}
        <td class="num">${escapeHtml(fmtTimeFromMs(duration))}</td>
        <td>${escapeHtml([status, err].filter(Boolean).join(" · "))}</td>
      </tr>`;
    })
    .join("");

  const title = "Dealsense Test Report (Shopping API)";
  const view = "simple";
  const setName = "random10";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${autoRefreshSeconds ? `<meta http-equiv="refresh" content="${autoRefreshSeconds}">` : ""}
    <title>${escapeHtml(title)}</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { max-width: 980px; margin: 0 auto; padding: 6px; }
      .meta { color: var(--muted); font-size: 11px; margin-bottom: 8px; }
      .toolbar { display: flex; gap: 6px; align-items: center; margin: 6px 0 8px; }
      .btn { border: 1px solid var(--grid); background: #fff; color: var(--text); font-size: 11px; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
      .btn:active { transform: translateY(1px); }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead th { background: var(--head); font-size: 10px; font-weight: 600; color: var(--text); padding: 4px 5px; border: 1px solid var(--grid); text-align: left; }
      tbody td { font-size: 10px; padding: 2px 5px; border: 1px solid var(--grid); vertical-align: middle; }
      th { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      td { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
      td.base { padding-left: 4px; padding-right: 4px; }
      td.good { background: rgba(34,197,94,.12); color: #166534; }
      td.warn { background: rgba(245,158,11,.14); color: #92400e; }
      td.bad { background: rgba(239,68,68,.12); color: #991b1b; }
      td[data-url] { cursor: pointer; }
      tr.selected td { outline: 2px solid rgba(59,130,246,.55); outline-offset: -2px; }
      .spacer { height: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="meta">${escapeHtml(title)} · view=${escapeHtml(view)} · set=${escapeHtml(setName)} · client_store=${escapeHtml(clientStore)} · price_suffix=${escapeHtml(priceSuffix)}</div>

      <div class="toolbar">
        <button class="btn" id="btnRefresh" type="button">Refresh</button>
        <button class="btn" id="btnReset" type="button">Reset view</button>
        <div class="meta" style="margin:0;">auto_refresh=${escapeHtml(String(autoRefreshSeconds ?? "off"))}</div>
      </div>

      <table id="metricsTable">
        <thead>
          <tr>
            <th style="width: 70%">metric</th>
            <th class="num" style="width: 30%">value</th>
          </tr>
        </thead>
        <tbody>
          ${metricsTrs}
        </tbody>
      </table>

      <div class="spacer"></div>

      <table id="productsTable">
        <thead>
          <tr>
            <th style="width: 14%">source</th>
            <th style="width: 26%">query</th>
            <th class="num" style="width: 7%">retail</th>
            <th class="num" style="width: 7%">raw</th>
            <th class="num" style="width: 7%">blocked</th>
            <th style="width: 15%">1 (recommended)</th>
            <th style="width: 15%">2</th>
            <th style="width: 15%">3</th>
            <th class="num" style="width: 8%">time</th>
            <th style="width: 20%">error</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <script>
      (function () {
        const NS = "dealsense.shopping.random10";
        const table = document.getElementById("productsTable");
        if (!table) return;
        const tbody = table.querySelector("tbody");
        if (!tbody) return;

        const btnRefresh = document.getElementById("btnRefresh");
        const btnReset = document.getElementById("btnReset");

        function reloadNoCache() {
          try {
            const u = new URL(window.location.href);
            u.searchParams.set("v", String(Date.now()));
            window.location.replace(u.toString());
          } catch (_) {
            try { location.reload(); } catch (_) {}
          }
        }
 
        if (btnRefresh) {
          btnRefresh.addEventListener("click", function () {
            reloadNoCache();
          });
        }
 
        if (btnReset) {
          btnReset.addEventListener("click", function () {
            try {
              localStorage.removeItem(NS + ":selectedRow");
              localStorage.removeItem(NS + ":scrollY");
              localStorage.removeItem(NS + ":lastUrl");
            } catch (_) {}
            reloadNoCache();
          });
        }

        function key(suffix) { return NS + ":" + suffix; }

        function markSelectedRow(tr) {
          const rows = tbody.querySelectorAll("tr");
          for (const r of rows) r.classList.remove("selected");
          if (tr) tr.classList.add("selected");
        }

        function selectByIndex(idx) {
          const rows = tbody.querySelectorAll("tr");
          const i = Number(idx);
          if (!Number.isFinite(i) || i < 0 || i >= rows.length) return;
          markSelectedRow(rows[i]);
        }

        try {
          const savedIdx = localStorage.getItem(key("selectedRow"));
          if (savedIdx != null) selectByIndex(savedIdx);
        } catch (_) {}

        try {
          const savedScroll = localStorage.getItem(key("scrollY"));
          const y = savedScroll != null ? Number(savedScroll) : NaN;
          if (Number.isFinite(y) && y >= 0) window.scrollTo(0, y);
        } catch (_) {}

        tbody.addEventListener("click", function (ev) {
          const td = ev.target && ev.target.closest ? ev.target.closest("td") : null;
          const tr = td ? td.parentElement : null;
          if (!tr || tr.tagName !== "TR") return;
          const rows = Array.from(tbody.querySelectorAll("tr"));
          const idx = rows.indexOf(tr);
          if (idx >= 0) {
            markSelectedRow(tr);
            try { localStorage.setItem(key("selectedRow"), String(idx)); } catch (_) {}
          }
        });

        tbody.addEventListener("dblclick", function (ev) {
          const td = ev.target && ev.target.closest ? ev.target.closest("td") : null;
          if (!td) return;
          const url = td.getAttribute("data-url");
          if (!url) return;
          try { localStorage.setItem(key("lastUrl"), url); } catch (_) {}
          window.open(url, "_blank", "noopener,noreferrer");
        });

        window.addEventListener("beforeunload", function () {
          try { localStorage.setItem(key("scrollY"), String(window.scrollY || 0)); } catch (_) {}
        });
      })();
    </script>
  </body>
</html>`;
}

function main() {
  const inputPath = path.join(__dirname, "test-shopping-random-10.output.json");
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input JSON not found: ${inputPath}. Run npm run test:shopping:random10 first.`);
  }

  const payload = readJson(inputPath);
  const priceSuffix = String(process.env.TEST_PRICE_SUFFIX || "€");

  const html = render({ payload, priceSuffix });

  const outTools = path.join(__dirname, "test-shopping-random-10.simple.html");
  fs.writeFileSync(outTools, html, "utf8");

  const outPublic = path.join(__dirname, "..", "public", "test-shopping-random-10.simple.html");
  try {
    fs.writeFileSync(outPublic, html, "utf8");
  } catch (_) {
    // ignore
  }

  console.log(outTools);
  console.log(outPublic);
}

main();
