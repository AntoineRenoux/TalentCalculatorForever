/**
 * Armurerie de la guilde, sur la page d'accueil.
 * La liste des membres est toujours affichée ; #armory/<slug> ouvre la fiche d'un personnage.
 */
import { armoryConfig } from '../../../config/armory.config.ts';
import { pageHref } from '../../../config/site.config.ts';
import { talentsConfig } from '../../../config/talents.config.ts';
import { classes, leveling } from '../../data/index.ts';
import { byId, el, esc, normalize } from '../../shared/dom.ts';
import { t } from '../../shared/i18n.ts';
import { classIconUrl } from '../../shared/icons.ts';
import { bindTooltip, hideTooltip } from '../../shared/tooltip.ts';
import { loadCharacter, loadGuild, type Guild } from './api.ts';
import { itemTooltip, rankLabel, sheetHTML } from './sheet.ts';

const { hash, cssVars } = talentsConfig;
const { anchor, pendingLevelKey } = armoryConfig;
const ids = {
  armory: 'armory', list: 'armoryList', sheet: 'armorySheet', members: 'memberList', classes: 'memberClasses',
  search: 'memberSearch', guildMeta: 'guildMeta',
} as const;

const filters = { classKey: null as string | null, query: '' };
const baseTitle = document.title;

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
    return `<a class="member" href="#${esc(anchor)}${hash.segmentSeparator}${encodeURIComponent(m.slug)}" style="${cssVars.classColor}:${esc(cls?.color ?? '')}">
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

/** « Ouvrir dans le calculateur » : le niveau du personnage est repris par la page du calculateur. */
function openInCalculator(buildHash: string, level: number): void {
  try { sessionStorage.setItem(pendingLevelKey, String(level)); } catch { /* stockage indisponible : niveau par défaut */ }
  location.href = pageHref('talents') + buildHash;
}

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
    open?.addEventListener('click', () => { openInCalculator(open.dataset.hash ?? '', ch.level); });
  } catch (e) {
    sheet.innerHTML = `<a class="back" href="#${esc(anchor)}">${esc(t('armory.sheet.back'))}</a><p class="error">${esc((e as Error).message)}</p>`;
  }
}

// ---------- Routage ----------
async function route(): Promise<void> {
  const [key, slug] = location.hash.slice(1).split(hash.segmentSeparator);
  const inArmory = key === anchor;
  hideTooltip();
  document.title = baseTitle;
  if (inArmory) byId(ids.armory).scrollIntoView();
  await (inArmory && slug ? showCharacter(decodeURIComponent(slug)) : showList());
  // La page a pu bouger pendant le chargement (images, liste) : on recale sur l'armurerie.
  if (inArmory) byId(ids.armory).scrollIntoView();
}

/** À appeler sur la page du calculateur : applique le niveau transmis par « Ouvrir dans le calculateur ». */
export function takePendingLevel(): number | null {
  try {
    const raw = sessionStorage.getItem(pendingLevelKey);
    sessionStorage.removeItem(pendingLevelKey);
    return raw === null ? null : Number(raw);
  } catch { return null; }
}

export function initArmory(): void {
  if (!document.getElementById(ids.armory)) return;
  byId(ids.search).addEventListener('input', async (e) => {
    filters.query = (e.target as HTMLInputElement).value.trim();
    try { renderMembers(await loadGuild()); } catch { /* l'erreur est déjà affichée par showList */ }
  });
  addEventListener('hashchange', () => { void route(); });
  void route();
}
