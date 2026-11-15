// Client minimal de l'API Blizzard (client credentials) avec cache mémoire.
import { API_HOST, LOCALE } from './config.mjs';

const { BNET_CLIENT_ID: CLIENT_ID, BNET_CLIENT_SECRET: CLIENT_SECRET } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('BNET_CLIENT_ID et BNET_CLIENT_SECRET sont requis (voir .env.example)');

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

let token = null;
let tokenExpires = 0;
async function getToken() {
  if (token && Date.now() < tokenExpires) return token;
  const r = await fetch('https://oauth.battle.net/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new ApiError(502, `Authentification Blizzard refusée (HTTP ${r.status})`);
  const j = await r.json();
  token = j.access_token;
  tokenExpires = Date.now() + (j.expires_in - 300) * 1000; // marge de 5 min
  return token;
}

// Au plus 8 appels simultanés vers Blizzard (limite : 100 req/s).
const MAX_PARALLEL = 8;
let running = 0;
const queue = [];
async function limited(fn) {
  if (running >= MAX_PARALLEL) await new Promise((res) => queue.push(res));
  running++;
  try { return await fn(); } finally { running--; queue.shift()?.(); }
}

const cache = new Map(); // clé -> { value, expires } ; value peut être une ApiError mise en cache
export async function cached(key, ttl, fn, notFoundTtl = ttl) {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expires) {
    if (hit.value instanceof ApiError) throw hit.value;
    return hit.value;
  }
  try {
    const value = await fn();
    cache.set(key, { value, expires: Date.now() + ttl });
    return value;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) cache.set(key, { value: e, expires: Date.now() + notFoundTtl });
    throw e;
  }
}

export async function get(path, namespace) {
  return limited(async () => {
    const url = `${API_HOST}${path}?namespace=${namespace}&locale=${LOCALE}`;
    let r = await fetch(url, { headers: { Authorization: `Bearer ${await getToken()}` } });
    if (r.status === 401) { token = null; r = await fetch(url, { headers: { Authorization: `Bearer ${await getToken()}` } }); }
    if (r.status === 404) throw new ApiError(404, 'Introuvable sur l’API Blizzard');
    if (!r.ok) throw new ApiError(502, `API Blizzard : HTTP ${r.status}`);
    return r.json();
  });
}

// L'API renvoie des liens avec un namespace « épinglé » (ex. static-1.60.1_70399-forever-eu) : on le réutilise.
export function namespaceOf(href, fallback) {
  const m = /[?&]namespace=([^&]+)/.exec(href || '');
  return m ? m[1] : fallback;
}
