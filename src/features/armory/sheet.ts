/** Fiche d'un personnage : équipement, rendu, talents (avec ouverture dans le calculateur) et caractéristiques. */
import { armoryConfig, type StatRow } from '../../../config/armory.config.ts';
import { siteConfig } from '../../../config/site.config.ts';
import { talentsConfig } from '../../../config/talents.config.ts';
import { classes, leveling } from '../../data/index.ts';
import { esc } from '../../shared/dom.ts';
import { formatNumber, t, tDynamic } from '../../shared/i18n.ts';
import { classIconUrl, iconUrl } from '../../shared/icons.ts';
import { encodeBuild } from '../talents/hash.ts';
import type { Character, Item } from './api.ts';

const { slots, qualities, guildMasterRank, percentDecimals } = armoryConfig;
const { cssVars } = talentsConfig;

export const rankLabel = (rank: number): string =>
  rank === guildMasterRank ? t('armory.rank.master') : t('armory.rank.other', { rank });

const qualityClass = (q: string): string => ((qualities as readonly string[]).includes(q) ? `q-${q.toLowerCase()}` : '');

function slotHTML(slot: string, item: Item | undefined): string {
  const slotName = tDynamic(`armory.slots.${slot}`);
  if (!item) return `<div class="slot empty-slot"><span class="ico"></span><span class="s-name muted">${esc(slotName)}</span></div>`;
  const icon = item.icon ?? iconUrl(null, 'medium');
  return `<div class="slot" data-slot="${esc(slot)}" tabindex="0">
    <span class="ico ${qualityClass(item.quality)}"><img src="${esc(icon)}" alt=""></span>
    <span class="s-name"><b class="${qualityClass(item.quality)}">${esc(item.name)}</b><span class="muted">${esc(item.slotName ?? slotName)}</span></span>
  </div>`;
}

export function itemTooltip(item: Item): string {
  return `<div class="tt-name ${qualityClass(item.quality)}">${esc(item.name)}</div>`
    + item.lines.map((l) => `<div class="tt-line ${esc(l.cls ?? '')}">${esc(l.text)}</div>`).join('');
}

/** Lien du calculateur reproduisant les talents du personnage (groupe actif, ou le plus rempli s'il est vide). */
export function talentLink(ch: Character): { hash: string; points: number[]; classIndex: number } | null {
  const classIndex = classes.findIndex((c) => c.key === ch.classKey);
  const cls = classes[classIndex];
  if (!cls || !ch.talentGroups.length) return null;
  const total = (g: Character['talentGroups'][number]) => g.talents.reduce((s, [, r]) => s + r, 0);
  const active = ch.talentGroups.find((g) => g.active);
  const group = active && total(active) ? active : [...ch.talentGroups].sort((a, b) => total(b) - total(a))[0];
  if (!group) return null;
  const byDef = new Map(group.talents);
  const rankById = new Map(cls.trees.flatMap((tr) => tr.talents.map((tl) => [tl.id, Math.min(byDef.get(tl.def) ?? 0, tl.max)] as const)));
  const points = cls.trees.map((tr) => tr.talents.reduce((s, tl) => s + (rankById.get(tl.id) ?? 0), 0));
  const race = leveling.classes[cls.key]?.races.includes(ch.raceId) ? ch.raceId : null;
  return { hash: encodeBuild(cls, (id) => rankById.get(id) ?? 0, race), points, classIndex };
}

function talentsHTML(ch: Character): string {
  const link = talentLink(ch);
  const cls = link ? classes[link.classIndex] : undefined;
  if (!link || !cls) {
    return `<section class="side-box"><h3>${esc(t('armory.sheet.talentsTitle'))}</h3><p class="muted">${esc(t('armory.sheet.talentsUnavailable'))}</p></section>`;
  }
  const total = link.points.reduce((a, b) => a + b, 0);
  return `<section class="side-box">
    <h3>${esc(t('armory.sheet.talentsTitle'))} <span class="muted">${esc(link.points.join(t('talents.summary.spreadSeparator')))}</span></h3>
    <ul class="spread">${cls.trees.map((tr, i) => `<li><img src="${iconUrl(tr.icon, 'small')}" alt="">${esc(tr.name)}<b>${link.points[i]}</b></li>`).join('')}</ul>
    <button type="button" class="primary" id="openInCalc" data-hash="${esc(link.hash)}"${total ? '' : ' disabled'}>${esc(t('armory.sheet.openInCalc'))}</button>
  </section>`;
}

function statValue(row: StatRow, raw: number | string | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  if (row.hideZero && !n) return null;
  return row.format === 'percent'
    ? t('armory.sheet.percent', { value: formatNumber(n, { minimumFractionDigits: percentDecimals, maximumFractionDigits: percentDecimals }) })
    : formatNumber(n);
}

function statsHTML(stats: Character['stats']): string {
  if (!stats) return '';
  const rows = armoryConfig.stats
    .map((row: StatRow) => {
      const value = statValue(row, stats[row.key]);
      const fromLabel = row.labelFrom ? stats[row.labelFrom] : null;
      const label = typeof fromLabel === 'string' && fromLabel ? fromLabel : tDynamic(`armory.stats.${row.labelKey}`);
      return value === null ? '' : `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`;
    })
    .join('');
  return `<section class="side-box"><h3>${esc(t('armory.sheet.statsTitle'))}</h3><dl class="stats">${rows}</dl></section>`;
}

export function sheetHTML(ch: Character): string {
  const cls = classes.find((c) => c.key === ch.classKey);
  const bySlot = new Map(ch.items.map((it) => [it.slot, it]));
  const avatar = ch.avatar ?? classIconUrl(ch.classKey, 'large');
  const column = (list: readonly string[], extra = '') =>
    `<div class="slots${extra}">${list.map((s) => slotHTML(s, bySlot.get(s))).join('')}</div>`;
  return `
    <a class="back" href="#${esc(talentsConfig.hash.armory)}">${esc(t('armory.sheet.back'))}</a>
    <header class="char-head" style="${cssVars.classColor}:${esc(cls?.color ?? '')}">
      <img class="avatar" src="${esc(avatar)}" alt="">
      <div>
        <h2>${esc(ch.name)} <span class="muted">${esc(ch.surname)}</span></h2>
        <p>${esc(t('armory.sheet.headline', { level: ch.level, race: ch.race ?? '' }))}<b class="cls-text">${esc(ch.className ?? '')}</b></p>
        <p class="muted">${esc(t('armory.rank.ofGuild', { rank: rankLabel(ch.rank), guild: ch.guild || siteConfig.guild.name }))}</p>
      </div>
    </header>
    <div class="char-body">
      <div class="doll">
        ${column(slots.left)}
        <div class="render">${ch.render ? `<img src="${esc(ch.render)}" alt="${esc(t('armory.sheet.renderAlt', { name: ch.name }))}">` : ''}</div>
        ${column(slots.right)}
        ${column(slots.bottom, ' bottom')}
      </div>
      <aside class="char-side">${talentsHTML(ch)}${statsHTML(ch.stats)}</aside>
    </div>
    <p class="muted small">${esc(t('armory.sheet.source'))}</p>`;
}
