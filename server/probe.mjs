// Sonde de l'API Blizzard pour WoW Forever (non documentée officiellement).
// Usage : BNET_CLIENT_ID=… BNET_CLIENT_SECRET=… node probe.mjs [slug-perso …]
// Écrit chaque réponse dans ./samples/ et affiche un résumé (statut + clés JSON).
import { mkdir, writeFile } from 'node:fs/promises';

const REGION = process.env.BNET_REGION || 'eu';
const API = `https://${REGION}.api.blizzard.com`;
const GUILD_NAME = 'Former Hope';
const FALLBACK_CHARS = process.argv.slice(2);

const { BNET_CLIENT_ID: id, BNET_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('BNET_CLIENT_ID et BNET_CLIENT_SECRET sont requis.');
  process.exit(1);
}

async function token() {
  const r = await fetch('https://oauth.battle.net/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error(`token: HTTP ${r.status}`);
  return (await r.json()).access_token;
}

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
await mkdir('samples', { recursive: true });
const tk = await token();
console.log('token OK');

async function probe(label, path, namespace) {
  const url = `${API}${path}${path.includes('?') ? '&' : '?'}namespace=${namespace}&locale=fr_FR`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${tk}` } });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  const file = `samples/${label.replace(/[^a-z0-9_-]+/gi, '_')}.json`;
  await writeFile(file, JSON.stringify({ url: url.replace(API, ''), status: r.status, body: json ?? text.slice(0, 2000) }, null, 2));
  console.log(String(r.status).padEnd(4), label.padEnd(40), json ? Object.keys(json).join(',').slice(0, 120) : '');
  return r.ok ? json : null;
}

// 1. Namespaces candidats et rulesets
for (const ns of [`dynamic-forever-${REGION}`, `dynamic-classic1x-${REGION}`]) {
  await probe(`ruleset-index_${ns}`, '/data/wow/ruleset/index', ns);
}

// 2. Guilde : plusieurs formes de slug possibles
const PROFILE = `profile-forever-${REGION}`;
const gslug = slugify(GUILD_NAME);
let roster = null;
for (const path of [`/data/wow/guild/${gslug}`, `/data/wow/guild/${gslug}/roster`]) {
  const j = await probe(`guild${path.replaceAll('/', '_')}`, path, PROFILE);
  if (path.endsWith('roster') && j) roster = j;
}

// 3. Personnages : premiers membres du roster, sinon slugs passés en argument
const members = roster?.members?.map((m) => m.character?.slug || m.slug).filter(Boolean) ?? [];
const chars = [...new Set([...members.slice(0, 2), ...FALLBACK_CHARS])];
for (const c of chars) {
  for (const sub of ['', '/equipment', '/specializations', '/character-media', '/statistics']) {
    await probe(`char_${c}${sub.replace('/', '_')}`, `/profile/wow/character/${c}${sub}`, PROFILE);
  }
}

console.log(`\n${chars.length} perso(s) testé(s). Réponses dans ./samples/`);
