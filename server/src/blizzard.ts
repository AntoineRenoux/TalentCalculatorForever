// Client minimal de l'API Blizzard (client credentials) avec cache mémoire.
import { serverConfig } from '../../config/server.config.ts';
import { t } from './i18n.ts';

const { blizzard, http } = serverConfig;

const { BNET_CLIENT_ID: CLIENT_ID, BNET_CLIENT_SECRET: CLIENT_SECRET } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('BNET_CLIENT_ID et BNET_CLIENT_SECRET sont requis (voir .env.example)');

export const REGION = process.env.BNET_REGION || blizzard.defaultRegion;
export const API_HOST = blizzard.apiHost(REGION);
export const NS_PROFILE = blizzard.namespaces.profile(REGION);
export const NS_STATIC = blizzard.namespaces.static(REGION);

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

interface TokenResponse { access_token: string; expires_in: number }

let token: string | null = null;
let tokenExpires = 0;
async function getToken(): Promise<string> {
  if (token && Date.now() < tokenExpires) return token;
  const r = await fetch(blizzard.tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new ApiError(http.badGateway, t('blizzard.authRefused', { status: r.status }));
  const j = (await r.json()) as TokenResponse;
  token = j.access_token;
  tokenExpires = Date.now() + (j.expires_in - blizzard.tokenRenewMarginSeconds) * blizzard.secondMs;
  return token;
}

// Limiteur de parallélisme vers Blizzard.
let running = 0;
const queue: (() => void)[] = [];
async function limited<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= blizzard.maxParallel) await new Promise<void>((res) => queue.push(res));
  running++;
  try { return await fn(); } finally { running--; queue.shift()?.(); }
}

interface CacheEntry { value: unknown; expires: number }
const cache = new Map<string, CacheEntry>(); // clé -> { value, expires } ; value peut être une ApiError mise en cache
export async function cached<T>(key: string, ttl: number, fn: () => Promise<T>, notFoundTtl: number = ttl): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expires) {
    if (hit.value instanceof ApiError) throw hit.value;
    return hit.value as T;
  }
  try {
    const value = await fn();
    cache.set(key, { value, expires: Date.now() + ttl });
    return value;
  } catch (e) {
    if (e instanceof ApiError && e.status === http.notFound) cache.set(key, { value: e, expires: Date.now() + notFoundTtl });
    throw e;
  }
}

export async function get<T>(path: string, namespace: string): Promise<T> {
  return limited(async () => {
    const url = `${API_HOST}${path}?namespace=${namespace}&locale=${blizzard.locale}`;
    let r = await fetch(url, { headers: { Authorization: `Bearer ${await getToken()}` } });
    if (r.status === http.unauthorized) { token = null; r = await fetch(url, { headers: { Authorization: `Bearer ${await getToken()}` } }); }
    if (r.status === http.notFound) throw new ApiError(http.notFound, t('blizzard.notFound'));
    if (!r.ok) throw new ApiError(http.badGateway, t('blizzard.httpError', { status: r.status }));
    return (await r.json()) as T;
  });
}

// L'API renvoie des liens avec un namespace « épinglé » (ex. static-1.60.1_70399-forever-eu) : on le réutilise.
export function namespaceOf(href: string | undefined, fallback: string): string {
  const m = /[?&]namespace=([^&]+)/.exec(href || '');
  return m?.[1] ?? fallback;
}
