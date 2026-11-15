// API de l'armurerie : uniquement les personnages de la guilde configurée dans config.mjs.
import http from 'node:http';
import { GUILD_NAME, GUILD_SLUG, NS_PROFILE, NS_STATIC, PORT, TTL } from './config.mjs';
import { ApiError, cached, get, namespaceOf } from './blizzard.mjs';

const CLASS_KEYS = { 1: 'warrior', 2: 'paladin', 3: 'hunter', 4: 'rogue', 5: 'priest', 7: 'shaman', 8: 'mage', 9: 'warlock', 11: 'druid' };

async function guild() {
  return cached('guild', TTL.roster, async () => {
    const [info, roster] = await Promise.all([
      get(`/data/wow/guild/${encodeURIComponent(GUILD_SLUG)}`, NS_PROFILE),
      get(`/data/wow/guild/${encodeURIComponent(GUILD_SLUG)}/roster`, NS_PROFILE),
    ]);
    const members = roster.members.map(({ character: c, rank }) => ({
      slug: c.slug,
      name: c.name,
      surname: c.surname || '',
      level: c.level,
      classId: c.playable_class?.id,
      classKey: CLASS_KEYS[c.playable_class?.id] || null,
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
async function characterMedia(slug) {
  return cached(`media:${slug}`, TTL.roster, async () => {
    const m = await get(`/profile/wow/character/${encodeURIComponent(slug)}/character-media`, NS_PROFILE);
    return Object.fromEntries((m.assets || []).map((a) => [a.key, a.value]));
  }, TTL.roster);
}
async function avatar(slug) {
  try { return (await characterMedia(slug)).avatar || null; } catch { return null; }
}

async function itemIcon(item) {
  const id = item.media?.id ?? item.item?.id;
  if (!id) return null;
  const ns = namespaceOf(item.media?.key?.href, NS_STATIC);
  try {
    return await cached(`icon:${id}`, TTL.itemMedia, async () => {
      const m = await get(`/data/wow/media/item/${id}`, ns);
      return m.assets?.find((a) => a.key === 'icon')?.value || null; // URL render.worldofwarcraft.com
    });
  } catch { return null; }
}

// Lignes d'infobulle d'un objet, dans l'ordre du jeu.
function itemLines(it) {
  const L = [];
  const push = (text, cls) => { if (text) L.push(cls ? { text, cls } : { text }); };
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

function pickStats(s) {
  if (!s) return null;
  const v = (x) => (x && typeof x === 'object' ? (x.effective ?? x.value ?? null) : x ?? null);
  return {
    health: s.health, power: s.power, powerType: s.power_type?.name,
    strength: v(s.strength), agility: v(s.agility), stamina: v(s.stamina), intellect: v(s.intellect), spirit: v(s.spirit),
    armor: v(s.armor), attackPower: s.attack_power, rangedAttackPower: s.ranged_attack_power, spellPower: s.spell_power,
    meleeCrit: v(s.melee_crit), rangedCrit: v(s.ranged_crit), spellCrit: v(s.spell_crit),
    dodge: v(s.dodge), parry: v(s.parry), block: v(s.block), defense: v(s.defense),
  };
}

async function character(slug) {
  const g = await guild();
  const member = g.members.find((m) => m.slug === slug);
  if (!member) throw new ApiError(403, `Ce personnage ne fait pas partie de la guilde ${g.name}.`);

  return cached(`char:${slug}`, TTL.character, async () => {
    const base = `/profile/wow/character/${encodeURIComponent(slug)}`;
    let profile;
    try { profile = await get(base, NS_PROFILE); } catch (e) {
      if (e.status === 404) throw new ApiError(404, 'Personnage pas encore visible sur l’API Blizzard : il faut être niveau 10 ou plus et s’être déconnecté au moins une fois.');
      throw e;
    }
    const [equipment, specs, assets, stats] = await Promise.allSettled([
      get(`${base}/equipment`, NS_PROFILE),
      get(`${base}/specializations`, NS_PROFILE),
      characterMedia(slug),
      get(`${base}/statistics`, NS_PROFILE),
    ]).then((rs) => rs.map((r) => (r.status === 'fulfilled' ? r.value : null)));

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
      talents: (grp.specializations || []).flatMap((sp) => (sp.talents || []).map((t) => [t.talent?.id, t.talent_rank])).filter(([id]) => id),
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
      classKey: CLASS_KEYS[profile.character_class?.id] || member.classKey,
      rank: member.rank,
      guild: g.name,
      avatar: assets?.avatar || null,
      render: assets?.['main-raw'] || null,
      items,
      talentGroups: groups,
      stats: pickStats(stats),
      updatedAt: new Date().toISOString(),
    };
  }, TTL.notFound);
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Méthode non autorisée' });
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    if (path === '/api/health') return send(res, 200, { ok: true });
    if (path === '/api/guild') return send(res, 200, await guild());
    const m = /^\/api\/character\/([^/]{1,80})$/.exec(path);
    if (m) return send(res, 200, await character(m[1].toLowerCase()));
    send(res, 404, { error: 'Route inconnue' });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    if (status === 500) console.error(e);
    send(res, status, { error: e instanceof ApiError ? e.message : 'Erreur interne' });
  }
});

server.listen(PORT, () => console.log(`armurerie ${GUILD_NAME} : port ${PORT}`));
