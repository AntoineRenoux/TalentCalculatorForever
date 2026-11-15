// API de l'armurerie : uniquement les personnages de la guilde configurée dans config/site.config.ts.
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import { recruitmentConfig } from '../../config/recruitment.config.ts';
import { type StatPick, serverConfig } from '../../config/server.config.ts';
import { siteConfig } from '../../config/site.config.ts';
import { ApiError, NS_PROFILE, NS_STATIC, cached, get, namespaceOf } from './blizzard.ts';
import { t } from './i18n.ts';
import { FormError, submitCandidature } from './recruitment.ts';

const { http: status, headers, routes, ttl: TTL, classKeys: CLASS_KEYS, mediaAssets } = serverConfig;
const GUILD_NAME = siteConfig.guild.name;
const GUILD_SLUG = siteConfig.guild.slug;
const PORT = Number(process.env.PORT) || serverConfig.defaultPort;
const CHARACTER_ROUTE = new RegExp(`^${routes.characterPrefix.replaceAll('/', '\\/')}([^/]{1,${serverConfig.slugMaxLength}})$`);

// --- Réponses Blizzard (seuls les champs lus sont décrits) ---
interface Named { id?: number; name?: string; type?: string }
interface Display { display_string?: string }
interface RosterMember {
  character: { slug: string; name: string; surname?: string; level: number; playable_class?: Named; playable_race?: Named };
  rank: number;
}
interface GuildInfo { name?: string; faction?: Named; ruleset?: Named }
interface Roster { members: RosterMember[] }
interface MediaResponse { assets?: { key: string; value: string }[] }
interface EquippedItem {
  slot?: Named;
  item?: { id?: number };
  media?: { id?: number; key?: { href?: string } };
  name?: string;
  quality?: Named;
  binding?: Named;
  unique_equipped?: string;
  inventory_type?: Named;
  item_subclass?: Named;
  weapon?: { damage?: Display; attack_speed?: Display; dps?: Display };
  armor?: { display?: Display };
  shield_block?: { display?: Display };
  stats?: { display?: Display; is_negated?: boolean; is_equip_bonus?: boolean }[];
  enchantments?: Display[];
  durability?: Display;
  requirements?: { playable_classes?: Display; level?: Display };
  level?: Display;
  spells?: { description?: string }[];
  set?: Display & { effects?: (Display & { is_active?: boolean })[] };
  description?: string;
}
interface Equipment { equipped_items?: EquippedItem[] }
interface Specializations {
  specialization_groups?: { is_active?: boolean; specializations?: { talents?: { talent?: { id?: number }; talent_rank?: number }[] }[] }[];
}
interface Profile {
  name: string; surname?: string; level: number; gender?: Named; race?: Named; character_class?: Named;
}
type Statistics = Record<string, unknown>;

interface Member {
  slug: string; name: string; surname: string; level: number;
  classId: number | undefined; classKey: string | null; raceId: number | undefined; rank: number;
  avatar?: string | null;
}
interface GuildData {
  name: string; faction: string | undefined; ruleset: string | undefined;
  memberCount: number; members: Member[]; updatedAt: string;
}

const classKey = (id: number | undefined): string | undefined => (id === undefined ? undefined : CLASS_KEYS[id]);

async function guild(): Promise<GuildData> {
  return cached('guild', TTL.roster, async () => {
    const [info, roster] = await Promise.all([
      get<GuildInfo>(`/data/wow/guild/${encodeURIComponent(GUILD_SLUG)}`, NS_PROFILE),
      get<Roster>(`/data/wow/guild/${encodeURIComponent(GUILD_SLUG)}/roster`, NS_PROFILE),
    ]);
    const members: Member[] = roster.members.map(({ character: c, rank }) => ({
      slug: c.slug,
      name: c.name,
      surname: c.surname || '',
      level: c.level,
      classId: c.playable_class?.id,
      classKey: classKey(c.playable_class?.id) || null,
      raceId: c.playable_race?.id,
      rank,
    })).sort((a, b) => a.rank - b.rank || b.level - a.level || a.name.localeCompare(b.name));
    await Promise.all(members.map(async (m) => { m.avatar = await avatar(m.slug); }));
    return {
      name: info.name || GUILD_NAME,
      faction: info.faction?.name,
      ruleset: info.ruleset?.name,
      memberCount: members.length,
      members,
      updatedAt: new Date().toISOString(),
    };
  });
}

// Image du perso (null tant que Blizzard ne l'a pas générée ou si le perso est sous le niveau 10).
async function characterMedia(slug: string): Promise<Record<string, string>> {
  return cached(`media:${slug}`, TTL.roster, async () => {
    const m = await get<MediaResponse>(`/profile/wow/character/${encodeURIComponent(slug)}/character-media`, NS_PROFILE);
    return Object.fromEntries((m.assets || []).map((a) => [a.key, a.value]));
  }, TTL.roster);
}
async function avatar(slug: string): Promise<string | null> {
  try { return (await characterMedia(slug))[mediaAssets.avatar] || null; } catch { return null; }
}

async function itemIcon(item: EquippedItem): Promise<string | null> {
  const id = item.media?.id ?? item.item?.id;
  if (!id) return null;
  const ns = namespaceOf(item.media?.key?.href, NS_STATIC);
  try {
    return await cached(`icon:${id}`, TTL.itemMedia, async () => {
      const m = await get<MediaResponse>(`/data/wow/media/item/${id}`, ns);
      return m.assets?.find((a) => a.key === mediaAssets.icon)?.value || null; // URL render.worldofwarcraft.com
    });
  } catch { return null; }
}

interface Line { text: string; cls?: string }

// Lignes d'infobulle d'un objet, dans l'ordre du jeu.
function itemLines(it: EquippedItem): Line[] {
  const L: Line[] = [];
  const push = (text: string | undefined, cls?: string) => { if (text) L.push(cls ? { text, cls } : { text }); };
  push(it.binding?.name);
  push(it.unique_equipped);
  const slot = it.inventory_type?.name, sub = it.item_subclass?.name;
  if (slot || sub) push([slot, sub].filter(Boolean).join(' · '));
  if (it.weapon) {
    push(it.weapon.damage?.display_string);
    push(it.weapon.attack_speed?.display_string);
    push(it.weapon.dps?.display_string);
  }
  push(it.armor?.display?.display_string);
  push(it.shield_block?.display?.display_string);
  (it.stats || []).forEach((s) => push(s.display?.display_string, s.is_negated ? 'neg' : s.is_equip_bonus ? 'green' : ''));
  (it.enchantments || []).forEach((e) => push(e.display_string, 'green'));
  push(it.durability?.display_string);
  push(it.requirements?.playable_classes?.display_string);
  push(it.requirements?.level?.display_string);
  push(it.level?.display_string);
  (it.spells || []).forEach((s) => push(s.description, 'green'));
  if (it.set) {
    push(it.set.display_string, 'set');
    (it.set.effects || []).forEach((e) => push(e.display_string, e.is_active ? 'green' : 'muted'));
  }
  push(it.description, 'flavor');
  return L;
}

function pickStat(s: Statistics, { source, mode }: StatPick): unknown {
  const x = s[source];
  if (mode === 'raw') return x;
  if (mode === 'name') return x && typeof x === 'object' ? (x as Named).name : undefined;
  if (x && typeof x === 'object') {
    const o = x as { effective?: unknown; value?: unknown };
    return o.effective ?? o.value ?? null;
  }
  return x ?? null;
}

function pickStats(s: Statistics | null): Record<string, unknown> | null {
  if (!s) return null;
  return Object.fromEntries(serverConfig.stats.map((p) => [p.key, pickStat(s, p)]));
}

async function character(slug: string) {
  const g = await guild();
  const member = g.members.find((m) => m.slug === slug);
  if (!member) throw new ApiError(status.forbidden, t('armory.notInGuild', { guild: g.name }));

  return cached(`char:${slug}`, TTL.character, async () => {
    const base = `/profile/wow/character/${encodeURIComponent(slug)}`;
    let profile: Profile;
    try { profile = await get<Profile>(base, NS_PROFILE); } catch (e) {
      if (e instanceof ApiError && e.status === status.notFound) throw new ApiError(status.notFound, t('armory.characterNotVisible'));
      throw e;
    }
    const settled = await Promise.allSettled([
      get<Equipment>(`${base}/equipment`, NS_PROFILE),
      get<Specializations>(`${base}/specializations`, NS_PROFILE),
      characterMedia(slug),
      get<Statistics>(`${base}/statistics`, NS_PROFILE),
    ] as const);
    const ok = <T>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null);
    const [equipment, specs, assets, stats] = [ok(settled[0]), ok(settled[1]), ok(settled[2]), ok(settled[3])];

    const items = await Promise.all((equipment?.equipped_items || []).map(async (it) => ({
      slot: it.slot?.type,
      slotName: it.slot?.name,
      id: it.item?.id,
      name: it.name,
      quality: it.quality?.type,
      icon: await itemIcon(it),
      lines: itemLines(it),
    })));

    const groups = (specs?.specialization_groups || []).map((grp) => ({
      active: !!grp.is_active,
      talents: (grp.specializations || []).flatMap((sp) => (sp.talents || []).map((tl) => [tl.talent?.id, tl.talent_rank])).filter(([id]) => id),
    }));
    return {
      slug,
      name: profile.name,
      surname: profile.surname || member.surname,
      level: profile.level,
      gender: profile.gender?.name,
      race: profile.race?.name,
      raceId: profile.race?.id,
      className: profile.character_class?.name,
      classKey: classKey(profile.character_class?.id) || member.classKey,
      rank: member.rank,
      guild: g.name,
      avatar: assets?.[mediaAssets.avatar] || null,
      render: assets?.[mediaAssets.render] || null,
      items,
      talentGroups: groups,
      stats: pickStats(stats),
      updatedAt: new Date().toISOString(),
    };
  }, TTL.notFound);
}

function send(res: ServerResponse, code: number, body: unknown): void {
  res.writeHead(code, {
    'Content-Type': headers.contentType,
    'Cache-Control': code === status.ok ? headers.cacheOk : headers.cacheError,
  });
  res.end(JSON.stringify(body));
}

function readJson(req: IncomingMessage, limit: number = recruitmentConfig.serverMaxBodyBytes): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      if (tooLarge) return;
      size += c.length;
      if (size > limit) { tooLarge = true; chunks.length = 0; reject(new FormError(status.payloadTooLarge, t('recruitment.tooLarge'))); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (tooLarge) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new FormError(status.badRequest, t('recruitment.unreadable'))); }
    });
    req.on('error', reject);
  });
}

// Caddy transmet l'IP du visiteur dans X-Forwarded-For.
const clientIp = (req: IncomingMessage): string | undefined => {
  const fwd = req.headers['x-forwarded-for'];
  return (typeof fwd === 'string' ? fwd : '').split(',')[0]?.trim() || req.socket.remoteAddress;
};

const server = http.createServer(async (req, res) => {
  let path: string;
  try { path = decodeURIComponent(new URL(req.url ?? '', serverConfig.urlBase).pathname); } catch { return send(res, status.badRequest, { error: t('http.invalidAddress') }); }

  if (req.method === 'POST' && path === routes.recruitment) {
    try {
      await submitCandidature(await readJson(req), clientIp(req));
      return send(res, status.ok, { ok: true });
    } catch (e) {
      const code = e instanceof FormError ? e.status : status.internalError;
      if (code === status.internalError) console.error(e);
      // Corps trop gros : on coupe la connexion une fois la réponse partie, sans lire le reste.
      if (code === status.payloadTooLarge) res.once('finish', () => req.destroy());
      return send(res, code, { error: e instanceof FormError ? e.message : t('http.internalError') });
    }
  }
  if (req.method !== 'GET') return send(res, status.methodNotAllowed, { error: t('http.methodNotAllowed') });
  try {
    if (path === routes.health) return send(res, status.ok, { ok: true });
    if (path === routes.guild) return send(res, status.ok, await guild());
    const m = CHARACTER_ROUTE.exec(path);
    if (m?.[1]) return send(res, status.ok, await character(m[1].toLowerCase()));
    send(res, status.notFound, { error: t('http.unknownRoute') });
  } catch (e) {
    const code = e instanceof ApiError ? e.status : status.internalError;
    if (code === status.internalError) console.error(e);
    send(res, code, { error: e instanceof ApiError ? e.message : t('http.internalError') });
  }
});

server.listen(PORT, () => console.log(t('console.listening', { guild: GUILD_NAME, port: PORT })));
