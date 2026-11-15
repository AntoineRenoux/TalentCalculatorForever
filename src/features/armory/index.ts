/**
 * Armurerie de la guilde, dans la page du calculateur.
 * Routage : #armory (liste des membres) et #armory/<slug> (fiche) ; les autres ancres sont celles du calculateur.
 */
import { talentsConfig } from '../../../config/talents.config.ts';
import { classes, leveling } from '../../data/index.ts';
import { byId, el, esc, normalize } from '../../shared/dom.ts';
import { t } from '../../shared/i18n.ts';
import { classIconUrl } from '../../shared/icons.ts';
import { bindTooltip, hideTooltip } from '../../shared/tooltip.ts';
import { setLevel } from '../talents/calculator.ts';
import { state } from '../talents/state.ts';
import { loadCharacter, loadGuild, type Guild } from './api.ts';
import { itemTooltip, rankLabel, sheetHTML } from './sheet.ts';

const { hash, cssVars } = talentsConfig;
const ids = {
  armory: 'armory', list: 'armoryList', sheet: 'armorySheet', members: 'memberList', classes: 'memberClasses',
  search: 'memberSearch', guildName: 'guildName', guildMeta: 'guildMeta', calc: 'calc', welcome: 'welcome',
  tabCalc: 'tabCalc', menuCalc: 'menuCalc', menuArmory: 'menuArmory',
} as const;
const TOOLBAR = '.toolbar';
const ARIA_CURRENT = 'aria-current';

const filters = { classKey: null as string | null, query: '' };
/** Niveau à appliquer après « Ouvrir dans le calculateur ». */
let pendingLevel: number | null = null;

const classOf = (key: string | null) => classes.find((c) => c.key === key);
const raceName = (id: number) => leveling.races[id]?.name ?? '';

// ---------- Liste des membres ----------
function renderClassFilter(guild: Guild): void {
  const wrap = byId(ids.classes);
  if (wrap.childElementCount) return;
  const present = new Set(guild.members.map((m) => m.classKey).filter(Boolean));
  const chip = (key: string | null, label: string) => {
    const button = el('button', `chip${filters.classKey === key ? ' on' : ''}`, { type: 'button' });
    button.innerHTML = (key ? `<img src="${classIconUrl(key, 'small')}" alt="">` : '') + esc(label);
    button.addEventListener('click', () => {
      filters.classKey = key;
      wrap.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === button));
      renderMembers(guild);
    });
    wrap.append(button);
  };
  chip(null, t('armory.list.allClasses'));
  classes.filter((c) => present.has(c.key)).forEach((c) => chip(c.key, c.name));
}

function renderMembers(guild: Guild): void {
  const q = normalize(filters.query);
  const list = guild.members.filter((m) =>
    (!filters.classKey || m.classKey === filters.classKey) && (!q || normalize(`${m.name} ${m.surname}`).includes(q)));
  const box = byId(ids.members);
  if (!list.length) { box.innerHTML = `<p class="empty">${esc(t('armory.list.noMatch'))}</p>`; return; }
  box.innerHTML = list.map((m) => {
    const cls = classOf(m.classKey);
    const classIcon = classIconUrl(m.classKey ?? '', 'small');
    const picture = m.avatar ?? classIconUrl(m.classKey ?? '', 'large');
    return `<a class="member" href="#${esc(hash.armory)}${hash.segmentSeparator}${encodeURIComponent(m.slug)}" style="${cssVars.classColor}:${esc(cls?.color ?? '')}">
      <span class="m-avatar"><img src="${esc(picture)}" alt="" loading="lazy">${m.avatar ? `<img class="m-class" src="${classIcon}" alt="">` : ''}</span>
      <span class="m-name">${esc(m.name)} <span class="muted">${esc(m.surname)}</span></span>
      <span class="m-info">${esc(t('armory.list.memberInfo', { level: m.level, race: raceName(m.raceId), className: cls?.name ?? '' }))}</span>
      <span class="m-rank">${esc(rankLabel(m.rank))}</span>
    </a>`;
  }).join('');
}

async function showList(): Promise<void> {
  byId(ids.list).hidden = false;
  byId(ids.sheet).hidden = true;
  const box = byId(ids.members);
  if (!box.dataset.loaded) box.innerHTML = `<p class="empty">${esc(t('armory.list.loading'))}</p>`;
  let guild: Guild;
  try { guild = await loadGuild(); } catch (e) {
    box.innerHTML = `<p class="error">${esc(t('armory.list.loadError', { error: (e as Error).message }))}</p>`;
    return;
  }
  box.dataset.loaded = String(true);
  byId(ids.guildName).textContent = guild.name;
  byId(ids.guildMeta).textContent = [
    guild.faction,
    guild.ruleset ? t('armory.list.ruleset', { ruleset: guild.ruleset }) : '',
    t('armory.list.memberCount', { count: guild.memberCount }),
  ].filter(Boolean).join(t('armory.list.metaSeparator'));
  renderClassFilter(guild);
  renderMembers(guild);
}

// ---------- Fiche ----------
const currentSlug = (): string => decodeURIComponent(location.hash.slice(1).split(hash.segmentSeparator)[1] ?? '');

async function showCharacter(slug: string): Promise<void> {
  byId(ids.list).hidden = true;
  const sheet = byId(ids.sheet);
  sheet.hidden = false;
  sheet.innerHTML = `<p class="empty">${esc(t('armory.sheet.loading'))}</p>`;
  try {
    const ch = await loadCharacter(slug);
    if (currentSlug() !== slug) return; // le visiteur est déjà ailleurs
    document.title = t('armory.characterTitle', { name: ch.name, surname: ch.surname });
    sheet.innerHTML = sheetHTML(ch);
    const bySlot = new Map(ch.items.map((it) => [it.slot, it]));
    sheet.querySelectorAll<HTMLElement>('.slot[data-slot]').forEach((node) => {
      const item = bySlot.get(node.dataset.slot ?? '');
      if (item) bindTooltip(node, () => itemTooltip(item));
    });
    sheet.querySelector<HTMLImageElement>('.render img')?.addEventListener('error', (e) => (e.target as HTMLElement).remove());
    const open = sheet.querySelector<HTMLButtonElement>('#openInCalc');
    open?.addEventListener('click', () => { pendingLevel = ch.level; location.hash = open.dataset.hash ?? ''; });
  } catch (e) {
    sheet.innerHTML = `<a class="back" href="#${esc(hash.armory)}">${esc(t('armory.sheet.back'))}</a><p class="error">${esc((e as Error).message)}</p>`;
  }
}

// ---------- Routage ----------
function route(): void {
  const [key, slug] = location.hash.slice(1).split(hash.segmentSeparator);
  const inArmory = key === hash.armory;
  byId(ids.armory).hidden = !inArmory;
  const toolbar = document.querySelector<HTMLElement>(TOOLBAR);
  if (toolbar) toolbar.hidden = inArmory;
  byId(ids.calc).hidden = inArmory || !state.cls;
  byId(ids.welcome).hidden = inArmory || !!state.cls;
  document.querySelectorAll<HTMLElement>('.tab').forEach((tab) => tab.classList.toggle('on', (tab.dataset.tab === hash.armory) === inArmory));
  const [menuOn, menuOff] = inArmory ? [ids.menuArmory, ids.menuCalc] : [ids.menuCalc, ids.menuArmory];
  document.getElementById(menuOn)?.setAttribute(ARIA_CURRENT, 'page');
  document.getElementById(menuOff)?.removeAttribute(ARIA_CURRENT);
  hideTooltip();

  if (!inArmory) {
    byId<HTMLAnchorElement>(ids.tabCalc).href = location.hash || '#';
    if (pendingLevel !== null) { setLevel(pendingLevel); pendingLevel = null; }
    return;
  }
  document.title = t('armory.documentTitle');
  if (slug) void showCharacter(decodeURIComponent(slug));
  else void showList();
}

export function initArmory(): void {
  byId(ids.search).addEventListener('input', async (e) => {
    filters.query = (e.target as HTMLInputElement).value.trim();
    try { renderMembers(await loadGuild()); } catch { /* l'erreur est déjà affichée par showList */ }
  });
  addEventListener('hashchange', route);
  route();
}
