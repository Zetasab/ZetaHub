// Same pattern as cesarsobrino's js/visits.js: a per-tab idSeg, a bot filter,
// and a keepalive heartbeat — trimmed down to this site's trigger, which is
// simply the first scroll or click rather than a time-on-page threshold.
const PROD_API_BASE = "https://cesarsobapigateway.up.railway.app";
const DEV_API_BASE = "http://localhost:5300";
const DEV_HOSTNAME_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/i;

function isDevEnvironment() {
  return (
    window.location.protocol === "file:" ||
    DEV_HOSTNAME_PATTERN.test(window.location.hostname) ||
    window.location.hostname.endsWith(".local")
  );
}

const API_BASE = isDevEnvironment() ? DEV_API_BASE : PROD_API_BASE;
const ADD_VISIT_ENDPOINT = `${API_BASE}/api/addzetahub`;
const KEEPALIVE_ENDPOINT = `${API_BASE}/api/addkeepalivezetahub`;

const BOT_UA_PATTERN =
  /(bot|crawler|spider|slurp|curl|wget|python-requests|headless|phantom|scrapy|httpclient|monitor|uptime)/i;

const ID_SEG_KEY = "zetahub_id_seg";
const HEARTBEAT_INTERVAL_MS = 60000;

let hasRegistered = false;
let heartbeatId = null;

function getIdSeg() {
  let idSeg = sessionStorage.getItem(ID_SEG_KEY);
  if (!idSeg) {
    idSeg = crypto.randomUUID();
    sessionStorage.setItem(ID_SEG_KEY, idSeg);
  }
  return idSeg;
}

function isLikelyBot() {
  const userAgent = navigator.userAgent || "";
  return navigator.webdriver === true || BOT_UA_PATTERN.test(userAgent);
}

function registerVisit() {
  fetch(ADD_VISIT_ENDPOINT, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idSeg: getIdSeg() }),
  }).catch((error) => {
    console.warn("[visit] no se pudo registrar la visita:", error);
  });
}

function sendHeartbeat() {
  const url = new URL(KEEPALIVE_ENDPOINT);
  url.searchParams.set("idSeg", getIdSeg());
  fetch(url.toString(), {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
  }).catch((error) => {
    console.warn("[visit] no se pudo enviar el keepalive:", error);
  });
}

function startHeartbeat() {
  if (heartbeatId !== null) return;
  heartbeatId = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
}

function cleanup() {
  window.removeEventListener("wheel", onTrigger);
  window.removeEventListener("pointerdown", onTrigger);
}

function onTrigger() {
  if (hasRegistered || isLikelyBot()) return;
  hasRegistered = true;
  cleanup();
  registerVisit();
  startHeartbeat();
}

export function initVisitTracking() {
  window.addEventListener("wheel", onTrigger, { passive: true });
  window.addEventListener("pointerdown", onTrigger, { passive: true });
}
