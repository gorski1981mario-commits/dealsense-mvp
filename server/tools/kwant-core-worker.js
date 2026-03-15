"use strict";

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { claim, ack, fail, stats, reap } = require("../kwant/queue");
const { getTask } = require("../kwant/registry");

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

function allowNet() {
  const v = String(process.env.KWANT_ALLOW_NET || "").trim().toLowerCase();
  if (!(v === "1" || v === "true")) return false;
  const live = String(process.env.DEALSENSE_ALLOW_LIVE || "").trim().toLowerCase();
  return live === "1" || live === "true";
}

async function main() {
  process.env.MARKET_LOG_SILENT = "1";
  delete process.env.MARKET_CACHE_BYPASS;
  process.env.USE_MOCK_FALLBACK = "false";
  if (!process.env.MARKET_DISK_CACHE_ENABLED) process.env.MARKET_DISK_CACHE_ENABLED = "1";

  const queueName = String(process.env.KWANT_QUEUE_NAME || "default").trim() || "default";
  const maxJobs = Math.max(1, Math.min(toInt(process.env.KWANT_MAX_JOBS, 50), 1000));
  const maxMs = Math.max(1000, Math.min(toInt(process.env.KWANT_MAX_MS, 60000), 30 * 60 * 1000));
  const reapEveryJobs = Math.max(1, Math.min(toInt(process.env.KWANT_REAP_EVERY_JOBS, 10), 500));
  const reapMax = Math.max(1, Math.min(toInt(process.env.KWANT_REAP_MAX, 100), 1000));

  const startedAll = Date.now();
  const results = [];

  await reap({ queue: queueName, max: reapMax }).catch(() => {});

  for (let i = 0; i < maxJobs; i += 1) {
    if (Date.now() - startedAll > maxMs) break;

    if (i > 0 && i % reapEveryJobs === 0) {
      // eslint-disable-next-line no-await-in-loop
      await reap({ queue: queueName, max: reapMax }).catch(() => {});
    }

    // eslint-disable-next-line no-await-in-loop
    const c = await claim({ queue: queueName });
    if (!c || !c.ok) break;
    if (!c.job) break;

    const job = c.job;

    if (job && typeof job.nextAt === "number" && Date.now() < job.nextAt) {
      // eslint-disable-next-line no-await-in-loop
      await fail(c, "not_due", { maxAttempts: 50, backoffMs: Math.max(250, job.nextAt - Date.now()) });
      continue;
    }

    const handler = getTask(job.taskType);
    if (!handler || typeof handler.run !== "function") {
      // eslint-disable-next-line no-await-in-loop
      await ack(c, { queue: queueName });
      results.push({ job, ok: false, error: "unknown_task" });
      continue;
    }

    const needsNet = handler && handler.requiresNet === true;
    if (needsNet && !allowNet()) {
      // Network tasks are blocked unless explicitly enabled.
      // eslint-disable-next-line no-await-in-loop
      await fail(c, "net_blocked", { maxAttempts: 50, backoffMs: 15000 });
      results.push({ job: { id: job.id, taskType: job.taskType, dedupKey: job.dedupKey, engine: job.engine }, ok: false, error: "net_blocked" });
      continue;
    }

    let out;
    try {
      // eslint-disable-next-line no-await-in-loop
      out = await handler.run(job);
    } catch (e) {
      out = { ok: false, error: (e && e.message) || String(e) };
    }

    if (out && out.ok) {
      // eslint-disable-next-line no-await-in-loop
      await ack(c, { queue: queueName });
    } else {
      // eslint-disable-next-line no-await-in-loop
      await fail(c, "task_failed", { maxAttempts: 3, backoffMs: 1500 });
    }

    results.push({ job: { id: job.id, taskType: job.taskType, dedupKey: job.dedupKey, engine: job.engine }, ...out });
  }

  const qStats = await stats(queueName);

  const summary = {
    queue: queueName,
    stats: qStats,
    jobsProcessed: results.length,
    ok: results.filter((r) => r && r.ok).length,
    withOffers: results.filter((r) => (r && r.offersCount ? r.offersCount : 0) > 0).length,
    maxMs,
  };

  const out = {
    ts: new Date().toISOString(),
    summary,
    results: results.slice(0, 50),
  };

  const outPath = path.join(__dirname, "kwant-core-worker.output.json");
  fs.writeFileSync(outPath, safeJson(out) + "\n", "utf8");
  console.log(safeJson({ summary, outPath }));
}

main().catch((e) => {
  console.error("kwant-core-worker failed:", (e && e.message) || e);
  process.exitCode = 1;
});
