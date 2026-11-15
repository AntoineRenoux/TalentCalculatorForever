// Sonde de l'API Blizzard pour WoW Forever (non documentée officiellement).
// Usage : BNET_CLIENT_ID=… BNET_CLIENT_SECRET=… node server/dist/server/src/probe.js [slug-perso …]
// Écrit chaque réponse dans ./samples/ et affiche un résumé (statut + clés JSON).
import { mkdir, writeFile } from 'node:fs/promises';
import { serverConfig } from '../../config/server.config.ts';
import { siteConfig } from '../../config/site.config.ts';
import { t } from './i18n.ts';

const { blizzard, probe: cfg } = serverConfig;
const REGION = process.env.BNET_REGION || blizzard.defaultRegion;
const API = blizzard.apiHost(REGION);
const GUILD_NAME = siteConfig.guild.name;
const FALLBACK_CHARS = process.argv.slice(cfg.argvOffset);

const { BNET_CLIENT_ID: id, BNET_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error(t('probe.credentialsRequired'));
  process.exit(1);
}

async function token(): Promise<string> {
  const r = await fetch(blizzard.tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error(t('probe.tokenError', { status: r.status }));
  return ((await r.json()) as { access_token: string }).access_token;
}

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
await mkdir(cfg.samplesDir, { recursive: true });
const tk = await token();
console.log(t('probe.tokenOk'));

type Json = Record<string, unknown>;

async function probe(label: string, path: string, namespace: string): Promise<Json | null> {
  const url = `${API}${path}${path.includes('?') ? '&' : '?'}namespace=${namespace}&locale=${blizzard.locale}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${tk}` } });
  const text = await r.text();
  let json: Json | null = null;
  try { json = JSON.parse(text) as Json; } catch { /* réponse non JSON */ }
  const file = `${cfg.samplesDir}/${label.replace(/[^a-z0-9_-]+/gi, '_')}.json`;
  await writeFile(file, JSON.stringify({ url: url.replace(API, ''), status: r.status, body: json ?? text.slice(0, cfg.rawBodyMaxLength) }, null, cfg.jsonIndent));
  console.log(String(r.status).padEnd(cfg.statusPad), label.padEnd(cfg.labelPad), json ? Object.keys(json).join(',').slice(0, cfg.keysMaxLength) : '');
  return r.ok ? json : null;
}

// 1. Namespaces candidats et rulesets
for (const ns of cfg.rulesetNamespaces(REGION)) {
  await probe(`ruleset-index_${ns}`, cfg.rulesetPath, ns);
}

// 2. Guilde : plusieurs formes de slug possibles
const PROFILE = blizzard.namespaces.profile(REGION);
const gslug = slugify(GUILD_NAME);
let roster: Json | null = null;
for (const path of [`/data/wow/guild/${gslug}`, `/data/wow/guild/${gslug}/roster`]) {
  const j = await probe(`guild${path.replaceAll('/', '_')}`, path, PROFILE);
  if (path.endsWith('roster') && j) roster = j;
}

// 3. Personnages : premiers membres du roster, sinon slugs passés en argument
interface RosterEntry { slug?: string; character?: { slug?: string } }
const rosterMembers = (roster?.members as RosterEntry[] | undefined) ?? [];
const members = rosterMembers.map((m) => m.character?.slug || m.slug).filter((s): s is string => !!s);
const chars = [...new Set([...members.slice(0, cfg.rosterSample), ...FALLBACK_CHARS])];
for (const c of chars) {
  for (const sub of cfg.characterSubPaths) {
    await probe(`char_${c}${sub.replace('/', '_')}`, `/profile/wow/character/${c}${sub}`, PROFILE);
  }
}

console.log(t('probe.summary', { count: chars.length, dir: cfg.samplesDir }));
