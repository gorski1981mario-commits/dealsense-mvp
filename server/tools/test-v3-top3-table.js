const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const fs = require("fs");

const { fetchMarketOffers } = require("../market-api");
const { analyzeOffersV3Strict } = require("../pricing/v3-engine");
const { computeTitleMatchScore } = require("../scoring/match");

function allowLive() {
  const v = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return v === "1" || v === "true";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pctColorClass(pct) {
  if (typeof pct !== "number" || !Number.isFinite(pct)) return "muted";
  if (pct >= 25) return "good";
  if (pct >= 10) return "warn";
  return "bad";
}

function returnedColorClass(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  if (v >= 3) return "good";
  if (v >= 1) return "warn";
  return "bad";
}

function fmtOfferCell({ seller, price, basePrice }) {
  const p = typeof price === "number" && Number.isFinite(price) ? price : null;
  const pct = pctDiff(basePrice, p);
  const cls = pctColorClass(pct);
  const sellerTxt = seller ? String(seller) : "";
  const priceTxt = p == null ? "" : String(fmt(p));
  const pctTxt = pct == null ? "" : `${pct}%`;
  const main = [sellerTxt, priceTxt].filter(Boolean).join(" ");
  return {
    html: `<div class="offer"><div class="offer-main">${escapeHtml(main)}</div><div class="pill ${cls}">${escapeHtml(pctTxt)}</div></div>`,
  };
}

function renderHtmlSimpleTwoTables({ title, setName, metricsRows, rows, view }) {
  const metricsTrs = metricsRows
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td class="num">${escapeHtml(toCell(v))}</td></tr>`)
    .join("");

  const maxWidth = String(process.env.TEST_REPORT_MAX_WIDTH || "760px");
  const priceSuffix = String(process.env.TEST_PRICE_SUFFIX || "€");
  const priceText = (n) => {
    if (n == null || n === "") return "";
    return `${toCell(n)} ${priceSuffix}`;
  };

  const productTrs = rows
    .map((r) => {
      const baseStoreRaw = r.base_store || r.base_price_source || "";
      const baseStore =
        typeof baseStoreRaw === "string" && ["user", "użytkownik", "uzytkownik"].includes(baseStoreRaw.trim().toLowerCase())
          ? ""
          : baseStoreRaw;
      const baseCell = [baseStore, priceText(r.base_price)].filter(Boolean).join(" ");
      const p1 = [r.s1 || "", priceText(r.p1)].filter(Boolean).join(" ");
      const p2 = [r.s2 || "", priceText(r.p2)].filter(Boolean).join(" ");
      const p3 = [r.s3 || "", priceText(r.p3)].filter(Boolean).join(" ");

      return `<tr>
        <td>${escapeHtml(r.product)}</td>
        <td class="num base">${escapeHtml(baseCell)}</td>
        <td class="good">${escapeHtml(p1)}</td>
        <td class="warn">${escapeHtml(p2)}</td>
        <td class="bad">${escapeHtml(p3)}</td>
        <td class="num ret">${escapeHtml(toCell(r.returned))}</td>
        <td class="num">${escapeHtml(toCell(r["%_diff"]))}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { max-width: ${escapeHtml(maxWidth)}; margin: 0 auto; padding: 6px; }
      .meta { color: var(--muted); font-size: 11px; margin-bottom: 8px; }
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
      td.ret { background: rgba(239,68,68,.08); color: #991b1b; font-weight: 600; }
      th.resizable { position: relative; }
      th.resizable .resizer { position: absolute; top: 0; right: 0; width: 10px; height: 100%; cursor: col-resize; user-select: none; z-index: 5; touch-action: none; pointer-events: auto; }
      th.resizable .resizer::after { content: ""; position: absolute; top: 15%; bottom: 15%; right: 2px; width: 2px; background: rgba(107,114,128,.55); border-radius: 1px; }
      th.resizable .resizer:hover { background: rgba(107,114,128,.12); }
      .spacer { height: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="meta">${escapeHtml(title)} · view=${escapeHtml(view)} · set=${escapeHtml(setName || "")}</div>

      <table id="metricsTable">
        <thead>
          <tr>
            <th class="resizable" style="width: 70%">metric<div class="resizer" data-col="0"></div></th>
            <th class="num resizable" style="width: 30%">value<div class="resizer" data-col="1"></div></th>
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
            <th class="resizable" style="width: 34%">product<div class="resizer" data-col="0"></div></th>
            <th class="num resizable" style="width: 11%">base<div class="resizer" data-col="1"></div></th>
            <th class="resizable" style="width: 15%">1 (best)<div class="resizer" data-col="2"></div></th>
            <th class="resizable" style="width: 15%">2 (mid)<div class="resizer" data-col="3"></div></th>
            <th class="resizable" style="width: 15%">3 (worst)<div class="resizer" data-col="4"></div></th>
            <th class="num resizable" style="width: 5%">ret<div class="resizer" data-col="5"></div></th>
            <th class="num" style="width: 5%">%_diff</th>
          </tr>
        </thead>
        <tbody>
          ${productTrs}
        </tbody>
      </table>

      <script>
        (function () {
          function initResize(tableId) {
            var table = document.getElementById(tableId);
            if (!table) return;
            var ths = table.querySelectorAll('thead th');
            var active = null;

            function setThWidthPx(th, px) {
              if (!th) return;
              var v = Math.max(60, px);
              th.style.width = v + 'px';
            }

            function onPointerMove(e) {
              if (!active) return;
              var dx = e.clientX - active.startX;
              setThWidthPx(active.th, active.startW + dx);
            }

            function onPointerUp() {
              if (!active) return;
              try {
                if (active.handle && active.pointerId != null) {
                  active.handle.releasePointerCapture(active.pointerId);
                }
              } catch (_) {}
              if (active.handle) {
                active.handle.removeEventListener('pointermove', onPointerMove);
                active.handle.removeEventListener('pointerup', onPointerUp);
                active.handle.removeEventListener('pointercancel', onPointerUp);
              }
              active = null;
            }

            table.querySelectorAll('.resizer').forEach(function (h) {
              h.addEventListener('pointerdown', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var col = Number(h.getAttribute('data-col'));
                var th = ths[col];
                if (!th) return;
                var rect = th.getBoundingClientRect();
                active = { th: th, startX: e.clientX, startW: rect.width, handle: h, pointerId: e.pointerId };
                try { h.setPointerCapture(e.pointerId); } catch (_) {}
                h.addEventListener('pointermove', onPointerMove);
                h.addEventListener('pointerup', onPointerUp);
                h.addEventListener('pointercancel', onPointerUp);
              });
            });
          }

          initResize('metricsTable');
          initResize('productsTable');
        })();
      </script>
    </div>
  </body>
</html>`;
}

function renderHtmlScreenshotReport({ title, setName, metricsRows, rows, view }) {
  const metricsTrs = metricsRows
    .map(([k, v]) => {
      return `<tr><td>${escapeHtml(k)}</td><td class="num">${escapeHtml(toCell(v))}</td></tr>`;
    })
    .join("");

  const productTrs = rows
    .map((r) => {
      const baseStore = r.base_store || r.base_price_source || "";
      const baseCell = [baseStore, toCell(r.base_price)].filter(Boolean).join(" ");
      const o1 = [r.s1 || "", toCell(r.p1)].filter(Boolean).join(" ");
      const o2 = [r.s2 || "", toCell(r.p2)].filter(Boolean).join(" ");
      const o3 = [r.s3 || "", toCell(r.p3)].filter(Boolean).join(" ");
      return `<tr>
        <td>${escapeHtml(r.product)}</td>
        <td>${escapeHtml(baseCell)}</td>
        <td>${escapeHtml(o1)}</td>
        <td>${escapeHtml(o2)}</td>
        <td>${escapeHtml(o3)}</td>
        <td class="num">${escapeHtml(toCell(r["%_diff"]))}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { --bg:#ffffff; --text:#111827; --muted:#6b7280; --grid:#d1d5db; --head:#f3f4f6; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { padding: 10px; }
      .meta { color: var(--muted); font-size: 12px; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; table-layout: auto; }
      thead th { background: var(--head); font-size: 12px; font-weight: 600; color: var(--text); padding: 6px 8px; border: 1px solid var(--grid); text-align: left; }
      tbody td { font-size: 12px; padding: 6px 8px; border: 1px solid var(--grid); vertical-align: middle; }
      th, td { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
      .spacer { height: 10px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="meta">${escapeHtml(title)} · view=${escapeHtml(view)} · set=${escapeHtml(setName || "")}</div>

      <table>
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

      <table>
        <thead>
          <tr>
            <th style="width: 34%">product</th>
            <th style="width: 22%">base (store price)</th>
            <th style="width: 18%">best (store price)</th>
            <th style="width: 18%">mid (store price)</th>
            <th style="width: 18%">worst (store price)</th>
            <th class="num" style="width: 8%">%_diff</th>
          </tr>
        </thead>
        <tbody>
          ${productTrs}
        </tbody>
      </table>
    </div>
  </body>
</html>`;
}

function renderHtmlClientReport({ title, setName, metricsRows, rows, view }) {
  const header = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { --bg:#ffffff; --card:#ffffff; --muted:#6b7280; --text:#111827; --grid:#d1d5db; --head:#f3f4f6;
        --good:#16a34a; --warn:#d97706; --bad:#dc2626; }
      * { box-sizing: border-box; }
      html, body { height: auto; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      .wrap { padding: 0; }
      .frame { background: var(--card); padding: 10px; display: block; overflow: visible; }
      .header { display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
      .header h1 { margin:0; font-size: 16px; letter-spacing: .2px; }
      .header .meta { color: var(--muted); font-size: 12px; white-space: nowrap; }
      .metrics { display:flex; flex-wrap:wrap; gap: 8px 14px; }
      .kv { display:flex; gap: 6px; align-items:baseline; }
      .kv .k { color: var(--muted); font-size: 12px; }
      .kv .v { font-variant-numeric: tabular-nums; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; table-layout: auto; }
      thead th { background: var(--head); color: #111827; font-weight: 600; font-size: 12px; padding: 6px 8px; border: 1px solid var(--grid); text-align: left; }
      tbody td { font-size: 12px; padding: 6px 8px; border: 1px solid var(--grid); vertical-align: middle; }
      th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
      td { overflow: visible; text-overflow: clip; white-space: normal; }
      .offer { display:flex; align-items:center; justify-content:space-between; gap: 8px; }
      .offer-main { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .pill { padding: 2px 6px; border-radius: 999px; font-size: 11px; border: 1px solid var(--grid); font-variant-numeric: tabular-nums; }
      .pill.good { color: var(--good); border-color: rgba(34,197,94,.35); }
      .pill.warn { color: var(--warn); border-color: rgba(245,158,11,.35); }
      .pill.bad { color: var(--bad); border-color: rgba(239,68,68,.35); }
      .pill.muted { color: var(--muted); }
      .note { color: var(--muted); font-size: 11px; }
      @media (max-width: 1050px) { body { overflow: auto; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="frame">
        <div class="header">
          <h1>${escapeHtml(title)}</h1>
          <div class="meta">view=${escapeHtml(view)} · set=${escapeHtml(setName || "")}</div>
        </div>`;

  const metricsHtml = `
        <div class="metrics">
          ${metricsRows
            .map(([k, v]) => `<div class="kv"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(toCell(v))}</div></div>`)
            .join("")}
        </div>`;

  const tableHead = `
        <table>
          <thead>
            <tr>
              <th style="width: 26%">product</th>
              <th class="num" style="width: 9%">base_price</th>
              <th style="width: 10%">base_store</th>
              <th style="width: 18%">best_offer</th>
              <th style="width: 18%">mid_offer</th>
              <th style="width: 18%">worst_offer</th>
              <th class="num" style="width: 6%">returned</th>
              <th class="num" style="width: 6%">time_s</th>
            </tr>
          </thead>
          <tbody>`;

  const body = rows
    .map((r) => {
      const base = r.base_price;
      const offers = [
        { seller: r.s1, price: r.p1 },
        { seller: r.s2, price: r.p2 },
        { seller: r.s3, price: r.p3 },
      ]
        .filter((o) => typeof o.price === "number" && Number.isFinite(o.price))
        .sort((a, b) => a.price - b.price);
      while (offers.length < 3) offers.push({ seller: "", price: null });
      const c1 = fmtOfferCell({ seller: offers[0].seller, price: offers[0].price, basePrice: base }).html;
      const c2 = fmtOfferCell({ seller: offers[1].seller, price: offers[1].price, basePrice: base }).html;
      const c3 = fmtOfferCell({ seller: offers[2].seller, price: offers[2].price, basePrice: base }).html;
      const retCls = returnedColorClass(r.returned);
      const retPill = `<span class="pill ${retCls}">${escapeHtml(toCell(r.returned))}</span>`;
      const t = typeof r.response_time_s === "number" && Number.isFinite(r.response_time_s) ? r.response_time_s : "";

      return `
            <tr>
              <td>${escapeHtml(r.product)}</td>
              <td class="num">${escapeHtml(toCell(r.base_price))}</td>
              <td>${escapeHtml(r.base_store || r.base_price_source || "")}</td>
              <td>${c1}</td>
              <td>${c2}</td>
              <td>${c3}</td>
              <td class="num">${retPill}</td>
              <td class="num">${escapeHtml(toCell(t))}</td>
            </tr>`;
    })
    .join("");

  const footer = `
          </tbody>
        </table>
        <div class="note">Kolory: zielony=duża różnica %, żółty=średnia, czerwony=mała. returned: zielony>=3, żółty 1-2, czerwony 0.</div>
      </div>
    </div>
  </body>
</html>`;

  return header + metricsHtml + tableHead + body + footer;
}

function drawBoxTableMax(headers, rows, maxWidths) {
  const max = Array.isArray(maxWidths) ? maxWidths : [];
  const trimmedRows = rows.map((r) => {
    return r.map((c, i) => {
      const limit = typeof max[i] === "number" ? max[i] : null;
      const cell = toCell(c);
      return limit ? truncateAnsi(cell, limit) : cell;
    });
  });

  const trimmedHeaders = headers.map((h, i) => {
    const limit = typeof max[i] === "number" ? max[i] : null;
    const cell = toCell(h);
    return limit ? truncateAnsi(cell, limit) : cell;
  });

  return drawBoxTable(trimmedHeaders, trimmedRows);
}

function offerKey(o) {
  if (!o || typeof o !== "object") return "";
  const seller = typeof o.seller === "string" ? o.seller.trim().toLowerCase() : "";
  const url = typeof o.url === "string" ? o.url.trim() : "";
  const price = typeof o.price === "number" && Number.isFinite(o.price) ? o.price.toFixed(2) : "";
  return `${seller}|${url}|${price}`;
}

function fmt(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function pctDiff(base, price1) {
  const b = typeof base === "number" ? base : Number(base);
  const p = typeof price1 === "number" ? price1 : Number(price1);
  if (!Number.isFinite(b) || b <= 0) return null;
  if (!Number.isFinite(p) || p <= 0) return null;
  return Math.round(((b - p) / b) * 10000) / 100;
}

function toCell(v) {
  if (v == null) return "";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return String(v);
}

function stripAnsi(s) {
  return String(s).replace(/\x1B\[[0-9;]*m/g, "");
}

function cellLen(s) {
  return stripAnsi(s).length;
}

function truncateAnsi(s, maxLen) {
  const str = String(s);
  const max = typeof maxLen === "number" && Number.isFinite(maxLen) ? Math.max(0, Math.floor(maxLen)) : 0;
  if (max <= 0) return "";
  const plain = stripAnsi(str);
  if (plain.length <= max) return str;
  const ell = max >= 2 ? "…" : "";
  const target = max - ell.length;
  let outPlain = "";
  let out = "";
  let i = 0;

  while (i < str.length && outPlain.length < target) {
    const ch = str[i];
    if (ch === "\x1b") {
      const m = str.slice(i).match(/^\x1B\[[0-9;]*m/);
      if (m) {
        out += m[0];
        i += m[0].length;
        continue;
      }
    }
    out += ch;
    outPlain += ch;
    i += 1;
  }

  return out + ell;
}

function padRight(s, w) {
  const str = String(s);
  const len = cellLen(str);
  if (len >= w) return str;
  return str + " ".repeat(w - len);
}

function drawBoxTable(headers, rows) {
  const cols = headers.length;
  const widths = headers.map((h) => cellLen(String(h)));
  for (const r of rows) {
    for (let i = 0; i < cols; i += 1) {
      widths[i] = Math.max(widths[i], cellLen(toCell(r[i])));
    }
  }

  const top = "┌" + widths.map((w) => "─".repeat(w + 2)).join("┬") + "┐";
  const mid = "├" + widths.map((w) => "─".repeat(w + 2)).join("┼") + "┤";
  const bot = "└" + widths.map((w) => "─".repeat(w + 2)).join("┴") + "┘";

  const headerLine =
    "│" +
    headers
      .map((h, i) => " " + padRight(String(h), widths[i]) + " ")
      .join("│") +
    "│";

  const bodyLines = rows.map((r) => {
    return (
      "│" +
      r
        .map((c, i) => " " + padRight(toCell(c), widths[i]) + " ")
        .join("│") +
      "│"
    );
  });

  const out = [top, headerLine, mid, ...bodyLines, bot];
  return out.join("\n");
}

function drawOuterBox(lines) {
  const list = Array.isArray(lines) ? lines.map((l) => String(l)) : [];
  const width = list.reduce((m, l) => Math.max(m, cellLen(l)), 0);
  const top = "┌" + "─".repeat(width + 2) + "┐";
  const bot = "└" + "─".repeat(width + 2) + "┘";
  const body = list.map((l) => "│ " + padRight(l, width) + " │");
  return [top, ...body, bot].join("\n");
}

function drawRowBox(headers, rows, widths) {
  const ws = Array.isArray(widths) && widths.length === headers.length
    ? widths.map((w) => Math.max(1, Math.floor(w)))
    : headers.map((h) => Math.max(1, cellLen(h)));

  const top = "┌" + ws.map((w) => "─".repeat(w + 2)).join("┬") + "┐";
  const mid = "├" + ws.map((w) => "─".repeat(w + 2)).join("┼") + "┤";
  const bot = "└" + ws.map((w) => "─".repeat(w + 2)).join("┴") + "┘";

  const head =
    "│" +
    headers
      .map((h, i) => " " + padRight(truncateAnsi(String(h), ws[i]), ws[i]) + " ")
      .join("│") +
    "│";

  const body = rows.map((r) => {
    return (
      "│" +
      r
        .map((c, i) => " " + padRight(truncateAnsi(toCell(c), ws[i]), ws[i]) + " ")
        .join("│") +
      "│"
    );
  });

  return [top, head, mid, ...body, bot].join("\n");
}

function drawMarkdownTable(headers, rows, alignRightCols) {
  const cols = headers.length;
  const right = new Set(Array.isArray(alignRightCols) ? alignRightCols : []);
  const widths = headers.map((h) => cellLen(String(h)));
  for (const r of rows) {
    for (let i = 0; i < cols; i += 1) {
      widths[i] = Math.max(widths[i], cellLen(toCell(r[i])));
    }
  }

  const headerLine =
    "| " +
    headers
      .map((h, i) => {
        const s = String(h);
        return right.has(i) ? padRight(s, widths[i]) : padRight(s, widths[i]);
      })
      .join(" | ") +
    " |";

  const sepLine =
    "| " +
    headers
      .map((_, i) => {
        const dashes = "-".repeat(Math.max(3, widths[i]));
        return right.has(i) ? dashes + ":" : dashes;
      })
      .join(" | ") +
    " |";

  const bodyLines = rows.map((r) => {
    return (
      "| " +
      r
        .map((c, i) => {
          const s = toCell(c);
          const w = widths[i];
          if (right.has(i)) {
            const len = cellLen(s);
            return (len >= w ? s : " ".repeat(w - len) + s);
          }
          return padRight(s, w);
        })
        .join(" | ") +
      " |"
    );
  });

  return [headerLine, sepLine, ...bodyLines].join("\n");
}

function drawPlainTextMetrics(pairs) {
  const list = Array.isArray(pairs) ? pairs : [];
  return list.map(([k, v]) => `${String(k)}: ${toCell(v)}`).join("\n");
}

function drawPlainTextTsv(headers, rows) {
  const hs = (Array.isArray(headers) ? headers : []).map((h) => String(h));
  const rs = Array.isArray(rows) ? rows : [];
  const lines = [hs.join("\t")];
  for (const r of rs) {
    const row = Array.isArray(r) ? r : [];
    const cells = hs.map((_, i) => toCell(row[i]));
    lines.push(cells.join("\t"));
  }
  return lines.join("\n");
}

function drawPlainTextFixedTable(headers, rows, widths) {
  const hs = (Array.isArray(headers) ? headers : []).map((h) => String(h));
  const rs = Array.isArray(rows) ? rows : [];
  const ws = Array.isArray(widths) && widths.length === hs.length
    ? widths.map((w) => Math.max(4, Math.floor(w)))
    : hs.map((h) => Math.max(8, Math.min(32, String(h).length + 2)));

  const trunc = (s, w) => {
    const str = String(s ?? "");
    if (str.length <= w) return str;
    if (w <= 1) return str.slice(0, w);
    return str.slice(0, w - 1) + "…";
  };

  const pad = (s, w) => {
    const str = String(s ?? "");
    return str.length >= w ? str : str + " ".repeat(w - str.length);
  };

  const line = (cells) => {
    return cells
      .map((c, i) => pad(trunc(c, ws[i]), ws[i]))
      .join("  ")
      .trimEnd();
  };

  const out = [];
  out.push(line(hs));
  for (const r of rs) {
    const row = Array.isArray(r) ? r : [];
    const cells = hs.map((_, i) => toCell(row[i]));
    out.push(line(cells));
  }
  return out.join("\n");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtmlTable({ title, headers, rows, rightAlignIdx }) {
  const right = new Set(Array.isArray(rightAlignIdx) ? rightAlignIdx : []);
  const th = headers
    .map((h, i) => `<th class="${right.has(i) ? "num" : ""}">${escapeHtml(h)}</th>`)
    .join("");
  const trs = rows
    .map((r) => {
      const tds = headers
        .map((_, i) => {
          const v = r[i];
          return `<td class="${right.has(i) ? "num" : ""}">${escapeHtml(toCell(v))}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");

  return `
  <section class="card">
    <div class="card-title">${escapeHtml(title)}</div>
    <table>
      <thead><tr>${th}</tr></thead>
      <tbody>${trs}</tbody>
    </table>
  </section>`;
}

function drawMarkdownTableCompact(headers, rows, alignRightCols) {
  const cols = headers.length;
  const right = new Set(Array.isArray(alignRightCols) ? alignRightCols : []);
  const headerLine = "| " + headers.map((h) => String(h)).join(" | ") + " |";
  const sepLine =
    "| " +
    headers
      .map((_, i) => {
        const dashes = "---";
        return right.has(i) ? dashes + ":" : dashes;
      })
      .join(" | ") +
    " |";

  const bodyLines = (Array.isArray(rows) ? rows : []).map((r) => {
    const cells = [];
    for (let i = 0; i < cols; i += 1) {
      cells.push(toCell(r[i]));
    }
    return "| " + cells.join(" | ") + " |";
  });

  return [headerLine, sepLine, ...bodyLines].join("\n");
}

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function colorIf(enabled, color, text) {
  if (!enabled) return String(text);
  return `${color}${text}${ANSI.reset}`;
}

function formatOffer(o) {
  if (!o) return "";
  const seller = typeof o.seller === "string" ? o.seller : "";
  const price = typeof o.price === "number" && Number.isFinite(o.price) ? fmt(o.price) : null;
  if (!seller && price == null) return "";
  if (!seller) return String(price);
  if (price == null) return seller;
  return `${seller} ${price}`;
}

function loadSeenSet(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string" && x.length > 0));
  } catch {
    return new Set();
  }
}

function saveSeenSet(filePath, set) {
  try {
    const arr = Array.from(set);
    // Keep the file bounded so it doesn't grow forever.
    const tail = arr.length > 5000 ? arr.slice(arr.length - 5000) : arr;
    fs.writeFileSync(filePath, JSON.stringify(tail, null, 2) + "\n");
  } catch {
    // ignore
  }
}

function loadRunCounter(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const n = Number(JSON.parse(raw));
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function saveRunCounter(filePath, n) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(Math.max(0, Math.floor(n))) + "\n");
  } catch {
    // ignore
  }
}

async function fetchAndSelect({ query, basePrice, seenOfferKeys }) {
  const offers = await fetchMarketOffers(query, null);
  const rawCount = Array.isArray(offers) ? offers.length : 0;

  const analysis = analyzeOffersV3Strict(offers, Number(basePrice), query);
  const display = analysis && Array.isArray(analysis.displayOffers) ? analysis.displayOffers : [];
  const meta = analysis && analysis.meta ? analysis.meta : null;

  const strictEnabled = String(process.env.TEST_STRICT_MATCH || "0").trim() === "1";
  const strictMinScore = Number(process.env.TEST_STRICT_MATCH_MIN_SCORE ?? 0.75);
  const strictMustTokensEnabled = String(process.env.TEST_STRICT_MUST_TOKENS || "1").trim() !== "0";
  const strictMinMustMatches = Number(process.env.TEST_STRICT_MIN_MUST_MATCHES ?? 2);

  const tokenize = (s) => {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, " ")
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const STOP = new Set([
    "nl",
    "nederland",
    "netherlands",
    "nieuw",
    "new",
    "original",
    "origineel",
    "model",
    "edition",
    "series",
    "versie",
    "version",
    "gen",
    "gb",
    "tb",
    "inch",
    "cm",
    "mm",
    "met",
    "zonder",
    "and",
    "or",
    "the",
    "for",
    "with",
  ]);

  const extractMustTokens = (q) => {
    const toks = tokenize(q);
    // Prefer tokens that look like a model code (contain digits), then longer text tokens.
    const model = toks.filter((t) => /\d/.test(t)).filter((t) => !STOP.has(t));
    const words = toks
      .filter((t) => t.length >= 3)
      .filter((t) => !STOP.has(t))
      .filter((t) => !/\d/.test(t));

    // Keep list short and stable.
    const out = [];
    for (const t of model) {
      if (!out.includes(t)) out.push(t);
      if (out.length >= 4) break;
    }
    for (const t of words) {
      if (!out.includes(t)) out.push(t);
      if (out.length >= 6) break;
    }
    return out;
  };

  const looksLikeNonIdentical = (t) => {
    const s = String(t || "").toLowerCase();
    if (!s) return false;

    // Parts / accessories / replacement
    const badPartsRe = [
      /\bonderdeel\b/i,
      /\bonderdelen\b/i,
      /\bspare\b/i,
      /\bparts\b/i,
      /\breplacement\b/i,
      /\baccessoire\b/i,
      /\baccessoires\b/i,
      /\badapter\b/i,
      /\bopzetstuk\b/i,
      /\bnozzle\b/i,
      /\bbrush\b/i,
      /\bborstel\b/i,
      /\bfilter\b/i,
      /\bbatterij\b/i,
      /\bbattery\b/i,
      /\bcharger\b/i,
      /\bcharging\b/i,
      /\blader\b/i,
      /\bhoses\b/i,
      /\bslang\b/i,
      /\bbasket\b/i,
      /\bmand\b/i,
      /\brooster\b/i,
      /\bgrill\b/i,
      /\btray\b/i,
      /\bbak\b/i,
      /\baccessory\b/i,
    ];

    // Avoid false positives like "headset" containing "set".
    const hasLooseSetWord = /\bset\b/i.test(s) && !/\bheadset\b/i.test(s);
    if (hasLooseSetWord) return true;

    if (badPartsRe.some((re) => re.test(s))) return true;

    // Used / refurb / outlet
    const badCondRe = [
      /\brefurb\b/i,
      /\brefurbished\b/i,
      /\brenewed\b/i,
      /\bused\b/i,
      /\btweedehands\b/i,
      /\b2e\s*hands\b/i,
      /\bsecond\s*hand\b/i,
      /\boutlet\b/i,
      /\bopen\s*box\b/i,
      /\bex-?demo\b/i,
      /\bdemo\b/i,
    ];
    if (badCondRe.some((re) => re.test(s))) return true;

    return false;
  };

  const mustTokens = strictEnabled && strictMustTokensEnabled ? extractMustTokens(query) : [];

  // Avoid repeating the exact same offers across runs.
  const unseen = [];
  const seenFill = [];
  for (const o of display) {
    if (strictEnabled) {
      const title = (o && o.title) || "";
      if (looksLikeNonIdentical(title)) continue;
      const score = computeTitleMatchScore(query, title);
      if (Number.isFinite(strictMinScore) && Number.isFinite(score) && score < strictMinScore) continue;

      if (mustTokens.length > 0) {
        const tToks = new Set(tokenize(title));
        const matches = mustTokens.reduce((n, tok) => (tToks.has(tok) ? n + 1 : n), 0);
        if (Number.isFinite(strictMinMustMatches) && matches < strictMinMustMatches) continue;
      }
    }
    const k = offerKey(o);
    if (!k) continue;
    if (seenOfferKeys && seenOfferKeys.has(k)) {
      seenFill.push(o);
      continue;
    }
    unseen.push(o);
  }

  const finalOffers = unseen.slice(0, 3);
  if (finalOffers.length < 3) {
    for (const o of seenFill) {
      if (finalOffers.length >= 3) break;
      finalOffers.push(o);
    }
  }

  if (finalOffers.length === 0) {
    for (const o of display.slice(0, 3)) finalOffers.push(o);
  }
  for (const o of finalOffers) {
    const k = offerKey(o);
    if (k) seenOfferKeys.add(k);
  }

  return {
    rawCount,
    returned: finalOffers.length,
    offers: finalOffers,
    pass: meta ? meta.usedPass : null,
  };
}

async function runOneProduct({ label, basePrice, queries, attempts, retryDelayMs, seenOfferKeys, startIndex }) {
  let last = null;
  let usedQuery = null;
  let tries = 0;

  const start = Number.isFinite(Number(startIndex)) ? Math.max(0, Math.floor(Number(startIndex))) : 0;
  const ordered = [];
  for (let i = 0; i < queries.length; i += 1) {
    ordered.push(queries[(start + i) % queries.length]);
  }

  for (const q of ordered) {
    usedQuery = q;
    for (let i = 0; i < attempts; i += 1) {
      tries += 1;
      try {
        const t0 = Date.now();
        const r = await fetchAndSelect({ query: q, basePrice, seenOfferKeys });
        const t1 = Date.now();
        last = r;
        last.responseTimeMs = Math.max(0, t1 - t0);
        if (r.rawCount > 0 && r.returned >= 3) {
          return { ok: true, usedQuery, tries, ...r };
        }
      } catch (e) {
        last = {
          rawCount: 0,
          returned: 0,
          offers: [],
          pass: null,
          responseTimeMs: null,
          error: (e && e.message) || String(e),
        };
      }

      if (retryDelayMs > 0) await sleep(retryDelayMs);
    }
  }

  return {
    ok: false,
    usedQuery,
    tries,
    rawCount: last ? last.rawCount : 0,
    returned: last ? last.returned : 0,
    offers: last ? last.offers : [],
    pass: last ? last.pass : null,
    responseTimeMs: last && typeof last.responseTimeMs === "number" ? last.responseTimeMs : null,
    error: last && last.error ? last.error : null,
  };
}

async function main() {
  if (!allowLive()) {
    console.error("[test-v3-top3-table] blocked: set DEALSENSE_ALLOW_LIVE=1 to run LIVE tests.");
    process.exitCode = 2;
    return;
  }

  // Test mode: keep provider stable, but allow cache (do not bypass)
  process.env.MARKET_PROVIDER = "searchapi";
  process.env.MARKET_LOG_SILENT = "1";
  const bypassCache = String(process.env.TEST_BYPASS_CACHE || "").trim() === "1";
  if (bypassCache) process.env.MARKET_CACHE_BYPASS = "1";
  else delete process.env.MARKET_CACHE_BYPASS;

  function makeSeededRng(seed) {
    let s = Number.isFinite(Number(seed)) ? Math.floor(Number(seed)) : 0;
    if (s < 0) s = -s;
    return function rand() {
      // LCG (deterministic, fast)
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  function shuffleWithRng(arr, rng) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function buildRandomMixSet(productSets, seed) {
    const rng = makeSeededRng(seed);
    const keys = Object.keys(productSets || {})
      .filter((k) => k && typeof k === "string")
      .filter((k) => !["v1", "bench10", "bench10b", "randommix"].includes(k));
    const orderedKeys = keys.length > 0 ? shuffleWithRng(keys, rng) : [];

    const items = [];
    for (const k of orderedKeys) {
      const list = Array.isArray(productSets[k]) ? productSets[k] : [];
      for (const it of list) {
        if (!it || typeof it !== "object") continue;
        if (!it.label || !Array.isArray(it.queries) || it.queries.length === 0) continue;
        items.push({ ...it, _set: k });
      }
    }

    const uniq = new Map();
    for (const it of items) {
      const key = String(it.label).trim().toLowerCase();
      if (!key) continue;
      if (!uniq.has(key)) uniq.set(key, it);
    }

    const pool = shuffleWithRng(Array.from(uniq.values()), rng);
    const out = pool.slice(0, 10);
    // Fallback: if pool is too small, fill from v1.
    const fallback = Array.isArray(productSets.v1) ? productSets.v1 : [];
    let i = 0;
    while (out.length < 10 && i < fallback.length) {
      const it = fallback[i];
      i += 1;
      if (!it || typeof it !== "object") continue;
      if (!it.label || !Array.isArray(it.queries) || it.queries.length === 0) continue;
      out.push(it);
    }
    return out;
  }

  const attempts = Math.max(1, Math.min(Number(process.env.TEST_ATTEMPTS) || 2, 5));
  const retryDelayMs = Math.max(0, Math.min(Number(process.env.TEST_RETRY_DELAY_MS) || 800, 5000));

  const productSets = {
    v1: [
      {
        label: "Apple iPhone 13 128GB",
        basePrice: 449,
        queries: [
          "Apple iPhone 13 128GB",
          "Apple iPhone 13 128GB nieuw",
          "Apple iPhone 13 128GB Nederland",
        ],
      },
      {
        label: "Sony WH-1000XM5",
        basePrice: 299,
        queries: [
          "Sony WH-1000XM5",
          "Sony WH-1000XM5 koptelefoon",
          "Sony WH-1000XM5 noise cancelling",
        ],
      },
      {
        label: "Samsung QE55 4K TV",
        basePrice: 799,
        queries: [
          "Samsung QE55 4K TV",
          "Samsung QE55 QLED",
          "Samsung QE55 55 inch",
        ],
      },
      {
        label: "Nike Air Max 90",
        basePrice: 149,
        queries: [
          "Nike Air Max 90",
          "Nike Air Max 90 heren",
          "Nike Air Max 90 Nederland",
        ],
      },
    ],
    electronics: [
      {
        label: "Apple iPhone 13 128GB",
        basePrice: 449,
        queries: ["Apple iPhone 13 128GB", "Apple iPhone 13 128GB nieuw", "Apple iPhone 13 128GB Nederland"],
      },
      {
        label: "Sony WH-1000XM5",
        basePrice: 299,
        queries: ["Sony WH-1000XM5", "Sony WH-1000XM5 koptelefoon", "Sony WH-1000XM5 noise cancelling"],
      },
      {
        label: "Nintendo Switch OLED",
        basePrice: 349,
        queries: ["Nintendo Switch OLED", "Nintendo Switch OLED model", "Nintendo Switch OLED Nederland"],
      },
      {
        label: "Samsung Galaxy Tab S9",
        basePrice: 899,
        queries: ["Samsung Galaxy Tab S9", "Samsung Tab S9 128GB", "Samsung Galaxy Tab S9 Nederland"],
      },
      {
        label: "MacBook Air M2 256GB",
        basePrice: 1099,
        queries: ["MacBook Air M2 256GB", "Apple MacBook Air M2 256GB", "MacBook Air M2 13 inch"],
      },
      {
        label: "Philips Airfryer XXL",
        basePrice: 249,
        queries: ["Philips Airfryer XXL", "Philips Airfryer XXL HD9650", "Philips Airfryer XXL Nederland"],
      },
    ],
    diy: [
      {
        label: "Bosch Hammer Drill SDS Plus",
        basePrice: 129,
        queries: ["Bosch boorhamer SDS plus", "Bosch hammer drill SDS plus", "Bosch SDS Plus boorhamer"],
      },
      {
        label: "Makita Accu Boormachine 18V",
        basePrice: 149,
        queries: ["Makita accu boormachine 18V", "Makita boor schroefmachine 18V", "Makita 18V drill"],
      },
      {
        label: "DeWalt Slagschroevendraaier",
        basePrice: 159,
        queries: ["DeWalt slagschroevendraaier", "DeWalt impact driver", "DeWalt slagschroevendraaier 18V"],
      },
      {
        label: "Bosch Accu Haakse Slijper",
        basePrice: 139,
        queries: ["Bosch accu haakse slijper", "Bosch angle grinder cordless", "Bosch haakse slijper 18V"],
      },
      {
        label: "Karcher Hogedrukreiniger K4",
        basePrice: 199,
        queries: ["Karcher hogedrukreiniger K4", "Kärcher K4 pressure washer", "Karcher K4 Nederland"],
      },
      {
        label: "Gardena Tuinslang 25m",
        basePrice: 39,
        queries: ["Gardena tuinslang 25m", "Gardena slang 25 meter", "Gardena garden hose 25m"],
      },
    ],
    pets: [
      {
        label: "Whiskas Dry Cat Food 7kg",
        basePrice: 25,
        queries: ["Whiskas droog kattenvoer 7 kg", "Whiskas dry cat food 7kg", "Whiskas kattenvoer 7 kg"],
      },
      {
        label: "Royal Canin Sterilised 10kg",
        basePrice: 79,
        queries: ["Royal Canin Sterilised 10kg", "Royal Canin sterilised kat 10 kg", "Royal Canin Sterilised Nederland"],
      },
      {
        label: "Purina Pro Plan Puppy 12kg",
        basePrice: 59,
        queries: ["Purina Pro Plan puppy 12kg", "Pro Plan puppy hondenvoer 12 kg", "Purina Pro Plan Puppy Nederland"],
      },
      {
        label: "Frontline Spot On Kat",
        basePrice: 24,
        queries: ["Frontline spot on kat", "Frontline katten vlooien", "Frontline cat spot on"],
      },
      {
        label: "Seresto Halsband Hond",
        basePrice: 39,
        queries: ["Seresto halsband hond", "Seresto flea tick collar dog", "Seresto halsband Nederland"],
      },
      {
        label: "Trixie Kattenbak",
        basePrice: 19,
        queries: ["Trixie kattenbak", "Trixie litter box", "Trixie kattenbak met kap"],
      },
    ],
    auto: [
      {
        label: "Castrol EDGE 5W-30 5L",
        basePrice: 45,
        queries: ["Castrol EDGE 5W-30 5L", "Castrol Edge 5W30 5 liter", "Castrol EDGE 5W-30 LL 5L"],
      },
      {
        label: "Bosch Ruitenwissers Aerotwin",
        basePrice: 29,
        queries: ["Bosch ruitenwissers Aerotwin", "Bosch Aerotwin wiper blades", "Bosch Aerotwin ruitenwissers set"],
      },
      {
        label: "Michelin All Season Band 205/55 R16",
        basePrice: 89,
        queries: ["Michelin all season 205/55 R16", "Michelin CrossClimate 205/55 R16", "Michelin all season band 205 55 16"],
      },
      {
        label: "Carplay Adapter Wireless",
        basePrice: 59,
        queries: ["wireless carplay adapter", "carplay adapter draadloos", "wireless carplay dongle"],
      },
      {
        label: "Jump Starter Powerbank Auto",
        basePrice: 79,
        queries: ["jump starter powerbank auto", "auto start booster", "jumpstarter 12V"],
      },
    ],
    mixed30: [
      // electronics
      { label: "Apple iPhone 13 128GB", basePrice: 449, queries: ["Apple iPhone 13 128GB", "Apple iPhone 13 128GB nieuw", "Apple iPhone 13 128GB Nederland"] },
      { label: "Sony WH-1000XM5", basePrice: 299, queries: ["Sony WH-1000XM5", "Sony WH-1000XM5 koptelefoon", "Sony WH-1000XM5 noise cancelling"] },
      { label: "Nintendo Switch OLED", basePrice: 349, queries: ["Nintendo Switch OLED", "Nintendo Switch OLED model", "Nintendo Switch OLED Nederland"] },
      { label: "Philips Airfryer XXL", basePrice: 249, queries: ["Philips Airfryer XXL", "Philips Airfryer XXL HD9650", "Philips Airfryer XXL Nederland"] },
      { label: "MacBook Air M2 256GB", basePrice: 1099, queries: ["MacBook Air M2 256GB", "Apple MacBook Air M2 256GB", "MacBook Air M2 13 inch"] },
      // diy
      { label: "Bosch Hammer Drill SDS Plus", basePrice: 129, queries: ["Bosch boorhamer SDS plus", "Bosch hammer drill SDS plus", "Bosch SDS Plus boorhamer"] },
      { label: "Karcher Hogedrukreiniger K4", basePrice: 199, queries: ["Karcher hogedrukreiniger K4", "Kärcher K4 pressure washer", "Karcher K4 Nederland"] },
      { label: "Makita Accu Boormachine 18V", basePrice: 149, queries: ["Makita accu boormachine 18V", "Makita boor schroefmachine 18V", "Makita 18V drill"] },
      { label: "Gardena Tuinslang 25m", basePrice: 39, queries: ["Gardena tuinslang 25m", "Gardena slang 25 meter", "Gardena garden hose 25m"] },
      // pets
      { label: "Whiskas Dry Cat Food 7kg", basePrice: 25, queries: ["Whiskas droog kattenvoer 7 kg", "Whiskas dry cat food 7kg", "Whiskas kattenvoer 7 kg"] },
      { label: "Royal Canin Sterilised 10kg", basePrice: 79, queries: ["Royal Canin Sterilised 10kg", "Royal Canin sterilised kat 10 kg", "Royal Canin Sterilised Nederland"] },
      { label: "Seresto Halsband Hond", basePrice: 39, queries: ["Seresto halsband hond", "Seresto flea tick collar dog", "Seresto halsband Nederland"] },
      // auto
      { label: "Castrol EDGE 5W-30 5L", basePrice: 45, queries: ["Castrol EDGE 5W-30 5L", "Castrol Edge 5W30 5 liter", "Castrol EDGE 5W-30 LL 5L"] },
      { label: "Bosch Ruitenwissers Aerotwin", basePrice: 29, queries: ["Bosch ruitenwissers Aerotwin", "Bosch Aerotwin wiper blades", "Bosch Aerotwin ruitenwissers set"] },
      { label: "Jump Starter Powerbank Auto", basePrice: 79, queries: ["jump starter powerbank auto", "auto start booster", "jumpstarter 12V"] },
      // household/groceries
      { label: "Lavazza Espresso Coffee Beans 1kg", basePrice: 18, queries: ["Lavazza espresso bonen 1kg", "Lavazza espresso coffee beans 1kg", "Lavazza koffiebonen 1 kg"] },
      { label: "Ariel Wasmiddel Pods 60", basePrice: 25, queries: ["Ariel pods 60", "Ariel wasmiddel pods 60", "Ariel pods aanbieding"] },
      { label: "Finish Vaatwastabletten 100", basePrice: 29, queries: ["Finish vaatwastabletten 100", "Finish dishwasher tablets 100", "Finish quantum 100"] },
      { label: "Oral-B Elektrische Tandenborstel",
        basePrice: 79,
        queries: ["Oral-B elektrische tandenborstel", "Oral-B Pro 3", "Oral-B elektrische tandenborstel aanbieding"],
      },
      { label: "Dyson V12 Detect Slim", basePrice: 499, queries: ["Dyson V12 Detect Slim", "Dyson V12 draadloze stofzuiger", "Dyson V12 Detect Slim Nederland"] },
      { label: "Philips Hue Starter Kit", basePrice: 179, queries: ["Philips Hue Starter Kit", "Philips Hue starterset bridge", "Philips Hue Starter Kit Nederland"] },
      { label: "Google Pixel 8", basePrice: 699, queries: ["Google Pixel 8", "Google Pixel 8 128GB", "Google Pixel 8 Nederland"] },
      { label: "Apple Watch Series 9", basePrice: 449, queries: ["Apple Watch Series 9", "Apple Watch Series 9 45mm", "Apple Watch Series 9 Nederland"] },
      { label: "DeLonghi Magnifica S", basePrice: 349, queries: ["DeLonghi Magnifica S", "DeLonghi Magnifica S ECAM", "DeLonghi Magnifica S Nederland"] },
      { label: "Samsung QE55 4K TV", basePrice: 799, queries: ["Samsung QE55 4K TV", "Samsung QE55 QLED", "Samsung QE55 55 inch"] },
      { label: "Nike Air Max 90", basePrice: 149, queries: ["Nike Air Max 90", "Nike Air Max 90 heren", "Nike Air Max 90 Nederland"] },
      { label: "Zonnebrand SPF50 200ml", basePrice: 14, queries: ["zonnebrand spf 50 200ml", "sun cream spf50 200 ml", "zonnebrand aanbieding spf50"] },
      { label: "LEGO Star Wars set", basePrice: 99, queries: ["LEGO Star Wars set", "LEGO Star Wars aanbieding", "LEGO Star Wars 2024 set"] },
    ],
    v2: [
      {
        label: "Apple AirPods Pro 2",
        basePrice: 279,
        queries: [
          "Apple AirPods Pro 2",
          "AirPods Pro 2e generatie",
          "Apple AirPods Pro 2 Nederland",
        ],
      },
      {
        label: "Dyson V12 Detect Slim",
        basePrice: 499,
        queries: [
          "Dyson V12 Detect Slim",
          "Dyson V12 Detect Slim draadloze stofzuiger",
          "Dyson V12 Detect Slim Nederland",
        ],
      },
      {
        label: "Nintendo Switch OLED",
        basePrice: 349,
        queries: [
          "Nintendo Switch OLED",
          "Nintendo Switch OLED model",
          "Nintendo Switch OLED Nederland",
        ],
      },
      {
        label: "Philips Hue Starter Kit",
        basePrice: 179,
        queries: [
          "Philips Hue Starter Kit",
          "Philips Hue starterset bridge",
          "Philips Hue Starter Kit Nederland",
        ],
      },
    ],
    v3: [
      {
        label: "Castrol EDGE 5W-30 5L",
        basePrice: 45,
        queries: [
          "Castrol EDGE 5W-30 5L",
          "Castrol Edge 5W30 5 liter",
          "Castrol EDGE 5W-30 LL 5L",
        ],
      },
      {
        label: "Whiskas Dry Cat Food 7kg",
        basePrice: 25,
        queries: [
          "Whiskas droog kattenvoer 7 kg",
          "Whiskas dry cat food 7kg",
          "Whiskas kattenvoer 7 kg",
        ],
      },
      {
        label: "Lavazza Espresso Coffee Beans 1kg",
        basePrice: 18,
        queries: [
          "Lavazza espresso bonen 1kg",
          "Lavazza espresso coffee beans 1kg",
          "Lavazza koffiebonen 1 kg",
        ],
      },
      {
        label: "Bosch Hammer Drill SDS Plus",
        basePrice: 129,
        queries: [
          "Bosch boorhamer SDS plus",
          "Bosch hammer drill SDS plus",
          "Bosch SDS Plus boorhamer",
        ],
      },
    ],
    bench10: [
      {
        label: "Logitech MX Master 3S",
        basePrice: 99,
        queries: ["Logitech MX Master 3S", "MX Master 3S muis", "Logitech MX Master 3S Nederland"],
      },
      {
        label: "Apple Watch Series 9",
        basePrice: 449,
        queries: ["Apple Watch Series 9", "Apple Watch Series 9 45mm", "Apple Watch Series 9 Nederland"],
      },
      {
        label: "Google Pixel 8",
        basePrice: 699,
        queries: ["Google Pixel 8", "Google Pixel 8 128GB", "Google Pixel 8 Nederland"],
      },
      {
        label: "Nintendo Switch OLED",
        basePrice: 349,
        queries: ["Nintendo Switch OLED", "Nintendo Switch OLED model", "Nintendo Switch OLED Nederland"],
      },
      {
        label: "PlayStation 5 Slim",
        basePrice: 549,
        queries: ["PlayStation 5 Slim", "PS5 Slim", "PlayStation 5 Slim Nederland"],
      },
      {
        label: "Samsung Galaxy Tab S9",
        basePrice: 899,
        queries: ["Samsung Galaxy Tab S9", "Samsung Tab S9 128GB", "Samsung Galaxy Tab S9 Nederland"],
      },
      {
        label: "Dyson V11",
        basePrice: 499,
        queries: ["Dyson V11", "Dyson V11 stofzuiger", "Dyson V11 Nederland"],
      },
      {
        label: "Philips Airfryer XXL",
        basePrice: 249,
        queries: ["Philips Airfryer XXL", "Philips Airfryer XXL HD9650", "Philips Airfryer XXL Nederland"],
      },
      {
        label: "DeLonghi Magnifica S",
        basePrice: 349,
        queries: ["DeLonghi Magnifica S", "DeLonghi Magnifica S ECAM", "DeLonghi Magnifica S Nederland"],
      },
      {
        label: "MacBook Air M2 256GB",
        basePrice: 1099,
        queries: ["MacBook Air M2 256GB", "Apple MacBook Air M2 256GB", "MacBook Air M2 13 inch"],
      },
    ],
    bench10b: [
      {
        label: "Sony WH-1000XM5",
        basePrice: 299,
        queries: ["Sony WH-1000XM5", "Sony WH-1000XM5 koptelefoon", "Sony WH-1000XM5 Nederland"],
      },
      {
        label: "Apple iPhone 15 128GB",
        basePrice: 799,
        queries: ["Apple iPhone 15 128GB", "iPhone 15 128GB", "Apple iPhone 15 128GB Nederland"],
      },
      {
        label: "Samsung Galaxy S24",
        basePrice: 899,
        queries: ["Samsung Galaxy S24", "Galaxy S24 128GB", "Samsung Galaxy S24 Nederland"],
      },
      {
        label: "Nintendo Switch Pro Controller",
        basePrice: 69,
        queries: ["Nintendo Switch Pro Controller", "Switch Pro Controller", "Nintendo Pro Controller Nederland"],
      },
      {
        label: "Bose QuietComfort Ultra Headphones",
        basePrice: 449,
        queries: ["Bose QuietComfort Ultra Headphones", "Bose QC Ultra", "Bose QuietComfort Ultra Nederland"],
      },
      {
        label: "Dyson V15 Detect",
        basePrice: 699,
        queries: ["Dyson V15 Detect", "Dyson V15 Detect stofzuiger", "Dyson V15 Detect Nederland"],
      },
      {
        label: "Philips Hue Starter Kit",
        basePrice: 149,
        queries: ["Philips Hue starter kit", "Philips Hue bridge starter pack", "Philips Hue starter kit Nederland"],
      },
      {
        label: "DeWalt DCD796 18V Drill",
        basePrice: 149,
        queries: ["DeWalt DCD796", "DeWalt DCD796 18V", "DeWalt DCD796 Nederland"],
      },
      {
        label: "Bosch Unlimited 7",
        basePrice: 399,
        queries: ["Bosch Unlimited 7", "Bosch Unlimited 7 steelstofzuiger", "Bosch Unlimited 7 Nederland"],
      },
      {
        label: "Apple AirPods Pro 2",
        basePrice: 249,
        queries: ["AirPods Pro 2", "Apple AirPods Pro 2", "AirPods Pro 2 Nederland"],
      },
    ],
  };

  const setName = String(process.env.TEST_PRODUCT_SET || "v1").trim();

  const seenPath = path.join(__dirname, "test_seen_offers.json");
  const runCounterPath = path.join(__dirname, "test_run_counter.json");
  const resetSeen = String(process.env.TEST_RESET_SEEN || "").trim() === "1";
  const seenOfferKeys = resetSeen ? new Set() : loadSeenSet(seenPath);
  const runCounter = loadRunCounter(runCounterPath);

  // LIVE random: build a mixed set of 10 products from multiple categories.
  const products =
    setName === "randommix" ? buildRandomMixSet(productSets, runCounter) : productSets[setName] || productSets.v1;
  const rows = [];

  for (let idx = 0; idx < products.length; idx += 1) {
    const p = products[idx];
    const r = await runOneProduct({
      label: p.label,
      basePrice: p.basePrice,
      queries: p.queries,
      attempts,
      retryDelayMs,
      seenOfferKeys,
      startIndex: (runCounter + idx) % Math.max(1, p.queries.length),
    });

    // IMPORTANT: do not change pricing logic.
    // We only normalize ORDER for reporting so price_1..price_3 are always best->worst.
    const o = Array.isArray(r.offers) ? r.offers : [];
    const offersSorted = o
      .filter((x) => x && typeof x.price === "number" && Number.isFinite(x.price) && x.price > 0)
      .slice()
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    const prices = offersSorted.map((x) => x.price);
    const price1 = prices.length > 0 ? prices[0] : null;

    rows.push({
      product: p.label,
      base_price: p.basePrice,
      base_store: p.baseStore || p.basePriceSource || "user",
      base_price_source: p.basePriceSource || "user",
      queryUsed: r.usedQuery,
      attempts: r.tries,
      google_raw: r.rawCount,
      returned: r.returned,
      response_time_s: typeof r.responseTimeMs === "number" ? Math.round((r.responseTimeMs / 1000) * 1000) / 1000 : null,
      price_1: fmt(price1),
      "%_diff": pctDiff(p.basePrice, price1),
      p1: fmt(offersSorted[0] && offersSorted[0].price),
      s1: (offersSorted[0] && offersSorted[0].seller) || null,
      p2: fmt(offersSorted[1] && offersSorted[1].price),
      s2: (offersSorted[1] && offersSorted[1].seller) || null,
      p3: fmt(offersSorted[2] && offersSorted[2].price),
      s3: (offersSorted[2] && offersSorted[2].seller) || null,
      pass: r.pass,
      ok: r.ok,
      error: r.error || null,
    });
  }

  const productsTotal = rows.length;
  const withPrice1 = rows.filter((r) => typeof r.price_1 === "number" && Number.isFinite(r.price_1)).length;
  const reducedToZero = rows.filter((r) => (r.returned || 0) === 0).length;
  const serverReturnsTotal = rows.reduce((s, r) => s + (Number(r.returned) || 0), 0);
  const coverage = productsTotal > 0 ? withPrice1 / productsTotal : 0;
  const diffs = rows.map((r) => r["%_diff"]).filter((v) => typeof v === "number" && Number.isFinite(v));
  const avgPct = diffs.length > 0 ? diffs.reduce((s, v) => s + v, 0) / diffs.length : null;
  const covVal = Math.round(coverage * 1000) / 1000;
  const weightedPct = (() => {
    const rows2 = rows.filter(
      (r) => typeof r["%_diff"] === "number" && Number.isFinite(r["%_diff"]) && typeof r.base_price === "number"
    );
    const wsum = rows2.reduce((s, r) => s + Number(r.base_price || 0), 0);
    if (!Number.isFinite(wsum) || wsum <= 0) return null;
    return rows2.reduce((s, r) => s + (Number(r.base_price || 0) / wsum) * r["%_diff"], 0);
  })();

  // Regression gate (protects the current model from silent degradation).
  // Does NOT change pricing logic – it only fails the test run when key metrics drop.
  const gateEnabled = String(process.env.TEST_GATE || "1").trim() !== "0";
  const minCoverage = Number(process.env.TEST_MIN_COVERAGE ?? 0.8);
  const maxReduced = Number(process.env.TEST_MAX_REDUCED_TO_ZERO ?? 1);
  const minWeighted = Number(process.env.TEST_MIN_WEIGHTED_PCTDIFF ?? 10);
  const minAvg = Number(process.env.TEST_MIN_AVG_PCTDIFF ?? 5);

  const gateErrors = [];
  if (gateEnabled) {
    if (Number.isFinite(minCoverage) && covVal < minCoverage) {
      gateErrors.push(`coverage ${covVal} < ${minCoverage}`);
    }
    if (Number.isFinite(maxReduced) && reducedToZero > maxReduced) {
      gateErrors.push(`reducedToZero ${reducedToZero} > ${maxReduced}`);
    }
    if (Number.isFinite(minWeighted) && weightedPct != null && Number.isFinite(weightedPct) && weightedPct < minWeighted) {
      gateErrors.push(`weighted_%_diff ${Math.round(weightedPct * 1000) / 1000} < ${minWeighted}`);
    }
    if (Number.isFinite(minAvg) && avgPct != null && Number.isFinite(avgPct) && avgPct < minAvg) {
      gateErrors.push(`avg_%_diff ${Math.round(avgPct * 1000) / 1000} < ${minAvg}`);
    }
  }

  const useColors = String(process.env.TEST_COLORS || "1").trim() !== "0";
  const covColored =
    covVal >= 0.9
      ? colorIf(useColors, ANSI.green, covVal)
      : covVal >= 0.7
        ? colorIf(useColors, ANSI.yellow, covVal)
        : colorIf(useColors, ANSI.red, covVal);

  const avgVal = avgPct != null ? Math.round(avgPct * 1000) / 1000 : "";
  const weightedVal = weightedPct != null ? Math.round(weightedPct * 1000) / 1000 : "";

  const reducedColored =
    reducedToZero === 0
      ? colorIf(useColors, ANSI.green, reducedToZero)
      : colorIf(useColors, ANSI.red, reducedToZero);

  const longRows = rows.map((r) => {
    const offers = [
      formatOffer({ seller: r.s1, price: r.p1 }),
      formatOffer({ seller: r.s2, price: r.p2 }),
      formatOffer({ seller: r.s3, price: r.p3 }),
    ];
    const d = r["%_diff"];
    const diffColored =
      typeof d === "number" && Number.isFinite(d)
        ? d >= 25
          ? colorIf(useColors, ANSI.green, d)
          : d >= 10
            ? colorIf(useColors, ANSI.yellow, d)
            : colorIf(useColors, ANSI.red, d)
        : "";

    return [
      r.product,
      r.base_price,
      r.google_raw,
      r.returned,
      r.price_1,
      diffColored,
      offers[0],
      offers[1],
      offers[2],
      r.pass || "",
      r.queryUsed || "",
      r.attempts,
    ];
  });

  // Output format: exactly like the reference screenshot (two simple tables).
  // No ANSI by default (keeps it clean in IDE output). You can re-enable via TEST_COLORS=1.
  const clean = String(process.env.TEST_CLEAN_OUTPUT || "1").trim() !== "0";
  const metricsTable = drawBoxTable(
    ["metric", "value"],
    [
      ["products_total", productsTotal],
      ["products_with_price1", withPrice1],
      ["coverage", clean ? covVal : covColored],
      ["reducedToZero", clean ? reducedToZero : reducedColored],
      ["avg_%_diff", avgVal],
      ["weighted_%_diff", weightedVal],
    ]
  );

  const productRowsBasic = rows.map((r) => [r.product, r.base_price, r.price_1, r["%_diff"]]);
  const productRowsTop3 = rows.map((r) => {
    const b = [r.base_store || "", toCell(r.base_price)].filter(Boolean).join(" ");
    const o1 = [r.s1 || "", toCell(r.p1)].filter(Boolean).join(" ");
    const o2 = [r.s2 || "", toCell(r.p2)].filter(Boolean).join(" ");
    const o3 = [r.s3 || "", toCell(r.p3)].filter(Boolean).join(" ");
    return [r.product, b, o1, o2, o3, r["%_diff"]];
  });

  const productsTable = drawBoxTableMax(
    ["product", "base (store price)", "best", "mid", "worst", "%_diff"],
    productRowsTop3,
    [28, 22, 22, 22, 22, 10]
  );

  const outputFormat = String(process.env.TEST_OUTPUT_FORMAT || "box").trim().toLowerCase();
  if (outputFormat === "html") {
    const htmlView = String(process.env.TEST_HTML_VIEW || "top3").trim().toLowerCase();
    const title = "Dealsense Test Report (Shopping API)";

    const metricsRows = [
      ["products_total", productsTotal],
      ["products_with_price1", withPrice1],
      ["server_returns_total", serverReturnsTotal],
      ["coverage", clean ? covVal : covColored],
      ["reducedToZero", clean ? reducedToZero : reducedColored],
      ["avg_%_diff (mean of per product %)", avgVal],
      ["weighted_%_diff (sum(base-price1)/sum(base))", weightedVal],
    ];

    const html =
      htmlView === "simple"
        ? renderHtmlSimpleTwoTables({ title, setName, metricsRows, rows, view: "simple" })
        : htmlView === "screenshot"
          ? renderHtmlScreenshotReport({ title, setName, metricsRows, rows, view: "screenshot" })
          : renderHtmlClientReport({ title, setName, metricsRows, rows, view: htmlView === "client" ? "client" : htmlView });

    const safeView = (htmlView || "html").replace(/[^a-z0-9_\-]+/gi, "-");
    const outPath = path.join(__dirname, `test-report-${setName || "v1"}-${safeView}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    console.log(outPath);
  } else if (outputFormat === "text" || outputFormat === "txt" || outputFormat === "txtfile") {
    const metricsPairs = [
      ["products_total", productsTotal],
      ["products_with_price1", withPrice1],
      ["server_returns_total", serverReturnsTotal],
      ["coverage", covVal],
      ["reducedToZero", reducedToZero],
      ["avg_%_diff", avgVal],
      ["weighted_%_diff", weightedVal],
    ];

    const headers = ["product", "base", "best", "mid", "worst", "%_diff"];
    const fixed = drawPlainTextFixedTable(headers, productRowsTop3, [28, 16, 28, 28, 28, 8]);
    const doc =
      `Dealsense Test Report (Shopping API)\n` +
      `set=${setName || ""}\n\n` +
      drawPlainTextMetrics(metricsPairs) +
      `\n\n` +
      fixed +
      `\n`;

    if (outputFormat === "txtfile") {
      const txtPath = path.join(__dirname, `test-report-${setName || "v1"}.txt`);
      fs.writeFileSync(txtPath, doc, "utf8");
      console.log(txtPath);
    } else {
      console.log(doc.trimEnd());
    }
  } else if (outputFormat === "md" || outputFormat === "markdown" || outputFormat === "mdfile") {
    const mdView = String(process.env.TEST_MD_VIEW || "top3").trim().toLowerCase();
    const metricsMd = drawMarkdownTableCompact(
      ["metric", "value"],
      [
        ["products_total", productsTotal],
        ["products_with_price1", withPrice1],
        ["coverage", clean ? covVal : covColored],
        ["reducedToZero", clean ? reducedToZero : reducedColored],
        ["avg_%_diff (mean of per product %)", avgVal],
        ["weighted_%_diff (sum(base-price1)/sum(base))", weightedVal],
      ],
      [1]
    );

    const productsMd =
      mdView === "basic"
        ? drawMarkdownTableCompact(["product", "base_price", "price_1", "%_diff"], productRowsBasic, [1, 2, 3])
        : drawMarkdownTableCompact(
            ["product", "base (store price)", "best", "mid", "worst", "%_diff"],
            productRowsTop3,
            [5]
          );

    const mdDoc = `${metricsMd}\n\n${productsMd}\n`;

    if (outputFormat === "mdfile") {
      const mdPath = path.join(__dirname, `test-report-${setName || "v1"}.md`);
      fs.writeFileSync(mdPath, mdDoc, "utf8");
      console.log(mdPath);
    } else {
      console.log(mdDoc.trimEnd());
    }
  } else {
    const reportLines = [
      "Dealsense Test Report (Shopping API)",
      "",
      ...String(metricsTable).split("\n"),
      "",
      ...String(productsTable).split("\n"),
    ];

    console.log(drawOuterBox(reportLines));
  }

  if (gateEnabled && gateErrors.length > 0) {
    console.error("\nREGRESSION GATE FAILED:");
    for (const e of gateErrors) console.error("- " + e);
    process.exitCode = 1;
  }

  const showDetails = String(process.env.TEST_SHOW_DETAILS || "").trim() === "1";
  if (showDetails) {
    console.log("\nDETAILS (debug):");
    console.table(rows);
  }
  saveSeenSet(seenPath, seenOfferKeys);
  saveRunCounter(runCounterPath, runCounter + 1);
}

main().catch((err) => {
  console.error("test-v3-top3-table failed:", (err && err.message) || err);
  process.exitCode = 1;
});
