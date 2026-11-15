/** Affichage des trois arbres d'une classe : grille, flèches de prérequis et boutons de talents. */
import { talentsConfig } from '../../../config/talents.config.ts';
import type { Talent, Tree } from '../../data/index.ts';
import { el, esc, px } from '../../shared/dom.ts';
import { t } from '../../shared/i18n.ts';
import { iconUrl } from '../../shared/icons.ts';
import { cleanDescription } from '../../shared/sanitize.ts';
import { bindTooltip } from '../../shared/tooltip.ts';
import {
  addPoint, canAdd, canRemove, notify, pointsForRow, rankOf, removePoint, resetTree, state, talentIndex, tierMet,
} from './state.ts';

const { thickness, headGap } = talentsConfig.arrows;
const { centerRatio } = talentsConfig.geometry;
const { cssVars } = talentsConfig;
const FLASH = 'flash';

/** Boutons de talents affichés, par id (mis à jour à chaque changement). */
export const talentNodes = new Map<number, HTMLButtonElement>();

interface Cell { x: number; y: number; size: number; cx: number; cy: number }

function cellPosition(row: number, col: number): Cell {
  const css = getComputedStyle(document.documentElement);
  const cell = parseFloat(css.getPropertyValue(cssVars.cell));
  const icon = parseFloat(css.getPropertyValue(cssVars.icon));
  const inset = (cell - icon) * centerRatio;
  return { x: col * cell + inset, y: row * cell + inset, size: icon, cx: (col + centerRatio) * cell, cy: (row + centerRatio) * cell };
}

interface Segment { cls: string; left: number; top: number; width: number; height: number }

/** Segments d'une flèche du prérequis vers le talent (droite, ou coude horizontal puis vertical). */
function arrowSegments(from: Talent, to: Talent): Segment[] {
  const a = cellPosition(from.r, from.c);
  const b = cellPosition(to.r, to.c);
  const half = thickness * centerRatio;
  if (from.r === to.r) {
    const right = to.c > from.c;
    const x1 = right ? a.x + a.size : b.x + b.size + headGap;
    const x2 = right ? b.x - headGap : a.x;
    return [{ cls: `h ${right ? 'right' : 'left'}`, left: x1, top: a.cy - half, width: x2 - x1, height: thickness }];
  }
  if (from.c === to.c) {
    return [{ cls: 'v', left: a.cx - half, top: a.y + a.size, width: thickness, height: b.y - (a.y + a.size) - headGap }];
  }
  const right = to.c > from.c;
  const x1 = right ? a.x + a.size : b.cx - half;
  const x2 = right ? b.cx + half : a.x;
  return [
    { cls: 'h', left: x1, top: a.cy - half, width: x2 - x1, height: thickness },
    { cls: 'v', left: b.cx - half, top: a.cy + half, width: thickness, height: b.y - a.cy - half - headGap },
  ];
}

export function talentTooltip(talent: Talent, tree: Tree): string {
  const r = rankOf(talent.id);
  let html = `<div class="tt-name">${esc(talent.name)}</div><div class="tt-rank">${esc(t('talents.tooltip.rank', { rank: r, max: talent.max }))}</div>`;
  if (!tierMet(talent, tree) && r === 0) {
    html += `<div class="tt-req">${esc(t('talents.tooltip.requiresTree', { points: pointsForRow(talent.r), tree: tree.name }))}</div>`;
  }
  for (const [id, qty] of talent.req) {
    const req = talentIndex.get(id);
    if (req && rankOf(id) < qty) {
      html += `<div class="tt-req">${esc(t('talents.tooltip.requiresTalent', { count: qty, talent: req.talent.name }))}</div>`;
    }
  }
  const current = talent.desc[r - 1];
  const next = talent.desc[r];
  if (r > 0 && current) html += `<div class="tt-desc">${cleanDescription(current)}</div>`;
  if (r < talent.max && next) {
    if (r > 0) html += `<div class="tt-next">${esc(t('talents.tooltip.nextRank'))}</div>`;
    html += `<div class="tt-desc">${cleanDescription(next)}</div>`;
  }
  if (canAdd(talent, tree)) html += `<div class="tt-hint add">${esc(t('talents.tooltip.canAdd'))}</div>`;
  if (canRemove(talent, tree)) html += `<div class="tt-hint rem">${esc(t('talents.tooltip.canRemove'))}</div>`;
  return html;
}

function talentButton(talent: Talent, tree: Tree): HTMLButtonElement {
  const p = cellPosition(talent.r, talent.c);
  const button = el('button', 'talent', { type: 'button', 'aria-label': talent.name });
  button.style.left = px(p.x);
  button.style.top = px(p.y);
  button.style.backgroundImage = `url(${iconUrl(talent.icon)})`;
  button.append(el('span', 'rank'));

  const act = (remove: boolean) => {
    const ok = remove ? removePoint(talent, tree) : addPoint(talent, tree);
    if (!ok) {
      button.classList.remove(FLASH);
      void button.offsetWidth; // relance l'animation
      button.classList.add(FLASH);
    }
    notify();
    button.dispatchEvent(new Event('focus'));
  };
  button.addEventListener('click', (e) => act(e.shiftKey || state.removeMode));
  button.addEventListener('contextmenu', (e) => { e.preventDefault(); act(true); });
  bindTooltip(button, () => talentTooltip(talent, tree));
  return button;
}

export function renderTrees(container: HTMLElement): void {
  const cls = state.cls;
  container.innerHTML = '';
  talentNodes.clear();
  if (!cls) return;

  cls.trees.forEach((tree, treeIndex) => {
    const box = el('section', 'tree');
    box.style.setProperty(cssVars.classColor, cls.color);

    const head = el('header', 'tree-head');
    const name = el('span', 'name');
    name.textContent = tree.name;
    const points = el('span', 'pts', { id: `pts-${treeIndex}` });
    head.append(el('img', '', { src: iconUrl(tree.icon, 'medium'), alt: '' }), name, points);

    const body = el('div', 'tree-body');
    const grid = el('div', 'grid');
    body.append(grid);

    tree.talents.forEach((talent) => talent.req.forEach(([reqId]) => {
      const from = talentIndex.get(reqId)?.talent;
      if (!from) return;
      arrowSegments(from, talent).forEach((s) => {
        const seg = el('div', `arrow ${s.cls}`);
        Object.assign(seg.style, { left: px(s.left), top: px(s.top), width: px(s.width), height: px(s.height) });
        seg.dataset.to = String(talent.id);
        seg.dataset.from = String(reqId);
        grid.append(seg);
      });
    }));

    tree.talents.forEach((talent) => {
      const button = talentButton(talent, tree);
      talentNodes.set(talent.id, button);
      grid.append(button);
    });

    const foot = el('footer', 'tree-foot');
    const reset = el('button', '', { type: 'button' });
    reset.textContent = t('talents.tree.reset');
    reset.addEventListener('click', () => { resetTree(tree); notify(); });
    foot.append(reset);

    box.append(head, body, foot);
    container.append(box);
  });
}
