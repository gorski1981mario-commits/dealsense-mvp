// Ładowanie zmiennych środowiskowych z .env (jeśli istnieje)
require("dotenv").config();

const Sentry = require("@sentry/node");
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: false,
  });
}

const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const https = require("https");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Stripe = require("stripe");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { fetchMarketOffers, getMarketMetricsSnapshot } = require("./market-api");
const { stats: kwantQueueStats } = require("./kwant/queue");
const { getJson: kwantCacheGetJson } = require("./kwant/cache");
const { enqueue: kwantEnqueue } = require("./kwant/queue");
const { cacheKeyFor: kwantCacheKeyFor } = require("./kwant/planner");
const { isScam: scoringIsScam } = require("./scoring/isScam");
const {
  offerDedupeKeyForSelection: scoringOfferDedupeKeyForSelection,
  dedupeOffersForSelection: scoringDedupeOffersForSelection,
  pickTopUniqueSellers: scoringPickTopUniqueSellers,
  sortOffersByPriceAndPopularity: scoringSortOffersByPriceAndPopularity,
} = require("./scoring/selection");
const { computeTitleMatchScore: scoringComputeTitleMatchScore } = require("./scoring/match");
const {
  normalizeOfferDeliveryDays,
  filterByMaxDeliveryDays,
} = require("./scoring/delivery");
const { getDealScore } = require("./scoring/dealScore");
const { parseEchoTop3Input } = require("./engine/input");
const { rateLimit } = require("./engine/rateLimit");
const { getTop3EchoOffers } = require("./engine/offerEngine");
const { createTop3Cached } = require("./engine/top3-cache");
const { getPlans, getPlanById } = require("./billing/plans");
const { createCode, consumeCode, createPromoCode, redeemPromoCode } = require("./billing/codes");
const { applyPlanToSession, getEffectivePlanId } = require("./billing/applyPlan");
const { extractEANFromURL, extractEANFromHTML } = require("./ean-extractor");
const { inferCountryFromHostname } = require("./country-config");
const { searchBolComByEAN } = require("./bol-api");
const { analyzeOffersV2 } = require("./pricing/v2");
const { detectCategory } = require("./category-detector");
const {
  parseBillsInput,
  runOptimization,
  formatLockedResponse,
  UNLOCK_PERCENT_OF_SAVINGS
} = require("./optimize-bills");
const {
  buildConfidenceSummary,
  buildSavingsSummary,
  getSavingsDisplayCopy,
  canRecommendSwitch,
  canCalculateSavings,
  allowUnlock,
} = require("./savings-confidence");
const { getAdvisoryFraming, getFooterFramingNl, TERMS_HOOKS, API_FRAMING } = require("./advisory-copy");
const guardrails = require("./guardrails");
const connectorsRegistry = require("./connectors/registry");
const db = require("./db");
const { registerPackage1 } = require("./packages/package_1");
const { registerPackage2 } = require("./packages/package_2/index");
const { registerPackage2Next } = require("./packages/package_2_next");
const { registerPackage2Travel } = require("./packages/package_2_travel");
const { registerPackage2InsuranceVacations } = require("./packages/package_2_insurance_vacations");
const { registerPackage3 } = require("./packages/package_3");
const { registerDocumentCore } = require("./document-core");
const { registerMailIngest } = require("./mail-ingest");
const { registerDocumentPipeline } = require("./document-pipeline");
const kwantQueue = require("./kwant/queue");
const mailStore = require("./mail-store");
const { createVerifyToken } = require("./auth");
const { registerAuthRoutes } = require("./auth/routes");
const { registerBillingRoutes } = require("./billing/routes");

const ECHO_TOP3_CACHE_ENABLED = (() => {
  const v = String(process.env.ECHO_TOP3_CACHE_ENABLED || "1").trim().toLowerCase();
  return v !== "0" && v !== "false";
})();

const top3Cached = createTop3Cached(getTop3EchoOffers);

// Mail ingest: per-user inbound address token registry (MVP in-memory)
const USER_INBOUND_DOMAIN = (process.env.MAIL_INGEST_INBOUND_DOMAIN || "in.dealsense.nl").trim() || "in.dealsense.nl";
const INBOUND_TOKEN_TO_EMAIL = new Map();

function ensureUserInboundToken(user) {
  const u = user && typeof user === "object" ? user : null;
  if (!u || typeof u.email !== "string" || !u.email) return null;
  if (typeof u.inboundToken === "string" && u.inboundToken.trim()) {
    const token = u.inboundToken.trim();
    INBOUND_TOKEN_TO_EMAIL.set(token, u.email);
    try {
      if (mailStore && typeof mailStore.setTokenOwnerEmail === "function") {
        void mailStore.setTokenOwnerEmail(token, u.email);
      }
    } catch (_) {}
    return token;
  }
  const token = crypto.randomBytes(12).toString("hex");
  u.inboundToken = token;
  INBOUND_TOKEN_TO_EMAIL.set(token, u.email);
  try {
    if (mailStore && typeof mailStore.setTokenOwnerEmail === "function") {
      void mailStore.setTokenOwnerEmail(token, u.email);
    }
  } catch (_) {}
  return token;
}

async function resolveOwnerEmailByToken(token) {
  const t = typeof token === "string" ? token.trim() : "";
  if (!t) return null;

  try {
    if (mailStore && typeof mailStore.getTokenOwnerEmail === "function" && mailStore.isUpstashEnabled()) {
      const v = await mailStore.getTokenOwnerEmail(t);
      if (v) {
        INBOUND_TOKEN_TO_EMAIL.set(t, v);
        return v;
      }
    }
  } catch (_) {}

  const direct = INBOUND_TOKEN_TO_EMAIL.get(t);
  if (direct) return direct;

  // Fallback: scan current in-memory users (MVP)
  for (const [email, user] of USERS_DB.entries()) {
    if (user && typeof user === "object" && typeof user.inboundToken === "string" && user.inboundToken.trim() === t) {
      INBOUND_TOKEN_TO_EMAIL.set(t, email);
      try {
        if (mailStore && typeof mailStore.setTokenOwnerEmail === "function") {
          void mailStore.setTokenOwnerEmail(t, email);
        }
      } catch (_) {}
      return email;
    }
  }
  return null;
}

async function getTop3EchoOffersCached(input) {
  if (!ECHO_TOP3_CACHE_ENABLED) return getTop3EchoOffers(input);
  const { value, cache } = await top3Cached.get(input);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...value, __cache: cache };
  }
  return value;
}

const app = express();
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  const isSyntaxError = err instanceof SyntaxError;
  const isBodyError = err && typeof err === "object" && "body" in err;
  if (isSyntaxError && isBodyError) {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }
  return next(err);
});
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

function isValidHttpUrl(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function extractCanonicalUrl(html, fallbackUrl) {
  try {
    const h = String(html || "");
    const m = h.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i);
    if (m && m[0]) {
      const href = m[0].match(/href=["']([^"']+)["']/i);
      if (href && href[1] && isValidHttpUrl(href[1])) return href[1];
      if (href && href[1] && fallbackUrl) {
        try {
          return new URL(href[1], fallbackUrl).toString();
        } catch (e) {}
      }
    }
  } catch (e) {}
  return isValidHttpUrl(fallbackUrl) ? String(fallbackUrl).trim() : null;
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function collectJsonLdObjects(html) {
  const out = [];
  try {
    const h = String(html || "");
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(h))) {
      const raw = (m[1] || "").trim();
      if (!raw) continue;
      const parsed = safeJsonParse(raw);
      if (parsed == null) continue;
      out.push(parsed);
    }
  } catch (e) {}
  return out;
}

function typeIncludesProduct(t) {
  if (!t) return false;
  if (typeof t === "string") return t.toLowerCase() === "product";
  if (Array.isArray(t)) return t.some((x) => typeof x === "string" && x.toLowerCase() === "product");
  return false;
}

function findProductNodes(jsonLd) {
  const products = [];
  const walk = (node) => {
    if (node == null) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;

    if (typeIncludesProduct(node["@type"])) {
      products.push(node);
    }
    if (node["@graph"]) walk(node["@graph"]);
    for (const k of Object.keys(node)) {
      if (k === "@graph") continue;
      walk(node[k]);
    }
  };
  walk(jsonLd);
  return products;
}

function pickProductIdentifiers(productNode) {
  const p = productNode && typeof productNode === "object" ? productNode : null;
  if (!p) return {};

  const out = {};
  const put = (key, value) => {
    if (!value) return;
    const s = String(value).trim();
    if (!s) return;
    if (out[key]) return;
    out[key] = s;
  };

  const firstScalar = (v) => {
    if (typeof v === "string" || (typeof v === "number" && Number.isFinite(v))) return v;
    if (Array.isArray(v)) {
      for (const x of v) {
        if (typeof x === "string" || (typeof x === "number" && Number.isFinite(x))) return x;
      }
    }
    return null;
  };

  const pick = (srcKey, dstKey) => {
    const v = firstScalar(p[srcKey]);
    if (v == null) return;
    put(dstKey, v);
  };

  pick("gtin14", "gtin14");
  pick("gtin13", "gtin13");
  pick("gtin12", "gtin12");
  pick("gtin8", "gtin8");
  pick("gtin", "gtin");

  pick("ean13", "ean13");
  pick("ean", "ean");
  pick("upc", "upc");
  pick("upc12", "upc12");
  pick("isbn", "isbn");
  pick("asin", "asin");

  pick("sku", "sku");
  pick("mpn", "mpn");
  pick("model", "model");
  pick("productID", "productId");
  pick("productId", "productId");
  pick("id", "id");

  // Non-standard but sometimes present in merchant feeds
  pick("pan", "pan");
  pick("gti", "gti");
  pick("n", "n");

  return out;
}

function pickGtinOrEan(productNode) {
  const p = productNode && typeof productNode === "object" ? productNode : null;
  if (!p) return null;
  const keys = ["gtin13", "gtin12", "gtin14", "gtin", "ean", "ean13", "sku", "mpn"];
  for (const k of keys) {
    const v = p[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function parsePriceFromUnknown(v) {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v > 0 ? v : null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  const cleaned = s.replace(/[^0-9,\.\-]/g, "");
  if (!cleaned) return null;
  let x = cleaned;
  if (x.includes(",") && x.includes(".")) {
    x = x.replace(/\./g, "").replace(",", ".");
  } else if (x.includes(",")) {
    x = x.replace(",", ".");
  }
  const n = Number.parseFloat(x);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function pickBasePriceFromProductNode(productNode) {
  const p = productNode && typeof productNode === "object" ? productNode : null;
  if (!p) return null;
  const offers = p.offers;
  const pickFromOffer = (o) => {
    if (!o || typeof o !== "object") return null;
    const v = o.price ?? o.lowPrice ?? o.highPrice;
    return parsePriceFromUnknown(v);
  };
  if (Array.isArray(offers) && offers.length > 0) {
    for (const o of offers) {
      const n = pickFromOffer(o);
      if (n != null) return n;
    }
  }
  if (offers && typeof offers === "object" && !Array.isArray(offers)) {
    const n = pickFromOffer(offers);
    if (n != null) return n;
  }
  return parsePriceFromUnknown(p.price);
}

function normalizeUrlForFingerprint(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    const strip = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
      "msclkid",
    ];
    strip.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch (e) {
    return String(url || "");
  }
}

function getRpIdFromRequest(req) {
  try {
    const origin = getRequestOrigin(req);
    const host = new URL(origin).hostname;
    if (host === "localhost" || host.endsWith(".localhost")) return "localhost";
    return host;
  } catch (e) {
    return "localhost";
  }
}

function getWebauthnState(sessionData) {
  if (!sessionData || typeof sessionData !== "object") return { credentials: [], currentChallenge: null };
  if (!sessionData.webauthn || typeof sessionData.webauthn !== "object") {
    sessionData.webauthn = { credentials: [], currentChallenge: null };
  }
  if (!Array.isArray(sessionData.webauthn.credentials)) sessionData.webauthn.credentials = [];
  if (sessionData.webauthn.currentChallenge === undefined) sessionData.webauthn.currentChallenge = null;

  // If session was restored from JSON (Redis), Buffers may have been serialized as { type: 'Buffer', data: [...] }
  // Revive them back to Buffer for @simplewebauthn/server verification.
  sessionData.webauthn.credentials = sessionData.webauthn.credentials.map((c) => {
    if (!c || typeof c !== "object") return c;
    const revive = (v) => {
      if (!v) return v;
      if (Buffer.isBuffer(v)) return v;
      if (v instanceof Uint8Array) return Buffer.from(v);
      if (typeof v === "object" && v.type === "Buffer" && Array.isArray(v.data)) {
        try {
          return Buffer.from(v.data);
        } catch (e) {
          return v;
        }
      }
      return v;
    };
    return {
      ...c,
      credentialID: revive(c.credentialID),
      credentialPublicKey: revive(c.credentialPublicKey),
    };
  });
  return sessionData.webauthn;
}

function mapStoredCredentialToAllowCredential(c) {
  if (!c || typeof c !== "object") return null;
  if (typeof c.id !== "string" || !c.id) return null;
  const out = { id: c.id, type: "public-key" };
  if (Array.isArray(c.transports) && c.transports.length > 0) out.transports = c.transports;
  return out;
}

function isPasskeyPlan(planId) {
  const id = String(planId || "").trim().toLowerCase();
  return id === "package_2" || id === "package_3" || id === "package_4";
}

function requirePasskeyPlanOr402(sessionData, res) {
  const effective = getEffectivePlanId(sessionData);
  if (isPasskeyPlan(effective)) return true;
  res.status(402).json({ ok: false, locked: true, error: "upgrade_required", requiredPlan: "package_2" });
  return false;
}

app.post(
  "/api/webauthn/register/options",
  rateLimit({ windowMs: 60_000, max: 60 }),
  async (req, res) => {
    try {
      const body = req.body != null && typeof req.body === "object" ? req.body : {};
      const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
      if (!deviceId) return res.status(400).json({ ok: false, error: "device_id_required" });

      const clientIP = getClientIP(req);
      const { sessionId, data: sessionData } = await getSession(deviceId, null, clientIP);
      if (!requirePasskeyPlanOr402(sessionData, res)) return;
      const webauthn = getWebauthnState(sessionData);

      const rpID = getRpIdFromRequest(req);
      const opts = await generateRegistrationOptions({
        rpName: "Dealsense",
        rpID,
        userID: sessionId,
        userName: sessionId,
        timeout: 60_000,
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
        excludeCredentials: webauthn.credentials.map(mapStoredCredentialToAllowCredential).filter(Boolean),
      });

      webauthn.currentChallenge = opts.challenge;
      saveSessionToRedis(sessionId, sessionData);

      return res.json({ ok: true, options: opts, rpID });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "register_options_failed" });
    }
  }
);

app.post(
  "/api/webauthn/register/verify",
  rateLimit({ windowMs: 60_000, max: 60 }),
  async (req, res) => {
    try {
      const body = req.body != null && typeof req.body === "object" ? req.body : {};
      const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
      const credential = body.credential;
      if (!deviceId) return res.status(400).json({ ok: false, error: "device_id_required" });
      if (!credential || typeof credential !== "object") return res.status(400).json({ ok: false, error: "credential_required" });

      const clientIP = getClientIP(req);
      const { sessionId, data: sessionData } = await getSession(deviceId, null, clientIP);
      if (!requirePasskeyPlanOr402(sessionData, res)) return;
      const webauthn = getWebauthnState(sessionData);
      if (!webauthn.currentChallenge) return res.status(400).json({ ok: false, error: "no_challenge" });

      const rpID = getRpIdFromRequest(req);
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: webauthn.currentChallenge,
        expectedOrigin: getRequestOrigin(req),
        expectedRPID: rpID,
        requireUserVerification: false,
      });

      const { verified, registrationInfo } = verification || {};
      if (!verified || !registrationInfo) {
        return res.status(400).json({ ok: false, error: "not_verified" });
      }

      const { credentialID, credentialPublicKey, counter } = registrationInfo;
      const transports = Array.isArray(credential && credential.transports) ? credential.transports : undefined;
      const id = credential && typeof credential.id === "string" ? credential.id : null;

      // Store in session (Upstash-backed if enabled)
      webauthn.credentials.push({
        id,
        credentialID,
        credentialPublicKey,
        counter: typeof counter === "number" ? counter : 0,
        transports: Array.isArray(transports) ? transports : undefined,
        createdAt: Date.now(),
      });
      webauthn.currentChallenge = null;
      saveSessionToRedis(sessionId, sessionData);

      return res.json({ ok: true, verified: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "register_verify_failed" });
    }
  }
);

app.post(
  "/api/webauthn/authenticate/options",
  rateLimit({ windowMs: 60_000, max: 120 }),
  async (req, res) => {
    try {
      const body = req.body != null && typeof req.body === "object" ? req.body : {};
      const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
      if (!deviceId) return res.status(400).json({ ok: false, error: "device_id_required" });

      const clientIP = getClientIP(req);
      const { sessionId, data: sessionData } = await getSession(deviceId, null, clientIP);
      if (!requirePasskeyPlanOr402(sessionData, res)) return;
      const webauthn = getWebauthnState(sessionData);
      if (webauthn.credentials.length === 0) {
        return res.status(400).json({ ok: false, error: "no_credentials" });
      }

      const rpID = getRpIdFromRequest(req);
      const opts = await generateAuthenticationOptions({
        rpID,
        timeout: 60_000,
        userVerification: "preferred",
        allowCredentials: webauthn.credentials.map(mapStoredCredentialToAllowCredential).filter(Boolean),
      });

      webauthn.currentChallenge = opts.challenge;
      saveSessionToRedis(sessionId, sessionData);

      return res.json({ ok: true, options: opts, rpID });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "auth_options_failed" });
    }
  }
);

app.post(
  "/api/webauthn/authenticate/verify",
  rateLimit({ windowMs: 60_000, max: 120 }),
  async (req, res) => {
    try {
      const body = req.body != null && typeof req.body === "object" ? req.body : {};
      const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
      const credential = body.credential;
      if (!deviceId) return res.status(400).json({ ok: false, error: "device_id_required" });
      if (!credential || typeof credential !== "object") return res.status(400).json({ ok: false, error: "credential_required" });

      const clientIP = getClientIP(req);
      const { sessionId, data: sessionData } = await getSession(deviceId, null, clientIP);
      if (!requirePasskeyPlanOr402(sessionData, res)) return;
      const webauthn = getWebauthnState(sessionData);
      if (!webauthn.currentChallenge) return res.status(400).json({ ok: false, error: "no_challenge" });

      const id = credential && typeof credential.id === "string" ? credential.id : null;
      const stored = webauthn.credentials.find((c) => c && c.id === id) || null;
      if (!stored) return res.status(400).json({ ok: false, error: "unknown_credential" });

      const rpID = getRpIdFromRequest(req);
      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: webauthn.currentChallenge,
        expectedOrigin: getRequestOrigin(req),
        expectedRPID: rpID,
        authenticator: {
          credentialID: stored.credentialID,
          credentialPublicKey: stored.credentialPublicKey,
          counter: typeof stored.counter === "number" ? stored.counter : 0,
        },
        requireUserVerification: false,
      });

      const { verified, authenticationInfo } = verification || {};
      if (!verified || !authenticationInfo) {
        return res.status(400).json({ ok: false, error: "not_verified" });
      }

      stored.counter = typeof authenticationInfo.newCounter === "number" ? authenticationInfo.newCounter : stored.counter;
      webauthn.currentChallenge = null;
      saveSessionToRedis(sessionId, sessionData);

      return res.json({ ok: true, verified: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "auth_verify_failed" });
    }
  }
);

app.post("/api/validate-product", rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!isValidHttpUrl(url)) {
      return res.status(400).json({ ok: false, error: "invalid_url" });
    }

    const allowHtml = (() => {
      const v = String(process.env.VALIDATE_PRODUCT_ALLOW_HTML || "").trim().toLowerCase();
      return v === "1" || v === "true";
    })();
    const rawHtml = allowHtml && typeof body.html === "string" ? body.html : null;

    const timeoutMs = Math.max(2000, Math.min(Number(process.env.VALIDATE_PRODUCT_TIMEOUT_MS) || 8000, 60000));
    const insecureTls = (() => {
      const v = String(process.env.VALIDATE_PRODUCT_INSECURE_TLS || "").trim().toLowerCase();
      if (!(v === "1" || v === "true")) return false;
      return String(process.env.NODE_ENV || "").trim().toLowerCase() !== "production";
    })();

    const httpsAgent = insecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined;

    let finalUrl = url;
    let html = rawHtml;
    if (!html) {
      const r = await axios.get(url, {
        timeout: timeoutMs,
        maxRedirects: 5,
        responseType: "text",
        validateStatus: () => true,
        httpsAgent,
        headers: {
          "User-Agent": "DealsenseBot/1.0 (+https://dealsense.nl)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      const status = Number(r && r.status);
      html = r && typeof r.data === "string" ? r.data : String(r && r.data != null ? r.data : "");
      if (!Number.isFinite(status) || status < 200 || status >= 400) {
        return res.status(502).json({ ok: false, error: "fetch_failed", status: Number.isFinite(status) ? status : null });
      }

      finalUrl = (r && r.request && r.request.res && r.request.res.responseUrl) || url;
    }
    const canonical = extractCanonicalUrl(html, finalUrl);
    const normalizedCanonical = canonical ? normalizeUrlForFingerprint(canonical) : null;

    const jsonLds = collectJsonLdObjects(html);
    const productNodes = [];
    for (const j of jsonLds) {
      const nodes = findProductNodes(j);
      for (const n of nodes) productNodes.push(n);
    }

    const productCount = productNodes.length;
    if (productCount === 0) {
      return res.status(422).json({ ok: false, error: "not_product_page", reason: "no_jsonld_product" });
    }
    if (productCount > 3) {
      return res.status(422).json({ ok: false, error: "not_product_page", reason: "too_many_products" });
    }

    const p0 = productNodes[0];
    const title = (p0 && typeof p0.name === "string" && p0.name.trim()) ? p0.name.trim() : null;
    const identifiers = pickProductIdentifiers(p0);
    const gtin = identifiers.gtin14 || identifiers.gtin13 || identifiers.gtin12 || identifiers.gtin8 || identifiers.gtin || identifiers.ean13 || identifiers.ean || identifiers.sku || identifiers.mpn || pickGtinOrEan(p0);
    const basePriceHint = pickBasePriceFromProductNode(p0);

    const inferredCountry = (() => {
      const candidate = normalizedCanonical || finalUrl;
      try {
        const host = new URL(candidate).hostname;
        return inferCountryFromHostname(host);
      } catch (e) {
        return null;
      }
    })();

    const fpSource = JSON.stringify({
      canonical: normalizedCanonical || null,
      gtin: gtin || null,
      title: title || null,
    });
    const fingerprint = crypto.createHash("sha256").update(fpSource).digest("hex");

    return res.json({
      ok: true,
      url,
      finalUrl: isValidHttpUrl(finalUrl) ? finalUrl : null,
      canonical: normalizedCanonical,
      product: {
        title,
        gtin,
        identifiers,
      },
      inferredCountry,
      basePriceHint: basePriceHint != null ? Number(basePriceHint.toFixed(2)) : null,
      fingerprint,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "validate_failed", message: (e && e.message) || String(e) });
  }
});

app.get("/metrics/market", (req, res) => {
  const enabled = (() => {
    const v = String(process.env.MARKET_METRICS_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "metrics_disabled" });
  try {
    const snap = typeof getMarketMetricsSnapshot === "function" ? getMarketMetricsSnapshot() : null;
    return res.json({ ok: true, market: snap });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "metrics_failed" });
  }
});

app.get("/api/kwant/stats", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_STATS_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "stats_disabled" });
  try {
    const queue = typeof req.query.queue === "string" ? req.query.queue.trim() : "";
    const snap = await kwantQueueStats(queue || "default");
    return res.json({ ok: true, kwant: snap });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "stats_failed" });
  }
});

app.get("/api/kwant/cache", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_CACHE_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "cache_api_disabled" });
  try {
    const key = typeof req.query.key === "string" ? req.query.key.trim() : "";
    if (!key) return res.status(400).json({ ok: false, error: "key_required" });
    const value = await kwantCacheGetJson(key);
    return res.json({ ok: true, key, value });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "cache_failed" });
  }
});

app.post("/api/kwant/enqueue-test", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_DEBUG_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "debug_api_disabled" });
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const queue = typeof body.queue === "string" ? body.queue.trim() : "default";
    const payload = body.payload != null ? body.payload : { hello: "world" };
    const dedupKey = typeof body.dedupKey === "string" && body.dedupKey.trim() ? body.dedupKey.trim() : `unit|${Date.now()}|${Math.random().toString(36).slice(2, 8)}`;

    const r = await kwantEnqueue({ queue, taskType: "unit", engine: "server", payload, dedupKey, priority: 5 });
    return res.json({ ok: true, enqueued: r && r.enqueued === true, backend: r && r.backend ? r.backend : null, job: r && r.job ? { id: r.job.id, taskType: r.job.taskType, dedupKey: r.job.dedupKey, queue: r.job.queue } : null });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "enqueue_test_failed" });
  }
});

app.post("/api/kwant/demo-kickoff", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_DEBUG_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "debug_api_disabled" });
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const queue = typeof body.queue === "string" ? body.queue.trim() : "default";
    const n = Math.max(1, Math.min(Number(body.n) || 5, 50));
    const correlationId = typeof body.correlationId === "string" && body.correlationId.trim() ? body.correlationId.trim() : `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const jobs = [];
    for (let i = 0; i < n; i += 1) {
      const dedupKey = `unit|${correlationId}|${i}`;
      const payload = { correlationId, i, t: Date.now() };
      const r = await kwantEnqueue({ queue, taskType: "unit", engine: "server", payload, dedupKey, priority: 5 });
      jobs.push({ enqueued: r && r.enqueued === true, backend: r && r.backend ? r.backend : null, id: r && r.job ? r.job.id : null, dedupKey });
    }
    return res.json({ ok: true, correlationId, queue, n, jobs });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "demo_kickoff_failed" });
  }
});

app.post("/api/kwant/safe-hybrid-kickoff", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_DEBUG_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "debug_api_disabled" });
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const queue = typeof body.queue === "string" ? body.queue.trim() : "default";
    const query = typeof body.query === "string" ? body.query.trim() : (typeof body.q === "string" ? body.q.trim() : "");
    const ean = typeof body.ean === "string" ? body.ean.trim() : "";
    if (!query && !ean) return res.status(400).json({ ok: false, error: "query_or_ean_required" });

    const r = await kwantEnqueue(
      {
        queue,
        taskType: "hybrid_kickoff",
        engine: "server",
        dedupKey: `safe_hybrid_kickoff|${query || ""}|${ean || ""}`,
        payload: { query: query || null, ean: ean || null, queue },
        priority: 5,
      },
      { dedupTtlSeconds: 600 }
    );

    return res.json({ ok: true, enqueued: r && r.enqueued === true, backend: r && r.backend ? r.backend : null, job: r && r.job ? { id: r.job.id, taskType: r.job.taskType, dedupKey: r.job.dedupKey, queue: r.job.queue } : null });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "safe_hybrid_kickoff_failed" });
  }
});

app.get("/api/kwant/worker-output", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_DEBUG_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "debug_api_disabled" });
  try {
    const p = path.join(__dirname, "tools", "kwant-core-worker.output.json");
    if (!fs.existsSync(p)) return res.status(404).json({ ok: false, error: "no_worker_output" });
    const raw = fs.readFileSync(p, "utf8");
    const value = JSON.parse(raw);
    return res.json({ ok: true, value });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "worker_output_failed" });
  }
});

app.post("/api/kwant/hybrid", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_HYBRID_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "hybrid_api_disabled" });
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const query = typeof body.query === "string" ? body.query.trim() : (typeof body.q === "string" ? body.q.trim() : "");
    const ean = typeof body.ean === "string" ? body.ean.trim() : "";
    const queue = typeof body.queue === "string" ? body.queue.trim() : "default";
    if (!query && !ean) return res.status(400).json({ ok: false, error: "query_or_ean_required" });

    const r = await kwantEnqueue(
      {
        queue,
        taskType: "hybrid_kickoff",
        engine: "server",
        dedupKey: `hybrid_kickoff|${query || ""}|${ean || ""}`,
        payload: { query: query || null, ean: ean || null, queue },
        priority: 5,
      },
      { dedupTtlSeconds: Math.max(60, Math.min(Number(process.env.KWANT_HYBRID_TTL_SECONDS) || 3600, 60 * 60 * 24)) }
    );

    return res.json({ ok: true, enqueued: r && r.enqueued === true, backend: r && r.backend ? r.backend : null, job: r && r.job ? { id: r.job.id, taskType: r.job.taskType, dedupKey: r.job.dedupKey, queue: r.job.queue } : null });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "hybrid_failed" });
  }
});

app.get("/api/kwant/hybrid-result", async (req, res) => {
  const enabled = (() => {
    const v = String(process.env.KWANT_HYBRID_RESULT_API_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  if (!enabled) return res.status(404).json({ ok: false, error: "hybrid_result_disabled" });
  try {
    const query = typeof req.query.query === "string" ? req.query.query.trim() : (typeof req.query.q === "string" ? req.query.q.trim() : "");
    const ean = typeof req.query.ean === "string" ? req.query.ean.trim() : "";
    const queue = typeof req.query.queue === "string" ? req.query.queue.trim() : "default";
    if (!query && !ean) return res.status(400).json({ ok: false, error: "query_or_ean_required" });

    const cacheKey = kwantCacheKeyFor({ query, ean });
    const key = `hybrid:${cacheKey}`;
    const value = await kwantCacheGetJson(key);

    const kickoffOnMiss = (() => {
      const v = String(process.env.KWANT_HYBRID_KICKOFF_ON_MISS_ENABLED || "").trim().toLowerCase();
      return v === "1" || v === "true";
    })();
    const kickoff = String(req.query.kickoff || "").trim() === "1";

    let enqueued = false;
    if (!value && kickoff && kickoffOnMiss) {
      const r = await kwantEnqueue(
        {
          queue,
          taskType: "hybrid_kickoff",
          engine: "server",
          dedupKey: `hybrid_kickoff|${cacheKey}`,
          payload: { query: query || null, ean: ean || null, queue },
          priority: 5,
        },
        { dedupTtlSeconds: Math.max(60, Math.min(Number(process.env.KWANT_HYBRID_TTL_SECONDS) || 3600, 60 * 60 * 24)) }
      );
      enqueued = r && r.enqueued === true;
    }

    return res.json({ ok: true, cacheKey, key, value, enqueued });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "hybrid_result_failed" });
  }
});

app.get("/api/kwant/stream", async (req, res) => {
  try {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    const limit = Math.max(10, Math.min(Number(req.query.limit) || 50, 200));
    const typesRaw = typeof req.query.types === "string" ? req.query.types.trim() : "";
    const allowedTypes = new Set(typesRaw ? typesRaw.split(",").map((s) => s.trim()).filter(Boolean) : []);

    const sessionFilter = (() => {
      const v = typeof req.query.sessionId === "string" ? req.query.sessionId.trim() : "";
      return v || null;
    })();
    const cidFilter = (() => {
      const v = typeof req.query.correlationId === "string" ? req.query.correlationId.trim() : "";
      return v || null;
    })();

    let lastTs = 0;
    const seen = new Set();
    const maxSeen = 2000;

    async function getLatest() {
      const redisEvents = await readLastEventsFromRedis(limit);
      if (redisEvents.length > 0) return redisEvents;
      return readLastEventsFromFile(limit);
    }

    const initial = await getLatest();
    const chronological = (Array.isArray(initial) ? initial : []).slice().sort((a, b) => {
      const ta = a && typeof a.timestamp === "string" ? Date.parse(a.timestamp) : 0;
      const tb = b && typeof b.timestamp === "string" ? Date.parse(b.timestamp) : 0;
      return ta - tb;
    });
    for (const e of chronological) {
      const ts = e && typeof e.timestamp === "string" ? Date.parse(e.timestamp) : 0;
      if (Number.isFinite(ts) && ts > lastTs) lastTs = ts;
      const fp = eventFingerprint(e);
      seen.add(fp);
      if (seen.size > maxSeen) {
        const arr = Array.from(seen);
        seen.clear();
        for (const x of arr.slice(-Math.floor(maxSeen * 0.8))) seen.add(x);
      }
      if (allowedTypes.size > 0 && !(e && allowedTypes.has(e.type))) continue;
      if (sessionFilter && !(e && e.payload && e.payload.sessionId === sessionFilter)) continue;
      if (cidFilter && !(e && e.payload && e.payload.correlationId === cidFilter)) continue;
      sseWrite(res, e.type || "event", e);
    }

    sseWrite(res, "ready", { ok: true });

    const heartbeatMs = Math.max(5000, Math.min(Number(req.query.heartbeatMs) || 15000, 60000));
    const pollMs = Math.max(700, Math.min(Number(req.query.pollMs) || 1200, 10000));
    const heartbeat = setInterval(() => {
      sseWrite(res, "ping", { t: Date.now() });
    }, heartbeatMs);

    let stopped = false;
    const poll = setInterval(() => {
      if (stopped) return;
      Promise.resolve()
        .then(async () => {
          const latest = await getLatest();
          const list = (Array.isArray(latest) ? latest : []).slice().sort((a, b) => {
            const ta = a && typeof a.timestamp === "string" ? Date.parse(a.timestamp) : 0;
            const tb = b && typeof b.timestamp === "string" ? Date.parse(b.timestamp) : 0;
            return ta - tb;
          });
          for (const e of list) {
            const ts = e && typeof e.timestamp === "string" ? Date.parse(e.timestamp) : 0;
            if (!Number.isFinite(ts) || ts < lastTs) continue;
            const fp = eventFingerprint(e);
            if (seen.has(fp)) continue;
            seen.add(fp);
            if (seen.size > maxSeen) {
              const arr = Array.from(seen);
              seen.clear();
              for (const x of arr.slice(-Math.floor(maxSeen * 0.8))) seen.add(x);
            }
            if (ts > lastTs) lastTs = ts;
            if (allowedTypes.size > 0 && !(e && allowedTypes.has(e.type))) continue;
            if (sessionFilter && !(e && e.payload && e.payload.sessionId === sessionFilter)) continue;
            if (cidFilter && !(e && e.payload && e.payload.correlationId === cidFilter)) continue;
            sseWrite(res, e.type || "event", e);
          }
        })
        .catch(() => {});
    }, pollMs);

    req.on("close", () => {
      stopped = true;
      clearInterval(heartbeat);
      clearInterval(poll);
      try {
        res.end();
      } catch (_) {}
    });
  } catch (err) {
    try {
      res.status(500).json({ ok: false, error: "stream_failed" });
    } catch (_) {}
  }
});

let ECHO_TOP3_DASH_REFRESH_INFLIGHT = null;

app.post("/tools/echo-top3-dashboard/refresh", async (req, res) => {
  try {
    if (ECHO_TOP3_DASH_REFRESH_INFLIGHT) {
      return res.status(202).json({ ok: true, inflight: true });
    }

    const timeoutMs = Math.max(5000, Math.min(Number(process.env.TOOLS_REFRESH_TIMEOUT_MS) || 240000, 600000));
    const maxBuffer = Math.max(1024 * 64, Math.min(Number(process.env.TOOLS_REFRESH_MAX_BUFFER) || 1024 * 1024 * 10, 1024 * 1024 * 50));

    ECHO_TOP3_DASH_REFRESH_INFLIGHT = true;
    execFile(
      "node",
      ["tools/echo-top3-dashboard.js"],
      {
        cwd: __dirname,
        env: process.env,
        timeout: timeoutMs,
        maxBuffer,
        windowsHide: true,
      },
      (err, stdout, stderr) => {
        ECHO_TOP3_DASH_REFRESH_INFLIGHT = null;
        if (err) {
          return res.status(500).json({
            ok: false,
            error: (err && err.message) || "refresh_failed",
            code: err && err.code ? err.code : null,
            signal: err && err.signal ? err.signal : null,
            stderr: String(stderr || "").slice(0, 4000),
          });
        }
        const out = String(stdout || "").trim();
        const lines = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        return res.json({ ok: true, paths: lines.slice(-2), stdout: out });
      }
    );
  } catch (e) {
    ECHO_TOP3_DASH_REFRESH_INFLIGHT = null;
    return res.status(500).json({ ok: false, error: (e && e.message) || "refresh_failed" });
  }
});

app.get("/pricing/plans", (req, res) => {
  res.json({ ok: true, ...getPlans() });
});

function getPromoDiscountPctPointsForPlan(planId) {
  const id = String(planId || "").trim().toLowerCase();
  if (id === "package_1") return Number(process.env.PROMO_DISCOUNT_PCT_P1 ?? 5);
  if (id === "package_2") return Number(process.env.PROMO_DISCOUNT_PCT_P2 ?? 4);
  if (id === "package_3") return Number(process.env.PROMO_DISCOUNT_PCT_P3 ?? 4);
  if (id === "package_4") return Number(process.env.PROMO_DISCOUNT_PCT_P4 ?? 3.5);
  return 0;
}

function getEffectiveDealsenseFeePct(sessionData) {
  const basePct = Number(process.env.DEALSENSE_FEE_PCT ?? 0.10);
  const discPts = sessionData && typeof sessionData.promoDiscountPctPoints === "number" ? sessionData.promoDiscountPctPoints : Number(sessionData && sessionData.promoDiscountPctPoints);
  const disc = Number.isFinite(discPts) ? discPts / 100 : 0;
  const out = basePct - disc;
  return Math.max(0, Math.min(basePct, out));
}

function computeDealsenseFee(savings, sessionData) {
  const s = typeof savings === "number" && Number.isFinite(savings) ? savings : Number(savings);
  if (!Number.isFinite(s) || s <= 0) return 0;
  const pct = getEffectiveDealsenseFeePct(sessionData);
  return Number((s * pct).toFixed(2));
}

function suggestUpgradePlanId(requiredCapability, currentPlanId) {
  const cap = String(requiredCapability || "").trim().toLowerCase();
  const cur = String(currentPlanId || "").trim().toLowerCase();
  if (!cap) return null;

  if (cap === "shopping") {
    if (cur === "free") return "package_1";
    if (cur === "package_1") return "package_2";
    return "package_4";
  }
  if (cap === "travel" || cap === "vacations" || cap === "insurance") {
    return "package_2";
  }
  if (cap === "finance") {
    return "package_4";
  }
  if (cap === "bills") {
    return "package_4";
  }
  return null;
}

function requireCapabilityOr402({ plan, capability, res, extra }) {
  const p = plan && typeof plan === "object" ? plan : null;
  const caps = (p && p.capabilities) || {};
  const key = String(capability || "").trim().toLowerCase();
  const allowed = key && caps && caps[key] === true;
  if (allowed) return true;
  const suggested = suggestUpgradePlanId(key, p && p.id);
  const suggestedPlan = suggested ? getPlanById(suggested) : null;
  res.status(402).json({
    ok: false,
    locked: true,
    error: "upgrade_required",
    requiredCapability: key,
    planId: (p && p.id) || "free",
    suggestedPlanId: suggested,
    codeRedeemPath: "/billing/redeem-code",
    suggestedPlanCodeEnabled: suggestedPlan ? suggestedPlan.codeEnabled === true : null,
    ...(extra || {}),
  });
  return false;
}

function getEffectivePlanFromSession(sessionData) {
  const planId = getEffectivePlanId(sessionData);
  return getPlanById(planId) || getPlanById("free") || { id: "free", capabilities: { shopping: true } };
}

app.post(
  "/billing/checkout",
  rateLimit({ windowMs: 60_000, max: Number(process.env.BILLING_RATE_LIMIT_PER_MIN) || 20 }),
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(501).json({ ok: false, error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." });
      }

      const body = req.body != null && typeof req.body === "object" ? req.body : {};
      const planId = typeof body.planId === "string" ? body.planId.trim().toLowerCase() : "";
      const session_id = typeof body.session_id === "string" ? body.session_id.trim() : null;
      const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : null;

      const plan = getPlanById(planId);
      if (!plan || plan.id === "free") {
        return res.status(400).json({ ok: false, error: "Invalid planId" });
      }

      const origin = getRequestOrigin(req);

      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/error`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: plan.currency,
              unit_amount: plan.priceCents,
              product_data: { name: `Dealsense ${plan.label}` },
            },
          },
        ],
        metadata: {
          planId: plan.id,
          session_id: session_id || "",
          fingerprint: fingerprint || "",
        },
      });

      return res.json({ ok: true, url: checkout.url, checkout_session_id: checkout.id });
    } catch (err) {
      console.error("Dealsense /billing/checkout error:", (err && err.message) || err);
      return res.status(500).json({ ok: false, error: "Checkout session creation failed." });
    }
  }
);

// Middle module (travel/insurance) – gated by plan capability.
// Placeholder endpoint for now: we will implement travel logic in this module later.
const PACKAGES_23_ENABLED = (() => {
  const raw = process.env.PACKAGES_23_ENABLED;
  if (raw == null || String(raw).trim() === "") return true;
  const v = String(raw).trim().toLowerCase();
  return v !== "0" && v !== "false";
})();

const PACKAGES_23_NEXT_ENABLED = (() => {
  const v = String(process.env.PACKAGES_23_NEXT_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();

const PACKAGES_2_SPLIT_ENABLED = (() => {
  const v = String(process.env.PACKAGES_2_SPLIT_ENABLED || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();

if (PACKAGES_2_SPLIT_ENABLED) {
  registerPackage2Travel(app, {
    rateLimit,
    getClientIP,
    getSession,
    getEffectivePlanFromSession,
    requireCapabilityOr402,
  });
  registerPackage2InsuranceVacations(app, {
    rateLimit,
    getClientIP,
    getSession,
    getEffectivePlanFromSession,
    requireCapabilityOr402,
  });
} else {
  if (PACKAGES_23_ENABLED) {
    registerPackage2(app, {
      rateLimit,
      getClientIP,
      getSession,
      getEffectivePlanFromSession,
      requireCapabilityOr402,
    });
  }

  if (PACKAGES_23_NEXT_ENABLED) {
    registerPackage2Next(app, {
      rateLimit,
      getClientIP,
      getSession,
      getEffectivePlanFromSession,
      requireCapabilityOr402,
    });
  }
}


// Billing routes moved to ./billing/routes

registerPackage1(app, {
  rateLimit,
  getClientIP,
  getSession,
  isLocked,
  getEffectivePlanFromSession,
  requireCapabilityOr402,
  suggestUpgradePlanId,
  parseEchoTop3Input,
  getTop3EchoOffers: getTop3EchoOffersCached,
  getEffectivePlanId,
});

const ENABLE_PACKAGE3 = (() => {
  const raw = process.env.ENABLE_PACKAGE3;
  if (raw == null || String(raw).trim() === "") return true;
  const v = String(raw).trim().toLowerCase();
  return v !== "0" && v !== "false";
})();

if (PACKAGES_23_ENABLED && ENABLE_PACKAGE3) {
  registerPackage3(app, {
    rateLimit,
    getClientIP,
    getSession,
    getEffectivePlanFromSession,
    requireCapabilityOr402,
  });
}

registerDocumentCore(app, {
  rateLimit,
});

registerMailIngest(app, {
  rateLimit,
  resolveOwnerEmailByToken,
  enqueueDocJob: kwantQueue && typeof kwantQueue.enqueue === "function" ? kwantQueue.enqueue : null,
  createDocJob: require("./document-pipeline").createDocJob,
});

registerDocumentPipeline(app, {
  requireAdmin,
  kwant: { claim: kwantQueue.claim, ack: kwantQueue.ack, fail: kwantQueue.fail },
});

// JWT Secret (w produkcji użyj zmiennej środowiskowej)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '30d';

const verifyToken = createVerifyToken(JWT_SECRET);

// Bills package: user inbound address (authenticated)
app.get("/api/v1/mail/inbound-address", verifyToken, async (req, res) => {
  try {
    const decoded = req.user;
    const email = decoded && typeof decoded.email === "string" ? decoded.email : "";
    const user = email ? USERS_DB.get(email) : null;
    if (!user) return res.status(401).json({ ok: false, error: "not_authenticated" });
    if (user.emailVerified !== true) {
      return res.status(403).json({ ok: false, error: "email_not_verified" });
    }

    const token = ensureUserInboundToken(user);
    if (!token) return res.status(500).json({ ok: false, error: "token_generation_failed" });

    const addresses = {
      package_2: `${token}+p2@${USER_INBOUND_DOMAIN}`,
      package_3: `${token}+p3@${USER_INBOUND_DOMAIN}`,
      package_4: `${token}+p4@${USER_INBOUND_DOMAIN}`,
    };
    return res.json({
      ok: true,
      token,
      addresses,
      rules: {
        senderMustMatchAccountEmail: true,
        accountEmail: user.email,
      },
      message: "Use the package-specific inbound address. Sender email must match your Dealsense account email. Other senders will be blocked.",
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "inbound_address_failed" });
  }
});

const STRIPE_SECRET_KEY = typeof process.env.STRIPE_SECRET_KEY === "string" ? process.env.STRIPE_SECRET_KEY.trim() : "";
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function getRequestOrigin(req) {
  const h = (name) => {
    const v = req && req.headers ? req.headers[name] : null;
    return typeof v === "string" ? v.trim() : Array.isArray(v) ? String(v[0] || "").trim() : "";
  };
  const origin = h("origin");
  if (origin) return origin;
  const forwardedProto = h("x-forwarded-proto");
  const forwardedHost = h("x-forwarded-host") || h("host");
  if (forwardedHost) {
    const proto = forwardedProto || "https";
    return `${proto}://${forwardedHost}`;
  }
  return (process.env.FRONTEND_URL || "").trim() || "http://localhost:3000";
}

// Email transporter (Magic Link)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Users database (in-memory, później MongoDB)
// Format: { email: { id, email, emailVerified, ageRange, country, region, scanCount, totalSavings, ... } }
const USERS_DB = new Map();

// Rezygnacje (usunięte konta) – do statystyk dashboardu
// Format: [ { email, deletedAt, country, ageRange } ]
const DELETED_USERS = [];

// Magic Link tokens (temporary storage)
// Format: { token: { email, expiresAt } }
const MAGIC_LINK_TOKENS = new Map();
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minut

registerAuthRoutes(app, {
  USERS_DB,
  DELETED_USERS,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  MAGIC_LINK_TOKENS,
  MAGIC_LINK_EXPIRY,
  emailTransporter,
  ensureUserInboundToken,
});

registerBillingRoutes(app, {
  rateLimit,
  stripe,
  getPlanById,
  applyPlanToSession,
  saveSessionToRedis,
  getClientIP,
  getSession,
  createCode,
  createPromoCode,
  redeemPromoCode,
  consumeCode,
  getEffectivePlanId,
  getPromoDiscountPctPointsForPlan,
});

// Session-based usage tracking (in-memory, można później przenieść do Redis)
// Format: { fingerprint+IP: { usageCount: number, unlocked: boolean, unlockSessionId: string, fingerprint: string, ip: string } }
const USER_SESSIONS = new Map();
const MAX_FREE_USES = 3;

// Silent price-monitoring alerts: show only when user opens Dealsense; no push. Keyed by sessionId.
const PRICE_ALERTS = new Map();
const PRICE_ALERTS_MAX_PER_SESSION = 5;
const PRICE_ALERTS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Pamięć produktu (darmowa warstwa „uczenia”) – ostatnia cena i decyzja per EAN/URL
const PRODUCT_MEMORY = new Map();
const PRODUCT_MEMORY_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dni

// Opcja C: kliknięcia w oferty – sklep -> liczba kliknięć (do rankingu 3 ofert)
const OFFER_CLICKS = new Map();
const OFFER_CLICK_BOOST_EURO = 2; // ile „euro” bonusu za popularność: score = price - BOOST * ln(1+clicks)
function getOfferClickBoost(seller) {
  if (!seller || typeof seller !== "string") return 0;
  const clicks = OFFER_CLICKS.get(seller.trim()) || 0;
  return OFFER_CLICK_BOOST_EURO * Math.log(1 + clicks);
}
const PRICING_ALWAYS_THREE = String(process.env.PRICING_ALWAYS_THREE || "").trim() === "1";
const PRICING_ENABLE_SELLER_ALIASES = (() => {
  const v = String(process.env.PRICING_ENABLE_SELLER_ALIASES || "").trim().toLowerCase();
  return v === "1" || v === "true";
})();
let PRICING_SELLER_ALIAS_MAP = {};
if (PRICING_ENABLE_SELLER_ALIASES) {
  const raw = String(process.env.PRICING_SELLER_ALIASES_JSON || "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        PRICING_SELLER_ALIAS_MAP = parsed;
      }
    } catch (_) {}
  }
}
function normalizeSellerKey(seller) {
  if (!seller || typeof seller !== "string") return "";
  const base = seller.trim().toLowerCase();
  if (!base) return "";
  if (!PRICING_ENABLE_SELLER_ALIASES) return base;
  const mapped = PRICING_SELLER_ALIAS_MAP && typeof PRICING_SELLER_ALIAS_MAP[base] === "string" ? PRICING_SELLER_ALIAS_MAP[base] : null;
  return mapped ? String(mapped).trim().toLowerCase() : base;
}
function offerDedupeKeyForSelection(o) {
  if (!o || typeof o !== "object") return "";
  return scoringOfferDedupeKeyForSelection(o);
}

function dedupeOffersForSelection(list) {
  return scoringDedupeOffersForSelection(list);
}

function pickTopUniqueSellers(list, limit) {
  return scoringPickTopUniqueSellers(list, limit);
}

function sortOffersByPriceAndPopularity(offers) {
  return scoringSortOffersByPriceAndPopularity(offers, getOfferClickBoost);
}

function getProductKey(ean, url) {
  if (ean && /^\d{8,14}$/.test(String(ean).trim())) return `ean:${String(ean).trim()}`;
  if (url && typeof url === "string") {
    try {
      const u = new URL(url);
      u.search = "";
      return `url:${u.hostname}${u.pathname}`;
    } catch (e) {}
  }
  return null;
}

async function getProductMemory(key) {
  if (!key) return null;
  try {
    const fromDb = await db.getProductMemory(key);
    if (fromDb) return fromDb;
  } catch (_) {}

  const entry = PRODUCT_MEMORY.get(key);
  if (!entry) return null;
  if (Date.now() - entry.lastSeenAt > PRODUCT_MEMORY_TTL_MS) {
    PRODUCT_MEMORY.delete(key);
    return null;
  }
  return { lastPrice: entry.lastPrice, lastDecision: entry.lastDecision, lastSeenAt: entry.lastSeenAt };
}

async function setProductMemory(key, data) {
  if (!key || !data) return;
  const entry = {
    lastPrice: data.lastPrice,
    lastDecision: data.lastDecision,
    lastSeenAt: data.lastSeenAt || Date.now(),
  };
  PRODUCT_MEMORY.set(key, entry);
  try {
    void db.setProductMemory(key, entry);
  } catch (_) {}
}

function confidenceFromNumeric(overall) {
  if (overall >= 0.85) return "high";
  if (overall >= 0.7) return "medium";
  return "low";
}

function addPriceAlert(sessionId, payload) {
  if (!sessionId || !payload || !payload.message) return;
  let list = PRICE_ALERTS.get(sessionId);
  if (!list) {
    list = [];
    PRICE_ALERTS.set(sessionId, list);
  }
  const now = Date.now();
  const alert = {
    id: `alert_${now}_${Math.random().toString(36).slice(2, 9)}`,
    message: payload.message,
    messageNl: payload.messageNl || payload.message,
    confidence: payload.confidence || "medium",
    type: payload.type || "better_offer",
    createdAt: now,
  };
  list.push(alert);
  list.sort((a, b) => b.createdAt - a.createdAt);
  const valid = list.filter((a) => now - a.createdAt < PRICE_ALERTS_EXPIRY_MS);
  if (valid.length > PRICE_ALERTS_MAX_PER_SESSION) valid.length = PRICE_ALERTS_MAX_PER_SESSION;
  PRICE_ALERTS.set(sessionId, valid);
  try {
    void db.addPriceAlert(sessionId, payload);
  } catch (_) {}
}

// Sekret do dostępu do panelu admina (ustaw ADMIN_SECRET w .env).
// Odzyskanie dostępu: ADMIN-RECOVERY.md w tym folderze.
const ADMIN_SECRET = (process.env.ADMIN_SECRET || '').trim().replace(/\r$/, '');

// Edge-case log (max 200) – przewaga: wiemy co się dzieje w nietypowych przypadkach
const EDGE_CASE_LOGS = [];
const EDGE_CASE_MAX = 200;

const EVENTS_LOG_PATH = (process.env.EVENTS_LOG_PATH || "").trim() || path.join(__dirname, "events.jsonl");
const UPSTASH_REDIS_REST_URL = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const UPSTASH_REDIS_REST_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
const EVENTS_REDIS_KEY = (process.env.EVENTS_REDIS_KEY || "").trim() || "dealsense:events";
const EVENTS_REDIS_MAX = Math.max(50, Math.min(Number(process.env.EVENTS_REDIS_MAX) || 500, 5000));

function isUpstashEnabled() {
  return !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

function upstashUrl(pathname) {
  const base = UPSTASH_REDIS_REST_URL.replace(/\/+$/, "");
  const p = String(pathname || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}

function upstashPost(pathname) {
  if (!isUpstashEnabled()) return;
  const url = upstashUrl(pathname);
  void axios
    .post(url, null, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      timeout: 1500,
      validateStatus: () => true,
    })
    .catch(() => {});
}

async function upstashGet(pathname, timeoutMs = 2000) {
  if (!isUpstashEnabled()) return null;
  try {
    const url = upstashUrl(pathname);
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      timeout: timeoutMs,
      validateStatus: () => true,
    });
    return resp && resp.data ? resp.data.result : null;
  } catch (_) {
    return null;
  }
}

function upstashSetex(key, ttlSeconds, value) {
  if (!isUpstashEnabled()) return;
  const k = encodeURIComponent(key);
  const ttl = Math.max(60, Math.min(Number(ttlSeconds) || 0, 60 * 60 * 24 * 365));
  const v = encodeURIComponent(value);
  upstashPost(`setex/${k}/${ttl}/${v}`);
}

async function readLastEventsFromRedis(limit) {
  if (!isUpstashEnabled()) return [];
  try {
    const take = Math.max(1, Math.min(Number(limit) || 50, 200));
    const key = encodeURIComponent(EVENTS_REDIS_KEY);
    const url = upstashUrl(`lrange/${key}/0/${take - 1}`);
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      timeout: 2000,
      validateStatus: () => true,
    });
    const result = resp && resp.data ? resp.data.result : null;
    if (!Array.isArray(result)) return [];
    const parsed = [];
    for (const line of result) {
      if (typeof line !== "string") continue;
      try {
        parsed.push(JSON.parse(line));
      } catch (_) {}
    }
    return parsed;
  } catch (_) {
    return [];
  }
}

function readLastEventsFromFile(limit) {
  try {
    const raw = fs.readFileSync(EVENTS_LOG_PATH, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const take = Math.max(1, Math.min(Number(limit) || 50, 200));
    const slice = lines.slice(-take);
    const parsed = [];
    for (const line of slice) {
      try {
        parsed.push(JSON.parse(line));
      } catch (_) {}
    }
    return parsed.reverse();
  } catch (_) {
    return [];
  }
}

function appendEvent(type, payload) {
  try {
    const t = typeof type === "string" ? type.trim() : "";
    if (!t) return;
    const dir = path.dirname(EVENTS_LOG_PATH);
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {}
    const entry = {
      type: t,
      payload: payload != null ? payload : {},
      timestamp: new Date().toISOString(),
    };
    const line = JSON.stringify(entry);
    fs.appendFile(EVENTS_LOG_PATH, line + "\n", () => {});
    if (isUpstashEnabled()) {
      const key = encodeURIComponent(EVENTS_REDIS_KEY);
      const value = encodeURIComponent(line);
      upstashPost(`lpush/${key}/${value}`);
      upstashPost(`ltrim/${key}/0/${EVENTS_REDIS_MAX - 1}`);
    }
  } catch (_) {}
}

function sseWrite(res, name, data) {
  try {
    if (name) res.write(`event: ${String(name).replace(/\r?\n/g, " ")}\n`);
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const lines = String(payload || "").split(/\r?\n/);
    for (const line of lines) res.write(`data: ${line}\n`);
    res.write("\n");
  } catch (_) {}
}

function safeJson(v) {
  try {
    return JSON.stringify(v);
  } catch (_) {
    return "[unstringifiable]";
  }
}

function eventFingerprint(entry) {
  try {
    const t = entry && typeof entry.timestamp === "string" ? entry.timestamp : "";
    const type = entry && typeof entry.type === "string" ? entry.type : "";
    const payload = entry && typeof entry.payload === "object" && entry.payload ? entry.payload : {};
    const raw = `${t}|${type}|${safeJson(payload)}`;
    return crypto.createHash("sha1").update(raw).digest("hex");
  } catch (_) {
    return String(Math.random());
  }
}

function logEdgeCase(type, reason, payload) {
  EDGE_CASE_LOGS.unshift({
    type,
    reason,
    payload: payload != null ? payload : {},
    timestamp: new Date().toISOString()
  });
  if (EDGE_CASE_LOGS.length > EDGE_CASE_MAX) EDGE_CASE_LOGS.length = EDGE_CASE_MAX;
  appendEvent("edge_case", { type, reason, payload: payload != null ? payload : {} });
}

// Sygnatura integralności ceny (HMAC) – przewaga: wynik nie do podrobienia
function priceIntegrityHash(basePrice, savings, ean, url) {
  const payload = JSON.stringify({
    p: basePrice,
    s: savings,
    e: ean || null,
    u: url ? String(url).slice(0, 200) : null,
    t: Math.floor(Date.now() / 60000)
  });
  return crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex").slice(0, 24);
}

// Helper: extract IP from request
function getClientIP(req) {
  return req.ip || 
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
    req.headers['x-real-ip'] || 
    req.connection?.remoteAddress || 
    'unknown';
}

// Helper: create session key from fingerprint + IP
function createSessionKey(fingerprint, ip) {
  // Używamy kombinacji fingerprint + IP jako klucz
  // To utrudnia obejście przez zmianę tylko jednego z nich
  return `fp:${fingerprint || 'unknown'}:ip:${ip || 'unknown'}`;
}

// Admin: sprawdzenie tokenu (nagłówek X-Admin-Token, query ?token= lub Bearer)
function requireAdmin(req, res, next) {
  if (!ADMIN_SECRET) {
    return res.status(503).json({ error: "Admin-dashboard niet geconfigureerd (ADMIN_SECRET ontbreekt)." });
  }
  let token = req.headers["x-admin-token"] || req.query.token || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ""));
  token = (token || '').trim().replace(/\r$/, '');
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Geen toegang." });
  }
  next();
}

const SESSIONS_REDIS_PREFIX = (process.env.SESSIONS_REDIS_PREFIX || "").trim() || "dealsense:sess:";
const SESSION_TTL_SECONDS = Math.max(60 * 60, Math.min(Number(process.env.SESSION_TTL_SECONDS) || 60 * 60 * 24 * 30, 60 * 60 * 24 * 365));

function buildDefaultSession(sessionId, fingerprint, ip) {
  return {
    usageCount: 0,
    optimizeCount: 0,
    paidScansRemaining: 0,
    unlocked: false,
    unlockSessionId: null,
    planId: "free",
    commissionPct: 10,
    planUpdatedAt: Date.now(),
    planMeta: null,
    createdAt: Date.now(),
    fingerprint: fingerprint || null,
    ip: ip || null,
    sessionId: sessionId || null
  };
}

function maskOfferSensitiveFields(offers) {
  if (!Array.isArray(offers)) return offers;
  return offers.map((o) => {
    if (!o || typeof o !== "object") return o;
    const x = { ...o };
    delete x.seller;
    delete x.url;
    return x;
  });
}

async function loadSessionFromRedis(sessionKey) {
  if (!isUpstashEnabled() || !sessionKey) return null;
  try {
    const key = `${SESSIONS_REDIS_PREFIX}${sessionKey}`;
    const raw = await upstashGet(`get/${encodeURIComponent(key)}`, 2000);
    if (!raw || typeof raw !== "string") return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function saveSessionToRedis(sessionKey, sessionData) {
  if (!isUpstashEnabled() || !sessionKey || !sessionData) return;
  try {
    const key = `${SESSIONS_REDIS_PREFIX}${sessionKey}`;
    upstashSetex(key, SESSION_TTL_SECONDS, JSON.stringify(sessionData));
  } catch (_) {}
}

// Helper: get or create session
// Jedna sesja = 3 darmowe skany łącznie (voice „Vertel” + scan z floating ikony) – ten sam licznik.
async function getSession(sessionId, fingerprint, ip) {
  const sid = sessionId && String(sessionId).trim();
  const sessionKey = sid
    ? sid
    : fingerprint
      ? createSessionKey(fingerprint, ip)
      : `ip:${ip || "unknown"}`;

  if (!USER_SESSIONS.has(sessionKey)) {
    const fromRedis = await loadSessionFromRedis(sessionKey);
    if (fromRedis) {
      USER_SESSIONS.set(sessionKey, fromRedis);
    } else {
      USER_SESSIONS.set(sessionKey, buildDefaultSession(sessionId, fingerprint, ip));
      saveSessionToRedis(sessionKey, USER_SESSIONS.get(sessionKey));
    }
  }
  const data = USER_SESSIONS.get(sessionKey);
  if (data && data.optimizeCount === undefined) data.optimizeCount = 0;
  if (data && typeof data.planId !== "string") data.planId = "free";
  if (data && typeof data.commissionPct !== "number") data.commissionPct = 10;
  if (data && data.planUpdatedAt === undefined) data.planUpdatedAt = Date.now();
  if (data && data.planMeta === undefined) data.planMeta = null;
  return { sessionId: sessionKey, data };
}

// Helper: check if user is locked
function isLocked(sessionData) {
  const used = sessionData && typeof sessionData.usageCount === "number" ? sessionData.usageCount : 0;
  const paidLeft = sessionData && typeof sessionData.paidScansRemaining === "number" ? sessionData.paidScansRemaining : 0;
  return used >= MAX_FREE_USES && paidLeft <= 0;
}

function consumeScanCredit(sessionData) {
  if (!sessionData) return { ok: false, locked: true };
  if (typeof sessionData.paidScansRemaining !== "number") sessionData.paidScansRemaining = 0;

  if (typeof sessionData.usageCount !== "number") sessionData.usageCount = 0;
  if (sessionData.usageCount < MAX_FREE_USES) {
    sessionData.usageCount += 1;
    return { ok: true, type: "free" };
  }
  if (sessionData.paidScansRemaining > 0) {
    sessionData.paidScansRemaining -= 1;
    sessionData.unlocked = sessionData.paidScansRemaining > 0;
    return { ok: true, type: "paid" };
  }
  return { ok: false, locked: true };
}

function applyDealScorePenalty(response, { applied, reason, noteNl }) {
  if (!response || typeof response !== "object") return;
  const base = typeof response.dealScore === "number" ? response.dealScore : Number(response.dealScore);
  const penaltyPct = 0.2;
  const adjusted = Number.isFinite(base) ? Math.max(0, Math.round(base * (1 - penaltyPct) * 100) / 100) : null;
  response.dealScoreAdjusted = applied ? adjusted : (Number.isFinite(base) ? base : null);
  response.dealScorePenaltyApplied = applied === true;
  response.dealScorePenaltyReason = applied ? (reason || "fallback") : null;
  response.dealScoreNote = applied ? (noteNl || "Dit is de beste aanbieding die we konden vinden; we hebben geen betere marktdata.") : null;
}

function markUnlockNotAllowed(response, reasonNl) {
  if (!response || typeof response !== "object") return;
  response.offerAvailableForUnlock = false;
  response.unlockAllowed = false;
  response.unlockNotAllowedReason = typeof reasonNl === "string" ? reasonNl : "Geen betere aanbieding gevonden.";
}

function setLastScanUnlockGate(sessionData, { offerAvailableForUnlock, reason }) {
  if (!sessionData || typeof sessionData !== "object") return;
  sessionData.lastScanOfferAvailableForUnlock = offerAvailableForUnlock === true;
  sessionData.lastScanOfferReason = typeof reason === "string" ? reason : null;
  sessionData.lastScanAt = Date.now();
}

// Attach savingsSummary, confidenceSummary, savingsDisplay (Layer 7 + 8)
function attachSavingsAndConfidence(response, opts) {
  const base_price = opts.base_price;
  const savings = opts.savings != null ? opts.savings : 0;
  const savingsPercent = opts.savingsPercent != null ? opts.savingsPercent : (base_price > 0 && savings > 0 ? (savings / base_price) * 100 : null);
  const visionConfidence = opts.visionConfidence ?? 1;
  const pricingConfidence = opts.pricingConfidence ?? 1;
  const comparisonConfidence = opts.comparisonConfidence ?? 0.7;
  const dataSource = opts.dataSource || "mock";

  const confidenceSummary = buildConfidenceSummary({
    vision: visionConfidence,
    pricing: pricingConfidence,
    comparison: comparisonConfidence,
  });
  const overall = confidenceSummary.overall;
  const canCalc = canCalculateSavings(overall);
  const savingsAbs = canCalc ? savings : null;
  const savingsPct = canCalc && base_price > 0 && savingsAbs != null ? (savingsAbs / base_price) * 100 : null;
  const feePct = getEffectiveDealsenseFeePct(opts && opts.sessionData ? opts.sessionData : null);
  const savingsSummary = buildSavingsSummary(savingsAbs, base_price, overall, feePct);
  const savingsDisplay = getSavingsDisplayCopy(overall, savingsSummary.absolute, savingsPct != null ? savingsPct : null);

  response.confidenceSummary = confidenceSummary;
  response.savingsSummary = savingsSummary;
  response.savingsDisplay = savingsDisplay;
  response.unlockAllowed = allowUnlock(overall);
  return response;
}

// Helper: filter sensitive data if locked (Layer 6: unlock only if confidence >= 0.75)
function filterSensitiveData(response, sessionData) {
  const advisory = getAdvisoryFraming();
  const neutralOutcome = response && response.neutralOutcome === true;
  const savingsIsZero = response && typeof response.savings === "number" && response.savings <= 0;
  if (neutralOutcome || savingsIsZero) {
    response.locked = false;
    response.usage_count = sessionData.usageCount;
    response.unlocked = sessionData.unlocked;
    response.planId = getEffectivePlanId(sessionData);
    response.advisoryFraming = advisory;
    return response;
  }
  if (isLocked(sessionData)) {
    const summary = response && typeof response === "object" ? response.savingsSummary : null;
    const allowed = response && response.unlockAllowed === true && summary && summary.unlockPrice != null;

    const basePrice = response && typeof response.base_price === "number" ? response.base_price : null;
    const bestPrice = (() => {
      const best = response && response.best_offer && typeof response.best_offer === "object" ? response.best_offer : null;
      const p = best && typeof best.price === "number" ? best.price : null;
      return p;
    })();
    const savings = response && typeof response.savings === "number" ? response.savings : (basePrice != null && bestPrice != null ? Number((basePrice - bestPrice).toFixed(2)) : null);

    return {
      locked: true,
      message: "Er lijkt een goedkopere aanbieding beschikbaar. Ontgrendel om onze aanbeveling te zien. Dit is geen opdracht; jij beslist.",
      advisoryFraming: advisory,
      usage_count: sessionData.usageCount,
      planId: getEffectivePlanId(sessionData),
      unlock_fee: allowed ? summary.unlockPrice : null,
      base_price: basePrice,
      found_price: bestPrice,
      savings: savings,
    };
  }
  response.locked = false;
  response.usage_count = sessionData.usageCount;
  response.unlocked = sessionData.unlocked;
  response.planId = getEffectivePlanId(sessionData);
  response.advisoryFraming = advisory;
  return response;
}

/**
 * Scam detector
 */
function isScam(offer, marketAvg) {
  return scoringIsScam(offer, marketAvg);
}

function computeTitleMatchScore(queryText, offerTitle) {
  return scoringComputeTitleMatchScore(queryText, offerTitle);
}

// Auth routes moved to ./auth/routes

// verifyToken moved to ./auth (JWT-based middleware)

app.get("/debug-stripe", (req, res) => {
  res.json({
    ok: true,
    stripeConfigured: !!stripe,
    stripeSecretKeyPrefix: STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.slice(0, 7) : null,
  });
});

app.post("/create-payment", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({ ok: false, error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." });
    }

    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const amount = Number(body.amount);
    const currency = typeof body.currency === "string" ? body.currency.trim().toLowerCase() : "eur";
    const session_id = typeof body.session_id === "string" ? body.session_id.trim() : "";

    if (!Number.isFinite(amount) || amount <= 0 || Math.floor(amount) !== amount) {
      return res.status(400).json({ ok: false, error: "amount must be a positive integer (in minor units, e.g. cents)." });
    }
    if (!/^[a-z]{3}$/.test(currency)) {
      return res.status(400).json({ ok: false, error: "currency must be a 3-letter code (e.g. eur)." });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: session_id ? { session_id } : undefined,
    });

    return res.json({
      ok: true,
      payment_intent_id: intent.id,
      client_secret: intent.client_secret,
    });
  } catch (err) {
    console.error("Dealsense /create-payment error:", (err && err.message) || err);
    return res.status(500).json({ ok: false, error: "Payment creation failed." });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({ ok: false, error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." });
    }

    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const amount = Number(body.amount);
    const currency = typeof body.currency === "string" ? body.currency.trim().toLowerCase() : "eur";
    const savedAmount = typeof body.savedAmount === "string" ? body.savedAmount.trim() : (body.savedAmount != null ? String(body.savedAmount) : "0.10");

    if (!Number.isFinite(amount) || amount <= 0 || Math.floor(amount) !== amount) {
      return res.status(400).json({ ok: false, error: "amount must be a positive integer (in minor units, e.g. cents)." });
    }
    if (!/^[a-z]{3}$/.test(currency)) {
      return res.status(400).json({ ok: false, error: "currency must be a 3-letter code (e.g. eur)." });
    }

    const origin = getRequestOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/error`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: { name: "Dealsense unlock" },
          },
        },
      ],
      metadata: {
        savedAmount,
      },
    });

    return res.json({ ok: true, url: session.url, session_id: session.id });
  } catch (err) {
    console.error("Dealsense /create-checkout-session error:", (err && err.message) || err);
    return res.status(500).json({ ok: false, error: "Checkout session creation failed." });
  }
});

app.get("/success", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).send("Error");
    }

    const sessionId = typeof req.query.session_id === "string" ? req.query.session_id.trim() : "";
    if (!sessionId) {
      return res.status(400).send("Error");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = session && session.metadata ? session.metadata : null;
    const savedAmount = meta && typeof meta.savedAmount === "string" ? meta.savedAmount.trim() : "";
    const intentId = session && typeof session.payment_intent === "string" ? session.payment_intent.trim() : "";
    if (!intentId) {
      return res.status(400).send("Error");
    }
    const intent = await stripe.paymentIntents.retrieve(intentId);
    const intentOk = intent && intent.status === "succeeded";

    const serverTime = new Date().toLocaleString("pl-PL");

    if (intentOk && savedAmount === "0.10") {
      return res.status(200).type("html").send(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Klar</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:18px;"><h1 style="margin:0 0 10px;">Klar</h1><div style="color:#334155;">Czas serwera: <strong>${serverTime}</strong></div></body></html>`);
    }
    return res.status(400).type("html").send(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:18px;"><h1 style="margin:0 0 10px;">Error</h1><div style="color:#334155;">Czas serwera: <strong>${serverTime}</strong></div></body></html>`);
  } catch (err) {
    console.error("Dealsense /success error:", (err && err.message) || err);
    return res.status(500).send("Error");
  }
});

app.get("/error", (req, res) => {
  const serverTime = new Date().toLocaleString("pl-PL");
  res.status(400).type("html").send(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:18px;"><h1 style="margin:0 0 10px;">Error</h1><div style="color:#334155;">Czas serwera: <strong>${serverTime}</strong></div></body></html>`);
});

/**
 * POST /unlock
 * Odblokowuje dostęp po płatności (Stripe webhook)
 */
app.post("/unlock", async (req, res) => {
  try {
    const { session_id, payment_intent_id, fingerprint } = req.body;
    
    if (!session_id && !fingerprint) {
      return res.status(400).json({ error: "Geen session_id of fingerprint opgegeven." });
    }
    
    // Pobierz IP klienta
    const clientIP = getClientIP(req);
    
    // Użyj fingerprint + IP jako klucz (tak samo jak w /scan)
    const sessionKey = fingerprint ? createSessionKey(fingerprint, clientIP) : session_id;
    const { sessionId, data: sessionData } = await getSession(session_id, fingerprint, clientIP);

    const gateTtlMs = Math.max(60 * 1000, Math.min(Number(process.env.UNLOCK_GATE_TTL_MS) || 10 * 60 * 1000, 60 * 60 * 1000));
    const lastAt = typeof sessionData.lastScanAt === "number" ? sessionData.lastScanAt : 0;
    const gateFresh = lastAt > 0 && Date.now() - lastAt <= gateTtlMs;
    const gateOk = gateFresh && sessionData.lastScanOfferAvailableForUnlock === true;
    if (!gateOk) {
      return res.status(409).json({
        ok: false,
        error: "unlock_not_allowed",
        reason: sessionData.lastScanOfferReason || "no_offer",
      });
    }
    
    // W przyszłości: weryfikacja płatności przez Stripe webhook
    // Na razie: traktuj jako legacy unlock i nadaj plan package_4 (silnik rachunków).
    // Zachowuje to spójność z systemem pakietów/capabilities.
    const applied = applyPlanToSession(sessionData, "package_4", {
      via: "legacy_unlock",
      payment_intent_id: payment_intent_id || null,
    });
    if (!applied || applied.ok !== true) {
      return res.status(500).json({ error: "Fout bij ontgrendelen." });
    }
    sessionData.unlockSessionId = payment_intent_id || `unlock_${Date.now()}`;
    saveSessionToRedis(sessionId, sessionData);
    
    res.json({
      status: "success",
      message: "Toegang ontgrendeld! Je hebt 1 betaalde scan.",
      session_id: sessionKey,
      unlocked: sessionData.unlocked,
      paidScansRemaining: sessionData.paidScansRemaining,
      planId: getEffectivePlanId(sessionData)
    });
  } catch (err) {
    console.error("Dealsense /unlock error:", err.message);
    res.status(500).json({ error: "Fout bij ontgrendelen." });
  }
});

/**
 * GET /api/price-alerts
 * Silent price-monitoring alerts: show only when user opens Dealsense. No push. Returns and consumes alerts for this session.
 */
app.get("/api/price-alerts", async (req, res) => {
  try {
    const session_id = typeof req.query.session_id === "string" ? req.query.session_id.trim() : null;
    const fingerprint = typeof req.query.fingerprint === "string" ? req.query.fingerprint.trim() : null;
    const clientIP = getClientIP(req);
    const { sessionId } = await getSession(session_id, fingerprint, clientIP);

    // Prefer MongoDB if available; fallback to in-memory.
    let alerts = [];
    try {
      alerts = await db.consumePriceAlerts(sessionId, PRICE_ALERTS_MAX_PER_SESSION);
    } catch (_) {}
    if (Array.isArray(alerts) && alerts.length > 0) {
      return res.json({ ok: true, alerts });
    }

    const list = PRICE_ALERTS.get(sessionId) || [];
    const now = Date.now();
    const valid = list.filter((a) => now - a.createdAt < PRICE_ALERTS_EXPIRY_MS);
    PRICE_ALERTS.set(sessionId, []); // consume: show once
    res.json({ ok: true, alerts: valid });
  } catch (err) {
    console.error("Dealsense /api/price-alerts error:", (err && err.message) || err);
    res.json({ ok: true, alerts: [] });
  }
});

/**
 * GET /api/advisory-copy
 * Legal-safe framing copy for frontend (T&C hooks, footer, disclaimers). Single source of truth with advisory-copy.js.
 */
app.get("/api/advisory-copy", (req, res) => {
  res.json({
    termsHooks: TERMS_HOOKS,
    footerNl: getFooterFramingNl(),
    apiFraming: API_FRAMING,
  });
});

app.get("/config", (req, res) => {
  res.json({
    hasGoogleShoppingAPI: !!process.env.GOOGLE_SHOPPING_API_KEY,
    useMockFallback: true,
    dataSource: process.env.GOOGLE_SHOPPING_API_KEY ? "google_shopping" : "mock"
  });
});

/**
 * GET /api/connectors
 * Lista dostępnych konektorów porównywarek (do testów i przyszłego UI).
 */
app.get("/api/connectors", (req, res) => {
  const ids = connectorsRegistry.getConnectorIds();
  const list = ids.map((id) => {
    const c = connectorsRegistry.getConnector(id);
    return { id: c.id, name: c.name };
  });
  res.json({ connectors: list });
});

/**
 * POST /api/test-connector
 * Test konektora: zwraca oferty dla danego zapytania. Rate limit 2s per konektor.
 * Body: { connectorId: string, query: string, ean?: string }
 */
app.post("/api/test-connector", async (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const connectorId = typeof body.connectorId === "string" ? body.connectorId.trim() : "";
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const ean = typeof body.ean === "string" ? body.ean.trim() : null;
    if (!connectorId) {
      return res.status(400).json({ error: "connectorId is required", connectors: connectorsRegistry.getConnectorIds() });
    }
    const result = await connectorsRegistry.runConnector(connectorId, query, ean);
    res.json({
      ok: !result.error,
      connectorId: result.connectorId,
      connectorName: result.connectorName,
      query: query || null,
      ean: ean || null,
      offers: result.offers,
      offerCount: (result.offers && result.offers.length) || 0,
      durationMs: result.durationMs,
      error: result.error || undefined,
    });
  } catch (err) {
    console.error("Dealsense /api/test-connector error:", (err && err.message) || err);
    res.status(500).json({ ok: false, error: (err && err.message) || "Server error" });
  }
});

/**
 * POST /api/feedback
 * Opcja C: rejestracja kliknięć w oferty – do rankingu (które 3 oferty pokazywać).
 */
app.post("/api/feedback", (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const event = typeof body.event === "string" ? body.event.trim() : "";
    if (event !== "click_offer") {
      return res.status(400).json({ ok: false, error: "Unsupported event type" });
    }
    const seller = typeof body.seller === "string" ? body.seller.trim() : "";
    if (!seller) {
      return res.status(400).json({ ok: false, error: "seller is required for click_offer" });
    }
    const key = seller;
    OFFER_CLICKS.set(key, (OFFER_CLICKS.get(key) || 0) + 1);
    appendEvent("feedback", { event: "click_offer", seller });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/query
 * "Vertel wat je nodig hebt" – natural language query → 3 product suggestions.
 * Uses the same session and 3-free counter as /scan (total free Dealsense scans remain 3).
 */
app.post("/api/query", async (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const session_id = typeof body.session_id === "string" ? body.session_id.trim() : null;
    const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : null;
    const clientIP = getClientIP(req);

    const dbg =
      String(req.query && req.query.debug ? req.query.debug : "").trim() === "1" ||
      String(req.headers["x-debug"] || "").trim() === "1";
    if (dbg) {
      console.log("[Dealsense][api/query]", {
        queryLen: query.length,
        queryPreview: query.slice(0, 120),
        hasSession: !!session_id,
        hasFingerprint: !!fingerprint,
        ip: clientIP,
      });
    }

    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        user = USERS_DB.get(decoded.email);
      } catch (err) {}
    }
    const sessionKey = user ? `user:${user.id}:${fingerprint}:${clientIP}` : null;
    const { sessionId, data: sessionData } = await getSession(session_id || sessionKey, fingerprint, clientIP);

    if (query.length === 0) {
      return res.status(400).json({
        error: "Voer een zoekopdracht in (bijv. goedkope laptop voor kantoor, max €600).",
        usage_count: sessionData.usageCount,
      });
    }

    const guardResult = await guardrails.runGuardrails(query);
    if (!guardResult.allowed) {
      return res.status(400).json({
        error: guardResult.error || guardrails.WRONG_CONTEXT_MESSAGE,
        code: "WRONG_CONTEXT",
        usage_count: sessionData.usageCount,
      });
    }

    // Consume one free scan or one paid scan credit (if available).
    const credit = consumeScanCredit(sessionData);
    if (!credit.ok) {
      return res.status(402).json({
        ok: false,
        locked: true,
        error: "Limit bereikt. Ontgrendel om verder te gaan.",
        usage_count: sessionData.usageCount,
        paidScansRemaining: sessionData.paidScansRemaining || 0,
      });
    }
    saveSessionToRedis(sessionId, sessionData);

    const marketOffers = await fetchMarketOffers(query, null);
    const raw = Array.isArray(marketOffers) ? marketOffers : [];
    const sorted = sortOffersByPriceAndPopularity(raw);
    const suggestions = sorted.slice(0, 3).map((o) => ({
      seller: o.seller,
      price: o.price,
      currency: o.currency || "EUR",
      title: o.title || query,
      url: o.url,
      reviewScore: o.reviewScore,
      reviewCount: o.reviewCount,
    }));

    const suggestionsForClient = isLocked(sessionData) ? maskOfferSensitiveFields(suggestions) : suggestions;

    res.json({
      ok: true,
      usage_count: sessionData.usageCount,
      suggestions: suggestionsForClient,
      recommendedIndex: 0,
      query,
      advisoryFraming: getAdvisoryFraming(),
      locked: isLocked(sessionData),
    });
  } catch (err) {
    console.error("Dealsense /api/query error:", (err && err.message) || err);
    res.status(500).json({
      ok: false,
      error: "Er ging iets mis. Probeer het opnieuw.",
    });
  }
});

/**
 * POST /scan
 * GŁÓWNY ENDPOINT DEALSENSE
 * Teraz z integracją prawdziwego API rynkowego
 */
app.post("/scan", async (req, res) => {
  const {
    base_price,
    product_name,
    model,
    availability,
    ean,
    url,
    delivery_time, // Czas dostawy ze strony produktu (w dniach, np. "1-3" lub "2")
    session_id, // Session ID z frontendu (lokalne śledzenie użyć)
    fingerprint, // Device fingerprint z fingerprintjs
    visionConfidence, // from vision pipeline (0–1); default 1 if manual price
    pricingConfidence, // from price normalizer (0–1); default 1
    billingPeriod // monthly | weekly | daily | yearly (from vision or normalizer); for cost normalization
  } = req.body;

  // Sprawdź czy użytkownik jest zalogowany (opcjonalne)
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      user = USERS_DB.get(decoded.email);
    } catch (err) {
      // Ignoruj błędy tokena - użytkownik może być niezalogowany
    }
  }

  // Pobierz IP klienta
  const clientIP = getClientIP(req);
  
  // Pobierz lub utwórz sesję użytkownika (używając fingerprint + IP jako klucz)
  // Jeśli użytkownik jest zalogowany, użyj jego user ID jako część klucza
  const sessionKey = user ? `user:${user.id}:${fingerprint}:${clientIP}` : null;
  const { sessionId, data: sessionData } = await getSession(session_id || sessionKey, fingerprint, clientIP);

  const effectivePlanId = getEffectivePlanId(sessionData);
  const plans = getPlans();
  const basePriceNum = typeof base_price === "number" ? base_price : Number(base_price);
  const enforceMaxBasePriceLock = (() => {
    const v = String(process.env.ENABLE_MAX_BASE_PRICE_LOCK || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const configuredMax = (() => {
    const v = String(process.env.MAX_BASE_PRICE_EUR || "").trim();
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  })();
  const freeMax = configuredMax != null ? configuredMax : plans.freeMaxBasePrice;
  if (enforceMaxBasePriceLock && effectivePlanId === "free" && Number.isFinite(basePriceNum) && basePriceNum > freeMax) {
    return res.status(402).json({
      ok: false,
      locked: true,
      error: "upgrade_required",
      maxBasePrice: freeMax,
      planId: effectivePlanId,
      usage_count: sessionData.usageCount,
      paidScansRemaining: sessionData.paidScansRemaining || 0,
    });
  }

  appendEvent("scan_requested", {
    sessionId,
    hasUser: !!user,
    base_price: typeof base_price === "number" ? base_price : Number(base_price),
    product_name: typeof product_name === "string" ? product_name.slice(0, 200) : null,
    ean: typeof ean === "string" ? ean.slice(0, 32) : null,
    url: typeof url === "string" ? url.slice(0, 400) : null,
  });
  
  // Consume one free scan or one paid scan credit (if available).
  const credit = consumeScanCredit(sessionData);
  if (!credit.ok) {
    return res.status(402).json({
      ok: false,
      locked: true,
      error: "Limit bereikt. Ontgrendel om verder te gaan.",
      usage_count: sessionData.usageCount,
      paidScansRemaining: sessionData.paidScansRemaining || 0,
      planId: effectivePlanId,
    });
  }
  saveSessionToRedis(sessionId, sessionData);

  // 🔴 GOUden REGEL
  if (!base_price || base_price <= 0) {
    logEdgeCase("invalid_price", "Geen basisprijs of prijs <= 0", { url, ean });
    return res.status(400).json({
      error: "Geen basisprijs — we raden niet."
    });
  }

  // alleen beschikbare producten
  if (availability !== "in_stock") {
    logEdgeCase("availability", "Product niet beschikbaar", { availability, url });
    return res.json({
      decision: "hold",
      message: "We kunnen geen advies geven: het product lijkt niet beschikbaar. Controleer dit zelf voordat je beslist.",
      savings: 0
    });
  }

  // Automatyczne rozpoznawanie branży (elektronika, budowlanka, wakacje, ubezpieczenia, itd.)
  const { slug: category, label: categoryLabel } = detectCategory({ url: url || "", productName: product_name || "" });

  const productKey = getProductKey(ean, url);
  const previousScan = await getProductMemory(productKey);

  // 🔥 INTEGRACJA Z PRAWDZIWYM API RYNKOWYM
  let marketOffers = [];
  let pendingMarket = false;
  let marketFetchMs = 0;
  const MAX_MARKET_WAIT_MS = (() => {
    const v = Number(process.env.MARKET_MAX_WAIT_MS);
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 900;
  })();
  
  // Jeśli mamy EAN, szukaj najpierw w bol.com (najbardziej precyzyjne)
  if (ean && /^\d{13}$/.test(ean)) {
    try {
      const bolOffer = await searchBolComByEAN(ean);
      if (bolOffer && bolOffer.price) {
        // Wyciągnij czas dostawy z bol.com API (jeśli dostępny)
        let deliveryTime = null;
        if (bolOffer.delivery) {
          // bol.com zwraca promise w formacie tekstowym (np. "Morgen in huis", "1-2 werkdagen")
          const deliveryText = String(bolOffer.delivery).toLowerCase();
          if (deliveryText.includes("morgen") || deliveryText.includes("tomorrow")) {
            deliveryTime = 1;
          } else {
            const dayMatch = deliveryText.match(/(\d+)/);
            if (dayMatch) {
              deliveryTime = parseInt(dayMatch[1]);
            }
          }
        }
        
        marketOffers.push({
          seller: bolOffer.seller || "bol.com",
          price: bolOffer.price,
          currency: bolOffer.currency || "EUR",
          availability: bolOffer.availability === "in_stock" ? "in_stock" : "out_of_stock",
          reviewScore: 4.5, // bol.com ma dobre oceny
          reviewCount: 1000, // Przykładowa liczba opinii
          url: bolOffer.url || `https://www.bol.com/nl/nl/p/-/${ean}/`,
          title: bolOffer.title || product_name || "",
          source: "bol.com",
          ean: ean,
          deliveryTime: deliveryTime || 1 // Domyślnie 1 dzień dla bol.com
        });
      }
    } catch (error) {
      // Ignoruj błędy bol.com API - użyjemy innych źródeł
    }
  }
  
  // Jeśli nie znaleziono ofert w bol.com lub nie ma EAN, użyj innych źródeł
  if (marketOffers.length === 0) {
    try {
      const start = Date.now();
      const fetchPromise = fetchMarketOffers(product_name || "", ean || null);
      const timeoutToken = Symbol("market_timeout");
      const raced = await Promise.race([
        fetchPromise,
        new Promise((resolve) => setTimeout(() => resolve(timeoutToken), MAX_MARKET_WAIT_MS)),
      ]);
      marketFetchMs = Date.now() - start;
      if (raced === timeoutToken) {
        pendingMarket = true;
        // Continue in background to warm caches; ignore errors.
        const correlationId = `market_${sessionId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        appendEvent("market_pending", {
          sessionId,
          correlationId,
          ean: ean || null,
          product_name: product_name || null,
          base_price: base_price,
          startedAt: new Date().toISOString(),
        });
        void fetchPromise
          .then((offers) => {
            const count = Array.isArray(offers) ? offers.length : 0;
            appendEvent("market_ready", {
              sessionId,
              correlationId,
              ean: ean || null,
              product_name: product_name || null,
              offersCount: count,
              finishedAt: new Date().toISOString(),
            });
          })
          .catch(() => {
            appendEvent("market_failed", {
              sessionId,
              correlationId,
              ean: ean || null,
              product_name: product_name || null,
              finishedAt: new Date().toISOString(),
            });
          });
      } else {
        marketOffers = raced;
      }
    } catch (error) {
      // Fallback do mock danych jeśli API nie działa (mock dane są celowo używane)
      marketOffers = require("./market-api").MOCK_OFFERS;
    }
  }

  if (pendingMarket) {
    const response = {
      decision: "buy_now",
      base_price,
      savings: 0,
      marketAvg: base_price,
      offers: [],
      dataSource: process.env.GOOGLE_SHOPPING_API_KEY ? "google_shopping" : "mock",
      pending: true,
      marketFetchMs,
      dealScore: 3,
      dealConfidence: "laag",
      integrityHash: priceIntegrityHash(base_price, 0, ean, url),
      costNormalization: buildCostNormalization(base_price, billingPeriod, "EUR"),
      usage_count: sessionData.usageCount,
      planId: getEffectivePlanId(sessionData),
      session_id: sessionId,
    };
    setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: false, reason: "pending_market" });
    saveSessionToRedis(sessionId, sessionData);
    return res.json(response);
  }
  
  // Jeśli mock oferty nie pasują do ceny bazowej, wygeneruj dynamiczne
  // (mock oferty są dla laptopów ~450 EUR, nie pasują do innych produktów)
  if (marketOffers.length > 0 && base_price > 0) {
    const avgMockPrice = marketOffers.reduce((s, o) => s + o.price, 0) / marketOffers.length;
    const priceRatio = base_price / avgMockPrice;
    
    // Jeśli cena bazowa różni się o więcej niż 50% od średniej mock ofert,
    // wygeneruj nowe dynamiczne oferty pasujące do tego produktu
    if (priceRatio < 0.5 || priceRatio > 2.0) {
      // Wyciszamy logi - dynamiczne generowanie ofert działa automatycznie
      
      // Generuj 3 oferty w zakresie ±30% od ceny bazowej
      const offer1 = base_price * 0.85; // 15% taniej
      const offer2 = base_price * 0.95; // 5% taniej  
      const offer3 = base_price * 1.10; // 10% drożej
      
      marketOffers = [
        {
          seller: "TechStore",
          price: Number(offer1.toFixed(2)),
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.0,
          reviewCount: Math.floor(Math.random() * 500) + 100,
          url: "https://example.com/product/1"
        },
        {
          seller: "ElectroShop",
          price: Number(offer2.toFixed(2)),
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 4.3,
          reviewCount: Math.floor(Math.random() * 300) + 50,
          url: "https://example.com/product/2"
        },
        {
          seller: "BudgetTech",
          price: Number(offer3.toFixed(2)),
          currency: "EUR",
          availability: "in_stock",
          reviewScore: 3.8,
          reviewCount: Math.floor(Math.random() * 100) + 20,
          url: "https://example.com/product/3"
        }
      ];
    }
  }

  // średnia rynkowa (tylko z ofert w podobnym zakresie cenowym ±100% od ceny bazowej)
  // To filtruje oferty dla innych produktów
  let relevantOffers = marketOffers.filter(o => {
    if (base_price <= 0) return true;
    // Oferta jest "relevant" jeśli jest w zakresie 0.5x - 2x ceny bazowej
    const ratio = o.price / base_price;
    return ratio >= 0.5 && ratio <= 2.0;
  });

  relevantOffers = relevantOffers.map((o) => normalizeOfferDeliveryDays(o));
  
  const marketAvg =
    relevantOffers.length > 0
      ? relevantOffers.reduce((s, o) => s + o.price, 0) / relevantOffers.length
      : base_price; // Fallback: użyj ceny bazowej jeśli brak relevant ofert

  // Layer 3: comparison confidence (best offer valid only if >= 0.7)
  const dataSource = process.env.GOOGLE_SHOPPING_API_KEY ? "google_shopping" : "mock";
  let comparisonConfidence = dataSource === "google_shopping" ? 0.85 : 0.7;
  if (relevantOffers.length <= 1) comparisonConfidence = Math.min(comparisonConfidence, 0.65);

  // Functie voor formatteren van levertijd (bijv. "1 dag", "2 dagen", "1-3 dagen")
  const formatDeliveryTime = (days) => {
    if (!days || days <= 0) return null;
    if (typeof days === 'string') {
      // Ondersteuning voor bereiken zoals "1-3" of "2-5"
      const range = days.split('-').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      if (range.length === 2) {
        return `${range[0]}-${range[1]} dagen`;
      } else if (range.length === 1) {
        return range[0] === 1 ? "1 dag" : `${range[0]} dagen`;
      }
    }
    const numDays = typeof days === 'number' ? days : parseInt(days);
    if (isNaN(numDays)) return null;
    return numDays === 1 ? "1 dag" : `${numDays} dagen`;
  };

  // Oblicz średni czas dostawy z wszystkich ofert (dla podsumowania)
  const calculateAverageDeliveryTime = (offers) => {
    const deliveryTimes = offers
      .map(o => o.deliveryTime || o.delivery_time)
      .filter(dt => dt != null && dt > 0);
    
    if (deliveryTimes.length === 0) return null;
    
    // Jeśli są zakresy (np. "1-3"), bierz średnią z zakresu
    const numericTimes = deliveryTimes.map(dt => {
      if (typeof dt === 'string' && dt.includes('-')) {
        const [min, max] = dt.split('-').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
        if (min && max) return (min + max) / 2;
      }
      return typeof dt === 'number' ? dt : parseInt(dt);
    }).filter(dt => !isNaN(dt) && dt > 0);
    
    if (numericTimes.length === 0) return null;
    
    const avg = numericTimes.reduce((sum, dt) => sum + dt, 0) / numericTimes.length;
    return Math.round(avg * 10) / 10; // Zaokrąglij do 1 miejsca po przecinku
  };

  // Generuj review points dla każdej oferty osobno (przypisane do konkretnego sklepu)
  // W prawdziwej implementacji te dane będą z API sklepów
  // WAŻNE: Sklep nie może mieć jednocześnie pozytywnych i negatywnych cech tego samego typu
  const generateReviewPoints = (offer, avgDeliveryTime = null) => {
    if (!offer.reviewScore || !offer.reviewCount) return { positive: [], negative: [] };
    
    const score = offer.reviewScore;
    const positive = [];
    const negative = [];
    
    // Realne parametry dostawy zamiast ogólnych "Szybka dostawa"
    const offerDeliveryTime = offer.deliveryTime || offer.delivery_time;
    let deliveryText = null;
    
    if (offerDeliveryTime) {
      deliveryText = formatDeliveryTime(offerDeliveryTime);
    } else if (avgDeliveryTime) {
      deliveryText = formatDeliveryTime(avgDeliveryTime);
    }
    
    // Als beoordeling >= 4.0, alleen positieve punten (zonder negatieve)
    if (score >= 4.0) {
      if (score >= 4.5) {
        positive.push("Professionele service");
        positive.push("Probleemloze retouren");
        if (deliveryText) {
          positive.push(`Levering: ${deliveryText}`);
        } else {
          positive.push("Snelle levering");
        }
      } else {
        if (deliveryText) {
          positive.push(`Levering: ${deliveryText}`);
        } else {
          positive.push("Snelle levering");
        }
        positive.push("Goed klantcontact");
        positive.push("Producten zoals beschreven");
      }
    }
    // Als beoordeling < 4.0, alleen negatieve punten (zonder positieve)
    else {
      if (score < 3.5) {
        if (deliveryText) {
          negative.push(`Levering: ${deliveryText}`);
        } else {
          negative.push("Langzame levering");
        }
        negative.push("Communicatieproblemen");
        negative.push("Producten niet zoals beschreven");
        negative.push("Problemen met retouren");
        negative.push("Slechte klantenservice");
      } else {
        if (deliveryText) {
          negative.push(`Levering: ${deliveryText}`);
        } else {
          negative.push("Langzame levering");
        }
        negative.push("Communicatieproblemen");
      }
    }
    
    return {
      positive: positive.slice(0, 3), // Max 3 najlepsze
      negative: negative.slice(0, 3)  // Max 3 najgorsze
    };
  };
  
  // Agregacja review z wszystkich ofert (tylko dla podsumowania)
  // Używamy tylko pozytywnych ofert (nie scam) do agregacji
  const safeOffersForReview = relevantOffers.filter(o => {
    const scam = isScam(o, marketAvg);
    return !scam && o.reviewScore >= 3.5 && o.reviewCount >= 30;
  });
  
  // Oblicz średni czas dostawy dla wszystkich bezpiecznych ofert
  const avgDeliveryTime = calculateAverageDeliveryTime(safeOffersForReview);
  
  // Jeśli mamy czas dostawy ze strony produktu, dodaj go do ofert
  if (delivery_time) {
    relevantOffers.forEach(o => {
      if (!o.deliveryTime && !o.delivery_time) {
        o.deliveryTime = delivery_time;
      }
    });
  }
  
  // Conflictmap: positieve <-> negatieve kenmerken die niet tegelijk kunnen voorkomen
  // We houden rekening met verschillende leveringsformaten (bijv. "Levering: 1 dag" vs "Levering: 5 dagen")
  const conflictMap = {
    "Snelle levering": "Langzame levering",
    "Langzame levering": "Snelle levering",
    "Goed klantcontact": "Communicatieproblemen",
    "Communicatieproblemen": "Goed klantcontact",
    "Producten zoals beschreven": "Producten niet zoals beschreven",
    "Producten niet zoals beschreven": "Producten zoals beschreven",
    "Probleemloze retouren": "Problemen met retouren",
    "Problemen met retouren": "Probleemloze retouren",
    "Professionele service": "Slechte klantenservice",
    "Slechte klantenservice": "Professionele service"
  };
  
  // Hulpfunctie voor detecteren van leveringsconflicten (verschillende formaten)
  const isDeliveryConflict = (text1, text2) => {
    const deliveryPattern = /^Levering:/;
    if (deliveryPattern.test(text1) && deliveryPattern.test(text2)) {
      // Beide gaan over levering - controleer of ze verschillend zijn (conflict)
      return text1 !== text2;
    }
    // Controleer standaard conflicten
    return conflictMap[text1] === text2 || conflictMap[text2] === text1;
  };
  
  // Zbierz wszystkie review points z informacją o sklepie i jego balansie
  const allReviewPoints = [];
  safeOffersForReview.forEach(o => {
    const points = generateReviewPoints(o, avgDeliveryTime);
    const totalPoints = points.positive.length + points.negative.length;
    const balance = totalPoints > 0 ? points.positive.length / totalPoints : 0.5; // balans 0-1 (1 = tylko pozytywne)
    
    points.positive.forEach(p => {
      allReviewPoints.push({ 
        text: p, 
        type: "positive", 
        shop: o.seller,
        balance: balance,
        shopScore: o.reviewScore || 0
      });
    });
    points.negative.forEach(p => {
      allReviewPoints.push({ 
        text: p, 
        type: "negative", 
        shop: o.seller,
        balance: balance,
        shopScore: o.reviewScore || 0
      });
    });
  });
  
  // Agreguj review points z uwzględnieniem balansu i częstotliwości
  const aggregatedReviews = {};
  allReviewPoints.forEach(p => {
    const key = p.text;
    if (!aggregatedReviews[key]) {
      aggregatedReviews[key] = { 
        text: p.text, 
        type: p.type, 
        count: 0,
        totalBalance: 0,
        avgBalance: 0,
        shops: new Set()
      };
    }
    aggregatedReviews[key].count += 1;
    aggregatedReviews[key].totalBalance += p.balance;
    aggregatedReviews[key].shops.add(p.shop);
    aggregatedReviews[key].avgBalance = aggregatedReviews[key].totalBalance / aggregatedReviews[key].count;
  });
  
  // Oblicz "score" dla każdej cechy: częstotliwość * balans * liczba unikalnych sklepów
  Object.keys(aggregatedReviews).forEach(key => {
    const review = aggregatedReviews[key];
    const shopCount = review.shops.size;
    // Score = częstotliwość * średni balans * liczba sklepów (ważone)
    review.score = review.count * review.avgBalance * (review.type === "positive" ? 1 : 0.5) * Math.log(shopCount + 1);
  });
  
  // Filtruj konfliktujące cechy - jeśli pozytywna ma wyższy score niż negatywna, usuń negatywną
  const conflictsToRemove = new Set();
  
  // Eerst behandel leveringsconflicten (verschillende formaten, bijv. "Levering: 1 dag" vs "Levering: 5 dagen")
  // Laat alleen de beste levertijd (hoogste score, of kortste tijd als score vergelijkbaar)
  const deliveryReviews = Object.values(aggregatedReviews).filter(r => r.text.startsWith("Levering:"));
  if (deliveryReviews.length > 1) {
    // Sortuj po score (najwyższy pierwszy), a jeśli score podobny, po czasie dostawy (najkrótszy pierwszy)
    deliveryReviews.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) < 0.1) {
        // Jeśli score podobny, porównaj czas dostawy (wyciągnij liczbę z tekstu)
        const timeA = parseInt(a.text.match(/(\d+)/)?.[1] || "999");
        const timeB = parseInt(b.text.match(/(\d+)/)?.[1] || "999");
        return timeA - timeB; // Krótszy czas = lepszy
      }
      return scoreDiff;
    });
    // Zostaw tylko najlepszy, usuń resztę
    for (let i = 1; i < deliveryReviews.length; i++) {
      conflictsToRemove.add(deliveryReviews[i].text);
    }
  }
  
  // Teraz obsłuż standardowe konflikty (pozytywne vs negatywne)
  Object.values(aggregatedReviews).forEach(review => {
    const conflictText = conflictMap[review.text];
    if (conflictText && aggregatedReviews[conflictText]) {
      const conflictReview = aggregatedReviews[conflictText];
      // Jeśli pozytywna ma lepszy balans/score, usuń negatywną (i odwrotnie)
      if (review.type === "positive" && conflictReview.type === "negative") {
        if (review.score >= conflictReview.score) {
          conflictsToRemove.add(conflictText);
        } else {
          conflictsToRemove.add(review.text);
        }
      }
    }
  });
  
  // Usuń konfliktujące cechy
  conflictsToRemove.forEach(text => {
    delete aggregatedReviews[text];
  });
  
  // Wybierz top 3 pozytywne i top 3 negatywne na podstawie score (balans + częstotliwość + liczba sklepów)
  const positiveReviews = Object.values(aggregatedReviews)
    .filter(r => r.type === "positive" && !conflictsToRemove.has(r.text))
    .sort((a, b) => b.score - a.score) // Sortuj po score (balans + częstotliwość)
    .slice(0, 3)
    .map(r => r.text);
  
  const negativeReviews = Object.values(aggregatedReviews)
    .filter(r => r.type === "negative" && !conflictsToRemove.has(r.text))
    .sort((a, b) => b.score - a.score) // Sortuj po score
    .slice(0, 3)
    .map(r => r.text);

  // wzbogacone oferty (anotacje względem ceny bazowej i rynku)
  // Używamy tylko relevant ofert do obliczeń (filtrujemy oferty dla innych produktów)
  const annotatedOffers = relevantOffers.length > 0 ? relevantOffers.map(o => {
    const cheaperThanBase = o.price < base_price && o.availability === "in_stock";
    const scam = isScam(o, marketAvg);
    const savingsVsBase = cheaperThanBase
      ? Number((base_price - o.price).toFixed(2))
      : 0;
    const relationToMarket =
      o.price < marketAvg * 0.9 ? "below_market" :
      o.price > marketAvg * 1.1 ? "above_market" :
      "around_market";
    
    // Dodaj review points przypisane do tego konkretnego sklepu
    const reviewPoints = generateReviewPoints(o, avgDeliveryTime);
    
    return {
      ...o,
      cheaperThanBase,
      scam,
      savingsVsBase,
      relationToMarket,
      reviewPoints: {
        positive: reviewPoints.positive,
        negative: reviewPoints.negative
      }
    };
  }) : [];

  const MATCH_FILTER_ENABLED = (() => {
    const v = String(process.env.PRICING_MATCH_FILTER_ENABLED || "").trim().toLowerCase();
    return v === "1" || v === "true";
  })();
  const matchMin = Number(process.env.PRICING_MATCH_MIN_SCORE);
  const MATCH_MIN_SCORE = Number.isFinite(matchMin) ? Math.max(0, Math.min(1, matchMin)) : 0.4;

  // Zgodnie z filozofią: scamów nie pokazujemy – odfiltrowane; kolejność: cena + popularność (opcja C)
  const inputForClientBase = annotatedOffers.filter(o => !o.scam);
  const inputForClientMatchFiltered = MATCH_FILTER_ENABLED
    ? inputForClientBase.filter((o) => computeTitleMatchScore(product_name || "", o && (o.title || "")) >= MATCH_MIN_SCORE)
    : inputForClientBase;
  const matchFilteredOut = Math.max(0, inputForClientBase.length - inputForClientMatchFiltered.length);

  const inputForClient = inputForClientMatchFiltered;
  const inputForClientInStock = inputForClient.filter(o => o.availability === "in_stock");
  const inputForClientUnderBase = inputForClientInStock.filter(o => o.price != null && o.price <= base_price);
  const maxDeliveryDays = Number(process.env.PRICING_MAX_DELIVERY_DAYS);
  const inputForClientDeliveryFiltered = Number.isFinite(maxDeliveryDays) && maxDeliveryDays > 0
    ? filterByMaxDeliveryDays(inputForClientUnderBase, maxDeliveryDays)
    : inputForClientUnderBase;
  const dedupedForClient = dedupeOffersForSelection(inputForClientDeliveryFiltered);

  const fallbackSorted = sortOffersByPriceAndPopularity(dedupedForClient);

  let offersForClient = pickTopUniqueSellers(fallbackSorted, 3);
  let usedPricingV2 = false;
  let pricingV2Error = null;

  try {
    const v2 = analyzeOffersV2(dedupedForClient, base_price);
    if (v2 && Array.isArray(v2.displayOffers) && v2.displayOffers.length > 0) {
      offersForClient = pickTopUniqueSellers(
        v2.displayOffers.filter(o => o && o.price != null && o.price <= base_price && o.availability === "in_stock"),
        3
      );
      usedPricingV2 = offersForClient.length > 0;
    }
  } catch (err) {
    pricingV2Error = (err && err.message) || "pricing_v2_error";
  }

  if (PRICING_ALWAYS_THREE && offersForClient.length < 3) {
    const seenKeys = new Set(offersForClient.map(offerDedupeKeyForSelection).filter(Boolean));
    for (const o of fallbackSorted) {
      if (offersForClient.length >= 3) break;
      const key = offerDedupeKeyForSelection(o);
      if (!key) continue;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      offersForClient.push(o);
    }
  }

  appendEvent("scan_offer_selection", {
    sessionId,
    inputOffers: Array.isArray(marketOffers) ? marketOffers.length : 0,
    relevantOffers: relevantOffers.length,
    annotatedOffers: annotatedOffers.length,
    nonScamOffers: inputForClientBase.length,
    matchFilterEnabled: MATCH_FILTER_ENABLED,
    matchMinScore: MATCH_MIN_SCORE,
    matchFilteredOut,
    afterMatchOffers: inputForClient.length,
    inStockOffers: inputForClientInStock.length,
    underBaseOffers: inputForClientUnderBase.length,
    dedupedOffers: dedupedForClient.length,
    usedPricingV2,
    pricingV2Error,
    alwaysThreeEnabled: PRICING_ALWAYS_THREE,
    returnedOffers: offersForClient.length,
    shortfall: Math.max(0, 3 - offersForClient.length),
  });

  // If we have no usable market data, we must not allow payment/unlock.
  if (annotatedOffers.length === 0) {
    const response = {
      decision: "hold",
      neutralOutcome: true,
      message: "We hebben op dit moment geen betrouwbare marktdata voor dit product. Probeer later opnieuw of controleer handmatig.",
      base_price,
      savings: 0,
      marketAvg,
      offers: offersForClient,
      dataSource,
      reviewSummary: { best: positiveReviews, worst: negativeReviews },
      category,
      categoryLabel,
      session_id: sessionId,
    };
    response.dealScore = 3;
    response.dealConfidence = "laag";
    applyDealScorePenalty(response, {
      applied: true,
      reason: "no_market_data",
      noteNl: "Dit is de beste aanbieding die we konden vinden; we hebben geen betere marktdata.",
    });
    setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: false, reason: "no_market_data" });
    saveSessionToRedis(sessionId, sessionData);
    response.integrityHash = priceIntegrityHash(base_price, 0, ean, url);
    response.costNormalization = buildCostNormalization(base_price, billingPeriod, "EUR");
    attachSavingsAndConfidence(response, {
      base_price,
      savings: 0,
      visionConfidence: visionConfidence ?? 1,
      pricingConfidence: pricingConfidence ?? 1,
      comparisonConfidence,
      dataSource,
    });
    markUnlockNotAllowed(response, "Geen betrouwbare marktdata — betaling niet mogelijk.");
    response.previousScan = previousScan || null;
    await setProductMemory(productKey, { lastPrice: base_price, lastDecision: response.decision, lastSeenAt: Date.now() });
    return res.json(filterSensitiveData(response, sessionData));
  }

  // filtr: TYLKO TANIEJ NIŻ CENA BAZOWA I DOSTĘPNE
  const cheaperOffers = annotatedOffers.filter(
    o => o.cheaperThanBase && o.availability === "in_stock"
  );

  if (cheaperOffers.length === 0) {
    // Geen betere aanbieding: besparing = 0. Marktgemiddelde tonen we alleen als getal, niet als referentie voor besparing.
    const savings = 0;
    const dealsenseFee = 0;
    const netToUser = 0;
    const response = {
      decision: "buy_now",
      neutralOutcome: true,
      message: base_price < marketAvg
        ? "Er is op dit moment geen betere optie gevonden. Je huidige keuze is redelijk; ten opzichte van het marktgemiddelde doe je het goed."
        : "Er is op dit moment geen betere optie gevonden. Je huidige keuze is redelijk.",
      base_price,
      savings,
      dealsenseFee,
      netToUser,
      marketAvg,
      offers: offersForClient,
      dataSource,
      reviewSummary: { best: positiveReviews, worst: negativeReviews },
      marketInsight: base_price < marketAvg ? "Onze inschatting: dit lijkt een goede deal ten opzichte van de markt." : "Onze inschatting: marktprijs.",
      category,
      categoryLabel,
      session_id: sessionId
    };
    const ds1 = getDealScore(savings, base_price, annotatedOffers.length);
    response.dealScore = ds1.dealScore;
    response.dealConfidence = ds1.dealConfidence;
    applyDealScorePenalty(response, {
      applied: true,
      reason: "no_better_offer",
      noteNl: "Dit is de beste aanbieding die we konden vinden; we hebben geen betere marktdata.",
    });
    setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: false, reason: "no_better_offer" });
    saveSessionToRedis(sessionId, sessionData);
    response.integrityHash = priceIntegrityHash(base_price, savings, ean, url);
    response.costNormalization = buildCostNormalization(base_price, billingPeriod, "EUR");
    attachSavingsAndConfidence(response, {
      base_price,
      savings,
      savingsPercent: base_price > 0 && savings > 0 ? (savings / base_price) * 100 : null,
      visionConfidence: visionConfidence ?? 1,
      pricingConfidence: pricingConfidence ?? 1,
      comparisonConfidence,
      dataSource,
    });
    markUnlockNotAllowed(response, "Geen betere aanbieding gevonden — betaling niet nodig.");
    response.previousScan = previousScan || null;
    await setProductMemory(productKey, { lastPrice: base_price, lastDecision: response.decision, lastSeenAt: Date.now() });
    if (base_price > marketAvg && marketAvg > 0) {
      const overall = response.confidenceSummary && response.confidenceSummary.overall != null ? response.confidenceSummary.overall : 0.65;
      addPriceAlert(sessionId, {
        message: "Your current option may be more expensive than the market average.",
        messageNl: "Je huidige optie is mogelijk duurder dan het marktgemiddelde.",
        confidence: confidenceFromNumeric(overall),
        type: "above_market",
      });
    }
    return res.json(filterSensitiveData(response, sessionData));
  }

  // filtr scamów
  const safeOffers = cheaperOffers.filter(
    o => !o.scam
  );

  if (safeOffers.length === 0) {
    logEdgeCase("scam_filter", "Alle goedkopere aanbiedingen als verdacht gefilterd", { base_price, category: categoryLabel, offerCount: annotatedOffers.length });
    const response = {
      decision: "hold",
      message: "We raden aan om voorzichtig te zijn: de gevonden goedkopere aanbiedingen lijken verdacht. Controleer zelf voordat je beslist.",
      base_price,
      savings: 0,
      marketAvg,
      offers: offersForClient,
      dataSource,
      reviewSummary: { best: positiveReviews, worst: negativeReviews },
      category,
      categoryLabel,
      session_id: sessionId
    };
    response.dealScore = 3;
    response.dealConfidence = "laag";
    markUnlockNotAllowed(response, "Geen veilige aanbieding beschikbaar — betaling niet mogelijk.");
    setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: false, reason: "scam_filter" });
    saveSessionToRedis(sessionId, sessionData);
    response.integrityHash = priceIntegrityHash(base_price, 0, ean, url);
    response.costNormalization = buildCostNormalization(base_price, billingPeriod, "EUR");
    attachSavingsAndConfidence(response, {
      base_price,
      savings: 0,
      visionConfidence: visionConfidence ?? 1,
      pricingConfidence: pricingConfidence ?? 1,
      comparisonConfidence,
      dataSource,
    });
    response.previousScan = previousScan || null;
    await setProductMemory(productKey, { lastPrice: base_price, lastDecision: response.decision, lastSeenAt: Date.now() });
    return res.json(filterSensitiveData(response, sessionData));
  }

  const best = sortOffersByPriceAndPopularity(safeOffers)[0];
  const savings = Number((base_price - best.price).toFixed(2));
  const savingsPercent = savings / base_price;
  const dealsenseFee = savings > 0 ? Number((savings * 0.10).toFixed(2)) : 0;
  const netToUser = Number((savings - dealsenseFee).toFixed(2));

  if (savingsPercent < 0.05) {
    const response = {
      decision: "buy_now",
      neutralOutcome: true,
      message: "Er is op dit moment geen betere optie gevonden. Het prijsverschil is klein; je huidige keuze is redelijk.",
      base_price,
      savings,
      dealsenseFee,
      netToUser,
      marketAvg,
      offers: offersForClient,
      dataSource,
      reviewSummary: { best: positiveReviews, worst: negativeReviews },
      category,
      categoryLabel,
      session_id: sessionId
    };
    const ds2 = getDealScore(savings, base_price, annotatedOffers.length);
    response.dealScore = ds2.dealScore;
    response.dealConfidence = ds2.dealConfidence;
    markUnlockNotAllowed(response, "Prijsverschil is klein — betaling niet nodig.");
    setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: false, reason: "small_savings" });
    saveSessionToRedis(sessionId, sessionData);
    response.integrityHash = priceIntegrityHash(base_price, savings, ean, url);
    response.costNormalization = buildCostNormalization(base_price, billingPeriod, "EUR");
    attachSavingsAndConfidence(response, {
      base_price,
      savings,
      savingsPercent: savingsPercent * 100,
      visionConfidence: visionConfidence ?? 1,
      pricingConfidence: pricingConfidence ?? 1,
      comparisonConfidence,
      dataSource,
    });
    response.previousScan = previousScan || null;
    await setProductMemory(productKey, { lastPrice: base_price, lastDecision: response.decision, lastSeenAt: Date.now() });
    return res.json(filterSensitiveData(response, sessionData));
  }

  const response = {
    decision: "switch_seller",
    message: isLocked(sessionData) 
      ? "Er lijkt een goedkopere aanbieding beschikbaar; ontgrendel om de details te zien. Dit is een aanbeveling, geen opdracht."
      : "Op basis van onze analyse raden we aan om een andere verkoper te overwegen: er lijkt een goedkopere, veilige aanbieding. De beslissing is aan jou.",
    base_price,
    best_offer: best,
    savings,
    dealsenseFee,
    netToUser,
    marketAvg,
    offers: offersForClient,
    dataSource,
    reviewSummary: { best: positiveReviews, worst: negativeReviews },
    category,
    categoryLabel,
    marketInsight: base_price > marketAvg ? "Onze inschatting: je betaalt mogelijk meer ten opzichte van het marktgemiddelde." : "Onze inschatting: prijs rond marktniveau.",
    session_id: sessionId
  };

  const STRICT_UNLOCK_MATCH_ENABLED = (() => {
    const v = String(process.env.PAYWALL_STRICT_MATCH_ENABLED || "").trim().toLowerCase();
    if (!v) return true;
    return v === "1" || v === "true";
  })();
  const STRICT_UNLOCK_MATCH_MIN_SCORE = (() => {
    const raw = String(process.env.PAYWALL_STRICT_MATCH_MIN_SCORE || "").trim();
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return 0.85;
    return Math.max(0, Math.min(1, n));
  })();
  const bestMatchScore = (() => {
    const q = product_name || "";
    const t = best && typeof best === "object" ? (best.title || "") : "";
    return computeTitleMatchScore(q, t);
  })();
  if (STRICT_UNLOCK_MATCH_ENABLED && bestMatchScore < STRICT_UNLOCK_MATCH_MIN_SCORE) {
    markUnlockNotAllowed(response, "We zijn nog niet 100% zeker dat dit exact hetzelfde product is — ontgrendelen is geblokkeerd.");
    setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: false, reason: "match_uncertain" });
  }
  const ds3 = getDealScore(savings, base_price, annotatedOffers.length);
  response.dealScore = ds3.dealScore;
  response.dealConfidence = ds3.dealConfidence;

  const unlockGateOk = response && response.unlockAllowed === true && response.offerAvailableForUnlock !== false;
  response.offerAvailableForUnlock = unlockGateOk;
  setLastScanUnlockGate(sessionData, { offerAvailableForUnlock: unlockGateOk, reason: unlockGateOk ? "better_offer" : (sessionData.lastScanOfferReason || "match_uncertain") });
  saveSessionToRedis(sessionId, sessionData);
  response.integrityHash = priceIntegrityHash(base_price, savings, ean, url);
  response.costNormalization = buildCostNormalization(base_price, billingPeriod, "EUR");
  attachSavingsAndConfidence(response, {
    base_price,
    savings,
    savingsPercent: savingsPercent * 100,
    visionConfidence: visionConfidence ?? 1,
    pricingConfidence: pricingConfidence ?? 1,
    comparisonConfidence,
    dataSource,
  });
  response.previousScan = previousScan || null;
  await setProductMemory(productKey, { lastPrice: base_price, lastDecision: response.decision, lastSeenAt: Date.now() });
  const filteredResponse = filterSensitiveData(response, sessionData);

  // Silent price-monitoring alert: better comparable offer (show only when user opens Dealsense; no push)
  if (response.decision === "switch_seller" && response.savings != null && response.savings >= 5) {
    const overall = response.confidenceSummary && response.confidenceSummary.overall != null ? response.confidenceSummary.overall : 0.7;
    const savingsRounded = Math.round(response.savings * 100) / 100;
    addPriceAlert(sessionId, {
      message: `A similar option is currently about €${savingsRounded.toFixed(2)} cheaper.`,
      messageNl: `Een vergelijkbare optie is momenteel ongeveer €${savingsRounded.toFixed(2).replace(".", ",")} goedkoper.`,
      confidence: confidenceFromNumeric(overall),
      type: "better_offer",
    });
  }
  
  // Als gebruiker is ingelogd, sla scan op in zijn geschiedenis
  if (user && !isLocked(sessionData)) {
    user.scanCount = (user.scanCount || 0) + 1;
    user.lastScanAt = new Date().toISOString();
    
    // Sla besparingen op in categorie breakdown
    if (filteredResponse.savings > 0 && categoryLabel) {
      if (!user.categoryBreakdown[category]) {
        user.categoryBreakdown[category] = { scans: 0, savings: 0 };
      }
      user.categoryBreakdown[category].scans += 1;
      user.categoryBreakdown[category].savings += (filteredResponse.netToUser || filteredResponse.savings || 0);
    }
    
    // Update totalSavings
    if (filteredResponse.netToUser > 0) {
      user.totalSavings = (user.totalSavings || 0) + filteredResponse.netToUser;
    }
  }
  
  res.json(filteredResponse);
});

/**
 * POST /extract-ean
 * Wyciąga EAN z URL produktu (działa dla wszystkich sklepów NL)
 */
app.post("/extract-ean", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Geen geldige product URL." });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: "Ongeldig URL-formaat." });
    }

    // Wyciągnij EAN z URL
    const ean = await extractEANFromURL(url);
    
    if (!ean) {
      return res.status(404).json({
        error: "Kon EAN niet vinden op productpagina.",
        url
      });
    }

    res.json({
      success: true,
      ean,
      url,
      source: parsed.hostname
    });
  } catch (err) {
    console.error("Dealsense /extract-ean error:", err.message);
    res.status(500).json({ error: "Fout bij ophalen van EAN uit URL." });
  }
});

/**
 * POST /search-by-ean
 * Szuka produktu po EAN w bol.com i innych sklepach
 */
app.post("/search-by-ean", async (req, res) => {
  try {
    const { ean, url } = req.body || {};
    
    if (!ean || !/^\d{13}$/.test(ean)) {
      return res.status(400).json({ error: "Ongeldige EAN (moet 13 cijfers hebben)." });
    }

    // Szukaj w bol.com
    const bolOffer = await searchBolComByEAN(ean);
    
    // Jeśli nie ma bol.com API, zwróć informację że EAN został znaleziony
    if (!bolOffer) {
      return res.json({
        success: true,
        ean,
        message: "EAN gevonden. Integratie met bol.com API vereist API-sleutel (affiliate).",
        url: url || null,
        offers: []
      });
    }

    res.json({
      success: true,
      ean,
      bolComOffer: bolOffer,
      offers: [bolOffer]
    });
  } catch (err) {
    console.error("Dealsense /search-by-ean error:", err.message);
    res.status(500).json({ error: "Fout bij zoeken naar product op EAN." });
  }
});

/**
 * POST /scrape
 * Próba automatycznego wyciągnięcia ceny i nazwy z URL produktu (MVP: bol.com)
 * TERAZ Z EAN EXTRACTION
 */
app.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Geen geldige product URL." });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: "Ongeldig URL-formaat." });
    }

    const host = parsed.hostname.toLowerCase();
    
    // Najpierw spróbuj wyciągnąć EAN (działa dla wszystkich sklepów)
    const ean = await extractEANFromURL(url);
    
    if (ean) {
      // Jeśli znaleziono EAN, szukaj produktu w bol.com
      const bolOffer = await searchBolComByEAN(ean);
      
      if (bolOffer && bolOffer.price) {
        return res.json({
          source: "bol.com (EAN)",
          url,
          ean,
          raw_price: bolOffer.price.toString(),
          numeric_price: bolOffer.price,
          product_name: bolOffer.title || "",
          seller: bolOffer.seller || "bol.com"
        });
      }
    }

    // Fallback: stara metoda dla bol.com (jeśli nie znaleziono EAN)
    if (!host.includes("bol.com")) {
      return res.status(400).json({
        error: "Automatisch lezen van prijs wordt momenteel alleen ondersteund voor bol.com.",
        tip: "Probeer /extract-ean endpoint om EAN te halen."
      });
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
      },
      timeout: 10000
    });

    const html = response.data;
    if (typeof html !== "string") {
      return res.status(500).json({ error: "Kon pagina-inhoud niet ophalen." });
    }

    // Tytuł produktu
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const product_name = titleMatch ? titleMatch[1].trim() : "";

    // Szukamy fragmentu z data-test="price" lub data-testid="price"
    const anchorRegex = /data-test="price"[\s\S]{0,200}?<\/[^>]+>|data-testid="price"[\s\S]{0,200}?<\/[^>]+>/i;
    let fragment = "";
    const anchorMatch = html.match(anchorRegex);
    if (anchorMatch) {
      fragment = anchorMatch[0];
    } else {
      fragment = html;
    }

    const priceRegex = /(\d{1,3}(?:[.\s]?\d{3})*,\d{2}|\d+[.,]\d{2})/;
    const priceMatch = fragment.replace(/\s+/g, "").match(priceRegex);

    if (!priceMatch) {
      return res.status(404).json({
        error: "Kon prijs niet vinden op bol.com pagina."
      });
    }

    const raw_price = priceMatch[1];
    const numeric_price = parseFloat(
      raw_price.replace(/\./g, "").replace(",", ".")
    );

    if (!numeric_price || numeric_price <= 0) {
      return res.status(500).json({
        error: "Prijs gevonden, maar kon niet worden geïnterpreteerd.",
        raw_price
      });
    }

    res.json({
      source: "bol.com",
      url,
      raw_price,
      numeric_price,
      product_name
    });
  } catch (err) {
    console.error("Dealsense /scrape error:", err.message);
    res.status(500).json({ error: "Fout bij analyseren van product URL." });
  }
});

// ---------- Admin dashboard (prywatny monitoring) ----------
app.get("/admin", (req, res) => {
  res.sendFile("admin.html", { root: path.join(__dirname, "public") });
});

app.get("/admin/events", requireAdmin, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const source = typeof req.query.source === "string" ? req.query.source.trim().toLowerCase() : "";
    Promise.resolve()
      .then(async () => {
        if (source === "file") return { events: readLastEventsFromFile(limit), used: "file" };
        const redisEvents = await readLastEventsFromRedis(limit);
        if (redisEvents.length > 0) return { events: redisEvents, used: "redis" };
        return { events: readLastEventsFromFile(limit), used: "file" };
      })
      .then(({ events, used }) => {
        res.json({ ok: true, limit, used, path: EVENTS_LOG_PATH, redisKey: EVENTS_REDIS_KEY, events });
      })
      .catch(() => {
        res.json({ ok: true, limit, used: "file", path: EVENTS_LOG_PATH, redisKey: EVENTS_REDIS_KEY, events: readLastEventsFromFile(limit) });
      });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.get("/admin/db-status", requireAdmin, async (req, res) => {
  try {
    const s = db.status();
    // best-effort: try connecting once on demand
    if (s.enabled && !s.connected) {
      await db.connect();
    }
    res.json({ ok: true, mongo: db.status() });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.get("/admin/edge-cases", requireAdmin, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const list = EDGE_CASE_LOGS.slice(0, limit);
    res.json({ edgeCases: list });
  } catch (err) {
    res.status(500).json({ error: "Fout bij ophalen edge cases." });
  }
});

app.get("/admin/stats", requireAdmin, (req, res) => {
  try {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const users = Array.from(USERS_DB.values());

    // Rejestracje po dniu (ostatnie 90 dni)
    const signupsByDay = {};
    for (let d = 90; d >= 0; d--) {
      const date = new Date(now - d * dayMs);
      const key = date.toISOString().slice(0, 10);
      signupsByDay[key] = 0;
    }
    users.forEach((u) => {
      const key = u.createdAt ? u.createdAt.slice(0, 10) : null;
      if (key && signupsByDay[key] !== undefined) signupsByDay[key]++;
    });

    // Kraje
    const byCountry = {};
    users.forEach((u) => {
      const c = u.country || "Niet ingevuld";
      byCountry[c] = (byCountry[c] || 0) + 1;
    });
    const countriesSorted = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);

    // Wiek
    const byAge = {};
    users.forEach((u) => {
      const a = u.ageRange || "Niet ingevuld";
      byAge[a] = (byAge[a] || 0) + 1;
    });
    const ageSorted = Object.entries(byAge).sort((a, b) => b[1] - a[1]);

    // Kod pocztowy (pierwsze 4 znaki dla prywatności)
    const byPostal = {};
    users.forEach((u) => {
      const p = u.postalCode ? String(u.postalCode).slice(0, 4) : "—";
      byPostal[p] = (byPostal[p] || 0) + 1;
    });
    const postalSorted = Object.entries(byPostal).sort((a, b) => b[1] - a[1]).slice(0, 30);

    // Retention: ostatnie 7 / 30 dni (login lub skan)
    const last7 = now - 7 * dayMs;
    const last30 = now - 30 * dayMs;
    let active7 = 0, active30 = 0;
    users.forEach((u) => {
      const last = u.lastLoginAt || u.lastScanAt || u.createdAt;
      if (!last) return;
      const t = new Date(last).getTime();
      if (t >= last7) active7++;
      if (t >= last30) active30++;
    });

    // Rezygnacje po dniu
    const deletedByDay = {};
    for (let d = 90; d >= 0; d--) {
      const date = new Date(now - d * dayMs);
      const key = date.toISOString().slice(0, 10);
      deletedByDay[key] = 0;
    }
    DELETED_USERS.forEach((u) => {
      const key = u.deletedAt ? u.deletedAt.slice(0, 10) : null;
      if (key && deletedByDay[key] !== undefined) deletedByDay[key]++;
    });

    // Lista ostatnich rejestracji (email zanonimizowany – regex w osobnej zmiennej)
    const recentSignups = users
      .sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
      .slice(0, 50)
      .map((u) => {
        const anonymized = u.email ? String(u.email).replace(/^(.{2}).*@(.*)$/, "$1***@$2") : "";
        return {
          email: anonymized,
          country: u.country,
          ageRange: u.ageRange,
          createdAt: u.createdAt,
          scanCount: u.scanCount
        };
      });

    // Oszczędności i skany
    let totalSavingsAll = 0;
    let totalScansAll = 0;
    let usersWithAtLeastOneScan = 0;
    const categoryAggregate = {};
    users.forEach((u) => {
      const savings = Number(u.totalSavings) || 0;
      const scans = Number(u.scanCount) || 0;
      totalSavingsAll += savings;
      totalScansAll += scans;
      if (scans > 0) usersWithAtLeastOneScan++;
      const breakdown = u.categoryBreakdown || {};
      Object.entries(breakdown).forEach(([cat, data]) => {
        if (!categoryAggregate[cat]) categoryAggregate[cat] = { scans: 0, savings: 0 };
        categoryAggregate[cat].scans += (data.scans || 0);
        categoryAggregate[cat].savings += (data.savings || 0);
      });
    });
    const savingsByCategory = Object.entries(categoryAggregate)
      .map(([category, data]) => ({ category, scans: data.scans, savings: Math.round(data.savings * 100) / 100 }))
      .sort((a, b) => b.savings - a.savings);
    const averageSavingsPerUser = users.length ? Math.round((totalSavingsAll / users.length) * 100) / 100 : 0;
    const averageScansPerUser = users.length ? Math.round((totalScansAll / users.length) * 100) / 100 : 0;

    res.json({
      totalUsers: users.length,
      totalDeleted: DELETED_USERS.length,
      totalSignupsSinceLaunch: users.length + DELETED_USERS.length,
      totalDeletedSinceLaunch: DELETED_USERS.length,
      activeLast7Days: active7,
      activeLast30Days: active30,
      totalSavingsAll: Math.round(totalSavingsAll * 100) / 100,
      totalScansAll,
      usersWithAtLeastOneScan,
      averageSavingsPerUser,
      averageScansPerUser,
      savingsByCategory,
      byCountry: countriesSorted,
      byAgeRange: ageSorted,
      byPostalCode: postalSorted,
      signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
      deletedByDay: Object.entries(deletedByDay).map(([date, count]) => ({ date, count })),
      recentSignups
    });
  } catch (err) {
    console.error("Dealsense /admin/stats error:", err.message);
    res.status(500).json({ error: "Fout bij ophalen van statistieken." });
  }
});

// ---------- NL Price compare (cache w pamięci, przeładowanie serwera = odświeżenie) ----------
let getCacheKey, getCached, setCached, TTL_DEFAULT_MS, runCompare;
try {
  const cache = require("./compare/cache");
  const run = require("./compare/runCompare");
  getCacheKey = cache.getCacheKey;
  getCached = cache.getCached;
  setCached = cache.setCached;
  TTL_DEFAULT_MS = cache.TTL_DEFAULT_MS;
  runCompare = run.runCompare;
} catch (err) {
  console.warn("Dealsense compare module not loaded:", (err && err.message) || err);
  getCacheKey = () => "unknown";
  getCached = () => null;
  setCached = () => {};
  TTL_DEFAULT_MS = 12 * 60 * 60 * 1000;
  runCompare = async () => ({ noBetterDeal: true });
}
const MAX_FREE_COMPARE = 3;
const UNLOCK_PERCENT = 0.1;

app.post("/api/compare", async (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const ean = typeof body.ean === "string" ? body.ean.trim() || undefined : undefined;
    const serviceType = ["energy", "insurance", "finance"].includes(body.serviceType) ? body.serviceType : undefined;
    const serviceParams = body.serviceParams && typeof body.serviceParams === "object" && !Array.isArray(body.serviceParams) ? body.serviceParams : undefined;
    const currentPrice = typeof body.currentPrice === "number" ? body.currentPrice : undefined;
    const usageCount = typeof body.usageCount === "number" ? Math.max(0, Math.min(3, Math.floor(body.usageCount))) : 0;

    if (!ean && !serviceType) {
      return res.status(400).json({ ok: false, error: "Provide ean (product) or serviceType + serviceParams." });
    }
    if (serviceType && (serviceParams == null || typeof serviceParams !== "object" || Array.isArray(serviceParams))) {
      return res.status(400).json({ ok: false, error: "For serviceType provide serviceParams (object)." });
    }

    const input = { ean, serviceType, serviceParams, currentPrice };
    const cacheKey = getCacheKey ? getCacheKey(input) : "unknown";
    if (cacheKey === "unknown") {
      return res.status(400).json({ ok: false, error: "Invalid input: could not build cache key." });
    }

    const cached = getCached ? getCached(cacheKey) : null;
    if (cached && typeof cached === "object") {
      const used = usageCount;
      const usesRemaining = Math.max(0, MAX_FREE_COMPARE - used);
      const savings = typeof cached.savingsAbsolute === "number" ? cached.savingsAbsolute : 0;
      return res.json({
        ok: true,
        result: cached,
        usesRemaining,
        locked: usesRemaining === 0,
        unlockPriceEur: usesRemaining === 0 ? Math.round(savings * UNLOCK_PERCENT * 100) / 100 : undefined
      });
    }

    const result = runCompare ? await runCompare(input, cacheKey) : { noBetterDeal: true };
    if (!result || result.noBetterDeal) {
      return res.json({
        ok: true,
        noBetterDeal: true,
        usesRemaining: Math.max(0, MAX_FREE_COMPARE - usageCount),
        locked: usageCount >= MAX_FREE_COMPARE
      });
    }

    if (setCached) setCached(cacheKey, result, TTL_DEFAULT_MS);
    const usesRemaining = Math.max(0, MAX_FREE_COMPARE - usageCount);
    const savings = typeof result.savingsAbsolute === "number" ? result.savingsAbsolute : 0;
    res.json({
      ok: true,
      result,
      usesRemaining,
      locked: usesRemaining === 0,
      unlockPriceEur: usesRemaining === 0 ? Math.round(savings * UNLOCK_PERCENT * 100) / 100 : undefined
    });
  } catch (err) {
    console.error("Dealsense /api/compare error:", (err && err.message) || err);
    res.status(500).json({ ok: false, error: "Fout bij vergelijken." });
  }
});

// ---------- Price normalization (global formats → one number + currency) ----------
let normalizePrice;
let computeYearlyEquivalent;
try {
  const normalizer = require("./price-normalizer");
  normalizePrice = normalizer.normalizePrice;
  computeYearlyEquivalent = normalizer.computeYearlyEquivalent;
} catch (err) {
  console.warn("Dealsense price-normalizer not loaded:", (err && err.message) || err);
  normalizePrice = () => ({ rawPriceText: "", normalizedValue: NaN, currency: "EUR", detectedFormat: "unknown" });
  computeYearlyEquivalent = () => null;
}

/**
 * Cost normalization: yearly equivalent for monthly/weekly/daily prices.
 * Purpose: clarify long-term cost; do not influence decisions.
 */
function buildCostNormalization(amount, period, currency = "EUR") {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  const p = (period || "").toLowerCase();
  if (!["monthly", "weekly", "daily", "yearly"].includes(p)) return null;
  const yearly = computeYearlyEquivalent ? computeYearlyEquivalent(amount, p) : null;
  if (yearly == null) return null;
  return {
    period: p,
    originalAmount: amount,
    yearlyEquivalent: Number((yearly).toFixed(2)),
    currency: currency || "EUR",
    label: "Estimated yearly cost",
    labelNl: "Geschatte jaarkosten",
    disclaimer: "Based on current pricing; subject to change.",
    disclaimerNl: "Gebaseerd op actuele prijzen; kan wijzigen.",
  };
}

app.post("/api/normalize-price", (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const text = typeof body.text === "string" ? body.text : (typeof body.price === "string" ? body.price : "");
    const result = normalizePrice ? normalizePrice(text) : { rawPriceText: text, normalizedValue: NaN, currency: "EUR", detectedFormat: "unknown" };
    res.json(result);
  } catch (err) {
    console.error("Dealsense /api/normalize-price error:", (err && err.message) || err);
    res.status(500).json({ rawPriceText: "", normalizedValue: NaN, currency: "EUR", detectedFormat: "unknown", error: "Fout bij normaliseren." });
  }
});

// ——— Vaste lasten: rachunki → overzicht (100% betrouwbaar, geen nep-besparingen) ———
const VASTE_LASTEN_CATEGORIES = ["energie", "internet", "telefoon", "verzekering", "overig"];
const VASTE_LASTEN_COMPARISON_LINKS = [
  { label: "Independer (energie, verzekeringen)", url: "https://www.independer.nl" },
  { label: "Gaslicht.com (energie)", url: "https://www.gaslicht.com" },
  { label: "Bellen.com (internet, bellen)", url: "https://www.bellen.com" }
];

function parseVasteLastenBody(body) {
  const items = Array.isArray(body.items) ? body.items : [];
  const out = [];
  for (let i = 0; i < Math.min(items.length, 12); i++) {
    const it = items[i];
    if (!it || typeof it !== "object") continue;
    const category = typeof it.category === "string" ? it.category.trim().toLowerCase() : "";
    if (!VASTE_LASTEN_CATEGORIES.includes(category)) continue;
    let amount = NaN;
    if (typeof it.amount === "number" && Number.isFinite(it.amount)) amount = it.amount;
    else if (typeof it.amount === "string") amount = parseFloat(it.amount.replace(",", "."));
    if (amount < 0 || amount > 50000) continue;
    const provider = typeof it.provider === "string" ? it.provider.trim().slice(0, 120) : "";
    out.push({ category, provider: provider || "–", amount: Math.round(amount * 100) / 100 });
  }
  return out;
}

app.get("/api/vaste-lasten-status", async (req, res) => {
  try {
    const fingerprint = typeof req.query.fingerprint === "string" ? req.query.fingerprint.trim() : null;
    const session_id = typeof req.query.session_id === "string" ? req.query.session_id.trim() : null;
    const clientIP = getClientIP(req);
    const { data: sessionData } = await getSession(session_id, fingerprint, clientIP);
    res.json({ unlocked: !!sessionData.unlocked });
  } catch (err) {
    res.json({ unlocked: false });
  }
});

app.post("/api/vaste-lasten", async (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : null;
    const session_id = typeof body.session_id === "string" ? body.session_id.trim() : null;
    const clientIP = getClientIP(req);
    const { data: sessionData } = await getSession(session_id, fingerprint, clientIP);
    if (!sessionData.unlocked) {
      return res.status(403).json({
        error: "Mijn vaste lasten is een premium functie. Ontgrendel eerst je account (na provisie). Niet inbegrepen in de 3 gratis scans.",
        code: "PREMIUM_REQUIRED"
      });
    }

    const plan = getEffectivePlanFromSession(sessionData);
    if (!requireCapabilityOr402({ plan, capability: "bills", res })) return;

    const items = parseVasteLastenBody(body);
    if (items.length === 0) {
      return res.status(400).json({
        error: "Voeg minimaal één post toe (categorie, bedrag per maand).",
        code: "NO_ITEMS"
      });
    }
    const totalPerMonth = items.reduce((s, i) => s + i.amount, 0);
    const totalPerYear = Math.round(totalPerMonth * 12 * 100) / 100;
    const totalPerMonthRounded = Math.round(totalPerMonth * 100) / 100;

    let bundleInsight = null;
    try {
      const bundleModule = require("./bundle-insights");
      const result = bundleModule.runBundleInsights({ items: items.map((i) => ({ category: i.category, amount: i.amount, provider: i.provider, period: "monthly" })) });
      if (result.insight) bundleInsight = result.insight;
    } catch (_) { /* optional */ }

    res.json({
      ok: true,
      items,
      totalPerMonth: totalPerMonthRounded,
      totalPerYear,
      message: "Vergelijk je vaste lasten op onderstaande sites om te zien of je kunt besparen. Dealsense geeft geen partnerlinks – alleen informatie.",
      comparisonLinks: VASTE_LASTEN_COMPARISON_LINKS,
      bundleInsight: bundleInsight || undefined,
      advisoryFraming: getAdvisoryFraming(),
    });
  } catch (err) {
    console.error("Dealsense /api/vaste-lasten error:", (err && err.message) || err);
    res.status(500).json({ ok: false, error: "Er ging iets mis. Probeer het opnieuw." });
  }
});

// ——— Optional bundle insights (never required; no CTA pressure) ———
app.post("/api/bundle-insights", (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length < 2) {
      return res.json({ ok: true, optional: true, insight: null });
    }
    const bundleModule = require("./bundle-insights");
    const result = bundleModule.runBundleInsights({ items });
    res.json({
      ok: true,
      optional: true,
      insight: result.insight || null,
    });
  } catch (err) {
    console.error("Dealsense /api/bundle-insights error:", (err && err.message) || err);
    res.json({ ok: true, optional: true, insight: null });
  }
});

// ——— Subscription detection advisory (informational only; never auto-cancel or recommend cancellation) ———
let runSubscriptionAdvisory;
try {
  const subscriptionAdvisory = require("./subscription-advisory");
  runSubscriptionAdvisory = subscriptionAdvisory.runSubscriptionAdvisory;
} catch (err) {
  console.warn("Dealsense subscription-advisory not loaded:", (err && err.message) || err);
  runSubscriptionAdvisory = () => ({ alerts: [], disclaimer: "Detection is heuristic-based and may be incomplete or inaccurate.", disclaimerNl: "Detectie is heuristisch en kan onvolledig of onjuist zijn." });
}

app.post("/api/subscription-advisory", (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const bills = Array.isArray(body.bills) ? body.bills : [];
    const pageData = typeof body.pageData === "string" ? body.pageData.trim() : "";
    if (bills.length === 0 && !pageData) {
      return res.status(400).json({
        ok: false,
        error: "Provide bills (array) and/or pageData (string) to analyse.",
        code: "NO_INPUT"
      });
    }
    const result = runSubscriptionAdvisory({ bills, pageData });
    res.json({
      ok: true,
      alerts: result.alerts,
      disclaimer: result.disclaimer,
      disclaimerNl: result.disclaimerNl,
    });
  } catch (err) {
    console.error("Dealsense /api/subscription-advisory error:", (err && err.message) || err);
    res.status(500).json({
      ok: false,
      error: "Er ging iets mis bij het analyseren.",
      alerts: [],
      disclaimer: "Detection is heuristic-based and may be incomplete or inaccurate.",
      disclaimerNl: "Detectie is heuristisch en kan onvolledig of onjuist zijn.",
    });
  }
});

// ——— Price timing advisory (contextual advice only; never predictions, never "Buy now") ———
let runPriceTimingAdvisory;
try {
  const priceTimingAdvisory = require("./price-timing-advisory");
  runPriceTimingAdvisory = priceTimingAdvisory.runPriceTimingAdvisory;
} catch (err) {
  console.warn("Dealsense price-timing-advisory not loaded:", (err && err.message) || err);
  runPriceTimingAdvisory = () => ({
    advice: null,
    adviceNl: null,
    context: "unavailable",
    disclaimer: "Historical data does not guarantee future prices.",
    disclaimerNl: "Historische gegevens garanderen geen toekomstige prijzen.",
  });
}

app.post("/api/price-timing-advisory", (req, res) => {
  try {
    const body = req.body != null && typeof req.body === "object" ? req.body : {};
    const currentPrice = body.currentPrice != null ? body.currentPrice : body.current_price;
    if (currentPrice == null) {
      return res.status(400).json({
        ok: false,
        error: "Provide currentPrice (required).",
        code: "NO_CURRENT_PRICE",
      });
    }
    const result = runPriceTimingAdvisory({
      currentPrice,
      historicalMin: body.historicalMin ?? body.historical_min,
      historicalMax: body.historicalMax ?? body.historical_max,
      historicalAverage: body.historicalAverage ?? body.historical_average,
      prices: body.prices,
    });
    res.json({
      ok: true,
      advice: result.advice,
      adviceNl: result.adviceNl,
      context: result.context,
      disclaimer: result.disclaimer,
      disclaimerNl: result.disclaimerNl,
    });
  } catch (err) {
    console.error("Dealsense /api/price-timing-advisory error:", (err && err.message) || err);
    res.status(500).json({
      ok: false,
      error: "Er ging iets mis.",
      advice: null,
      disclaimer: "Historical data does not guarantee future prices.",
      disclaimerNl: "Historische gegevens garanderen geen toekomstige prijzen.",
    });
  }
});

// ——— Vision AI pipeline (FREE: Tesseract + OpenCV) ———
// POST /api/vision/extract — body: { imageBase64: "data:image/png;base64,..." or raw base64 }
// Returns mandatory format: price, currency, ean, availability, providerName, billingPeriod, confidence
let runVisionFromBase64;
try {
  const visionRunner = require("./vision-runner");
  runVisionFromBase64 = visionRunner.runVisionFromBase64;
} catch (e) {
  runVisionFromBase64 = null;
}

app.post("/api/vision/extract", async (req, res) => {
  if (!runVisionFromBase64) {
    return res.status(503).json({
      error: "Vision pipeline niet beschikbaar (Python + Tesseract vereist).",
      price: null,
      currency: null,
      rawPriceText: null,
      ean: null,
      availability: "unknown",
      providerName: null,
      billingPeriod: null,
      confidence: { price: 0, ean: 0, availability: 0 }
    });
  }
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const imageBase64 = body.imageBase64 || body.image || body.data;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({
        error: "imageBase64 ontbreekt (data URL of base64 string).",
        price: null,
        currency: null,
        rawPriceText: null,
        ean: null,
        availability: "unknown",
        providerName: null,
        billingPeriod: null,
        confidence: { price: 0, ean: 0, availability: 0 }
      });
    }
    const result = await runVisionFromBase64(imageBase64);
    // Normalize keys to camelCase for API
    res.json({
      price: result.price ?? null,
      currency: result.currency ?? null,
      rawPriceText: result.rawPriceText ?? null,
      ean: result.ean ?? null,
      availability: result.availability || "unknown",
      providerName: result.providerName ?? null,
      billingPeriod: result.billingPeriod ?? null,
      confidence: result.confidence || { price: 0, ean: 0, availability: 0 }
    });
  } catch (err) {
    console.error("Dealsense /api/vision/extract error:", (err && err.message) || err);
    res.status(500).json({
      error: (err && err.message) ? err.message : "Vision extractie mislukt.",
      price: null,
      currency: null,
      rawPriceText: null,
      ean: null,
      availability: "unknown",
      providerName: null,
      billingPeriod: null,
      confidence: { price: 0, ean: 0, availability: 0 }
    });
  }
});

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Export for Vercel serverless functions
module.exports = app;

// Start server locally if not in Vercel environment
if (process.env.VERCEL !== '1' && require.main === module) {
  const BASE_PORT = Number(process.env.PORT) || 4000;
  const MAX_PORT_TRIES = 20;

  const startServer = (port, triesLeft) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Dealsense działa na http://localhost:${port}`);
    });

    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE" && triesLeft > 0) {
        const nextPort = port + 1;
        console.warn(`⚠️ Port ${port} zajęty. Próba na porcie ${nextPort}...`);
        try {
          server.close(() => startServer(nextPort, triesLeft - 1));
        } catch (_) {
          startServer(nextPort, triesLeft - 1);
        }
        return;
      }
      console.error("❌ Nie udało się uruchomić serwera:", err);
      process.exit(1);
    });
  };

  startServer(BASE_PORT, MAX_PORT_TRIES);
}
