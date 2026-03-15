const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { fetchMarketOffers } = require("../market-api");

function allowNet() {
  const v = String(process.env.KWANT_LITE_ALLOW_NET || "").trim().toLowerCase();
  if (!(v === "1" || v === "true")) return false;
  // Extra safety: require explicit live allowance too.
  const live = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return live === "1" || live === "true";
}

function safeJson(v) {
  try {
    return JSON.stringify(v, null, 2);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : def;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function writeJsonAtomic(filePath, obj) {
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, safeJson(obj) + "\n", "utf8");
    fs.renameSync(tmp, filePath);
    return true;
  } catch (_) {
    return false;
  }
}

function readJsonlLines(filePath, maxLines) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    return lines.slice(0, Math.max(0, Math.min(maxLines, lines.length)));
  } catch (_) {
    return [];
  }
}

function readJsonlAll(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.split(/\r?\n/).filter(Boolean);
  } catch (_) {
    return [];
  }
}

function writeJsonlAtomic(filePath, lines) {
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, (Array.isArray(lines) ? lines.join("\n") : "") + "\n", "utf8");
    fs.renameSync(tmp, filePath);
    return true;
  } catch (_) {
    return false;
  }
}

function parseJob(line) {
  try {
    const j = JSON.parse(line);
    if (!j || typeof j !== "object") return null;
    const cacheKey = j.cacheKey ? String(j.cacheKey) : "";
    const q = j.q ? String(j.q) : "";
    const ean = j.ean ? String(j.ean) : "";
    return { cacheKey, q, ean };
  } catch (_) {
    return null;
  }
}

async function warmOne(job) {
  const q = job && job.q ? job.q : "";
  const ean = job && job.ean ? job.ean : null;
  if (!q && !ean) return { ok: false, reason: "empty" };

  const started = Date.now();
  let offers = null;
  let err = null;
  try {
    offers = await fetchMarketOffers(q, ean || null);
  } catch (e) {
    offers = null;
    err = (e && e.message) || String(e);
  }

  const durationMs = Date.now() - started;
  const count = Array.isArray(offers) ? offers.length : 0;

  return { ok: !err, durationMs, offersCount: count, error: err };
}

async function main() {
  if (!allowNet()) {
    console.error("[kwant-lite-worker] blocked: set KWANT_LITE_ALLOW_NET=1 and DEALSENSE_ALLOW_LIVE=1 to run.");
    process.exitCode = 2;
    return;
  }

  // Worker should warm caches: allow cache writes.
  // Keep noise low.
  process.env.MARKET_LOG_SILENT = "1";
  delete process.env.MARKET_CACHE_BYPASS;
  process.env.USE_MOCK_FALLBACK = "false";

  // Persist results between restarts.
  if (!process.env.MARKET_DISK_CACHE_ENABLED) process.env.MARKET_DISK_CACHE_ENABLED = "1";

  const queuePath = String(process.env.MARKET_PREWARM_QUEUE_PATH || path.join(__dirname, "..", ".cache", "prewarm-queue.jsonl")).trim();
  const maxJobs = Math.max(1, Math.min(toInt(process.env.KWANT_LITE_MAX_JOBS, 25), 500));
  const maxMs = Math.max(1000, Math.min(toInt(process.env.KWANT_LITE_MAX_MS, 60000), 30 * 60 * 1000));
  const commit = (() => {
    const v = String(process.env.KWANT_LITE_COMMIT || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const statePath = String(process.env.KWANT_LITE_STATE_PATH || path.join(__dirname, "..", ".cache", "kwant-lite-state.json")).trim();
  const maxSeen = Math.max(100, Math.min(toInt(process.env.KWANT_LITE_MAX_SEEN, 5000), 200000));

  const state = (() => {
    const j = readJson(statePath);
    const seenArr = j && Array.isArray(j.seenCacheKeys) ? j.seenCacheKeys : [];
    const seen = new Set(seenArr.filter((s) => typeof s === "string" && s.length > 0));
    return { seen };
  })();

  const lines = readJsonlLines(queuePath, maxJobs);
  const jobs = lines.map(parseJob).filter(Boolean);

  // Dedup by cacheKey
  const seen = new Set();
  const unique = [];
  for (const j of jobs) {
    const k = j.cacheKey || "";
    if (!k) continue;
    if (seen.has(k)) continue;
    if (state.seen.has(k)) continue;
    seen.add(k);
    unique.push(j);
  }

  const startedAll = Date.now();
  const results = [];
  for (const j of unique) {
    if (Date.now() - startedAll > maxMs) break;
    // sequential warm-up to avoid rate limiting
    // eslint-disable-next-line no-await-in-loop
    results.push({ job: j, ...(await warmOne(j)) });
    if (j && j.cacheKey) {
      state.seen.add(String(j.cacheKey));
      if (state.seen.size > maxSeen) {
        // Best-effort trim: keep newest-ish by recreating from tail of iteration order.
        const arr = Array.from(state.seen);
        const keep = arr.slice(Math.max(0, arr.length - maxSeen));
        state.seen = new Set(keep);
      }
    }
  }

  // Persist state
  writeJsonAtomic(statePath, { ts: new Date().toISOString(), seenCacheKeys: Array.from(state.seen) });

  // Optional commit: remove processed cacheKeys from queue to keep it small.
  if (commit && results.length > 0) {
    const processed = new Set(results.map((r) => (r && r.job && r.job.cacheKey ? String(r.job.cacheKey) : "")).filter(Boolean));
    const allLines = readJsonlAll(queuePath);
    const keptLines = [];
    for (const line of allLines) {
      const j = parseJob(line);
      const k = j && j.cacheKey ? String(j.cacheKey) : "";
      if (k && processed.has(k)) continue;
      keptLines.push(line);
    }
    writeJsonlAtomic(queuePath, keptLines);
  }

  const durations = results.map((r) => r.durationMs).filter((n) => Number.isFinite(n));
  const ok = results.filter((r) => r.ok).length;
  const withOffers = results.filter((r) => (r.offersCount || 0) > 0).length;

  const summary = {
    queuePath,
    commit,
    statePath,
    jobsRead: jobs.length,
    jobsProcessed: results.length,
    ok,
    withOffers,
    avgDurationMs: durations.length ? durations.reduce((s, n) => s + n, 0) / durations.length : null,
    maxDurationMs: durations.length ? Math.max(...durations) : null,
    maxMs,
  };

  const out = {
    ts: new Date().toISOString(),
    summary,
    results: results.slice(0, 50),
  };

  const outPath = path.join(__dirname, "kwant-lite-worker.output.json");
  fs.writeFileSync(outPath, safeJson(out) + "\n", "utf8");
  console.log(safeJson({ summary, outPath }));
}

main().catch((e) => {
  console.error("kwant-lite-worker failed:", (e && e.message) || e);
  process.exitCode = 1;
});
