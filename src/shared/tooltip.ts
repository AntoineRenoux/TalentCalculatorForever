/** Infobulle unique de la page (élément #tooltip du gabarit), placée à côté de l'élément survolé. */
import { siteConfig } from '../../config/site.config.ts';
import { talentsConfig } from '../../config/talents.config.ts';
import { byId, px } from './dom.ts';

const TOOLTIP_ID = 'tooltip';
const { offset, verticalNudge, viewportMargin, touchAutoHideMs } = talentsConfig.tooltip;
let hideTimer = 0;

export function showTooltip(anchor: Element, html: string): void {
  const tip = byId(TOOLTIP_ID);
  tip.innerHTML = html;
  tip.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  let x = r.right + offset;
  let y = r.top - verticalNudge;
  if (x + w > innerWidth - viewportMargin) x = Math.max(viewportMargin, r.left - w - offset);
  if (y + h > innerHeight - viewportMargin) y = Math.max(viewportMargin, innerHeight - h - viewportMargin);
  tip.style.left = px(x);
  tip.style.top = px(y);
  clearTimeout(hideTimer);
  if (matchMedia(siteConfig.media.noHover).matches) hideTimer = window.setTimeout(hideTooltip, touchAutoHideMs);
}

export function hideTooltip(): void {
  const tip = document.getElementById(TOOLTIP_ID);
  if (tip) tip.hidden = true;
}

/** Associe une infobulle (contenu calculé à l'affichage) au survol et au focus d'un élément. */
export function bindTooltip(node: HTMLElement, html: () => string): void {
  const show = () => showTooltip(node, html());
  node.addEventListener('mouseenter', show);
  node.addEventListener('focus', show);
  node.addEventListener('mouseleave', hideTooltip);
  node.addEventListener('blur', hideTooltip);
}
