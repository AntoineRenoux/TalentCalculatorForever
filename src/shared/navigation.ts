/** Menus déroulants de l'en-tête : survol à la souris, clic au tactile, Échap pour fermer. */
import { siteConfig } from '../../config/site.config.ts';

export function initNavigation(): void {
  const groups = [...document.querySelectorAll<HTMLElement>('.nav-groupe')];

  const setOpen = (group: HTMLElement, open: boolean) => {
    const button = group.querySelector<HTMLButtonElement>('.nav-toggle');
    const menu = group.querySelector<HTMLElement>('.nav-menu');
    if (!button || !menu) return;
    button.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  const openOnly = (target: HTMLElement | null) => groups.forEach((g) => setOpen(g, g === target));

  groups.forEach((group) => {
    const button = group.querySelector<HTMLButtonElement>('.nav-toggle');
    if (!button) return;
    button.addEventListener('click', () => {
      const hoverPointer = window.matchMedia(siteConfig.media.fineHover).matches;
      const open = hoverPointer && group.matches(':hover') ? true : button.getAttribute('aria-expanded') !== 'true';
      openOnly(open ? group : null);
    });
    group.addEventListener('mouseenter', () => openOnly(group));
    group.addEventListener('mouseleave', () => {
      if (!group.contains(document.activeElement)) setOpen(group, false);
    });
    group.addEventListener('focusin', (event) => {
      // Échap rend le focus au bouton : ne pas rouvrir dans ce cas.
      if (event.target !== button) openOnly(group);
    });
    group.addEventListener('focusout', () => {
      queueMicrotask(() => { if (!group.contains(document.activeElement)) setOpen(group, false); });
    });
    group.querySelectorAll('.nav-menu a').forEach((a) => a.addEventListener('click', () => setOpen(group, false)));
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('nav.site')) openOnly(null);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = groups.find((g) => g.querySelector('.nav-toggle')?.getAttribute('aria-expanded') === 'true');
    if (!open) return;
    setOpen(open, false);
    open.querySelector<HTMLButtonElement>('.nav-toggle')?.focus();
  });
}
