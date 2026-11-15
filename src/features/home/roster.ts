/**
 * Roster en direct sur l'accueil (élément vivant de la page) :
 * - les avatars des membres remplissent les écus de la phrase d'accroche ;
 * - la liste des membres pilote un grand aperçu en écu (survol ou focus d'une ligne).
 */
import { homeConfig } from '../../../config/home.config.ts';
import { siteConfig } from '../../../config/site.config.ts';
import { talentsConfig } from '../../../config/talents.config.ts';
import { classes } from '../../data/index.ts';
import { byId, el, esc } from '../../shared/dom.ts';
import { t } from '../../shared/i18n.ts';
import { classIconUrl } from '../../shared/icons.ts';
import { observeReveal } from '../../shared/motion.ts';
import { loadGuild, type Member } from '../armory/api.ts';

const ids = { list: 'rosterList', count: 'rosterCount', preview: 'rosterPreview', previewName: 'rosterPreviewName' } as const;
const ACTIVE = 'is-active';
const { avatarSuffix, renderSuffix, previewIndex } = homeConfig.roster;

const className = (key: string | null) => classes.find((c) => c.key === key)?.name ?? '';
const renderOf = (m: Member) => (m.avatar ? m.avatar.replace(avatarSuffix, renderSuffix) : null);
const armoryHref = (m: Member) =>
  `${siteConfig.pages.talents.file}#${talentsConfig.hash.armory}${talentsConfig.hash.segmentSeparator}${encodeURIComponent(m.slug)}`;

function fillStatement(members: Member[]): void {
  const withAvatar = members.filter((m) => m.avatar);
  document.querySelectorAll<HTMLElement>('[data-statement-slot]').forEach((slot, i) => {
    const member = withAvatar[i];
    const img = slot.querySelector('img');
    if (!member?.avatar || !img) return;
    img.src = member.avatar;
    img.hidden = false;
    slot.classList.add('is-filled');
  });
}

function showPreview(member: Member, row: HTMLElement): void {
  const img = byId<HTMLImageElement>(ids.preview);
  const render = renderOf(member);
  document.querySelectorAll(`#${ids.list} .${ACTIVE}`).forEach((n) => n.classList.remove(ACTIVE));
  row.classList.add(ACTIVE);
  byId(ids.previewName).textContent = `${member.name} ${member.surname}`;
  if (!render) return;
  img.classList.remove('is-shown');
  img.onload = () => img.classList.add('is-shown');
  img.alt = t('home.roster.previewAlt', { name: member.name });
  img.src = render;
}

function renderList(members: Member[]): void {
  const list = byId(ids.list);
  list.innerHTML = '';
  members.forEach((m) => {
    const cls = classes.find((c) => c.key === m.classKey);
    const li = el('li');
    const a = el('a', 'roster-ligne', { href: armoryHref(m) });
    if (cls) a.style.setProperty(talentsConfig.cssVars.classColor, cls.color);
    const picture = m.avatar ?? classIconUrl(m.classKey ?? '', 'medium');
    a.innerHTML = `<span class="ecu-vignette is-filled"><img src="${esc(picture)}" alt="" width="64" height="77" loading="lazy"></span>
      <span class="roster-nom">${esc(m.name)} <span class="roster-surnom">${esc(m.surname)}</span></span>
      <span class="roster-info">${esc(t('home.roster.member', { level: m.level, className: className(m.classKey) }))}</span>`;
    const preview = () => showPreview(m, a);
    a.addEventListener('mouseenter', preview);
    a.addEventListener('focus', preview);
    li.append(a);
    list.append(li);
  });
  list.setAttribute('data-reveal', '');
  observeReveal(list.parentElement ?? document);
  const first = members[previewIndex];
  const firstRow = list.querySelector<HTMLElement>('.roster-ligne');
  if (first && firstRow) showPreview(first, firstRow);
}

/** Les champs de la semaine montrent les rendus des membres de plus haut niveau. */
function fillWeek(members: Member[]): void {
  const byLevel = [...members].filter((m) => m.avatar).sort((a, b) => b.level - a.level);
  document.querySelectorAll<HTMLImageElement>('[data-week-render]').forEach((img, i) => {
    const member = byLevel[i];
    const render = member ? renderOf(member) : null;
    if (!member || !render) return;
    img.alt = t('home.roster.previewAlt', { name: member.name });
    img.src = render;
    img.hidden = false;
  });
}

export async function initRoster(): Promise<void> {
  try {
    const guild = await loadGuild();
    byId(ids.count).textContent = t('home.roster.count', { count: guild.memberCount });
    fillStatement(guild.members);
    fillWeek(guild.members);
    renderList(guild.members);
  } catch {
    byId(ids.list).innerHTML = `<li class="roster-attente">${esc(t('home.roster.error'))}</li>`;
  }
}
