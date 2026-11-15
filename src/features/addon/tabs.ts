/** Onglets du guide d'installation : un seul système affiché à la fois (sans JS, tous restent visibles). */
import { addonConfig } from '../../../config/addon.config.ts';

export function initAddonTabs(): void {
  const { tabSelector, panelSelector, activeClass } = addonConfig.tabs;
  const tabs = [...document.querySelectorAll<HTMLAnchorElement>(tabSelector)];
  const panels = [...document.querySelectorAll<HTMLElement>(panelSelector)];
  if (!tabs.length) return;

  const show = (id: string) => {
    panels.forEach((p) => { p.hidden = p.id !== id; });
    tabs.forEach((tab) => {
      const on = tab.hash === `#${id}`;
      tab.classList.toggle(activeClass, on);
      tab.setAttribute('aria-current', String(on));
    });
  };

  tabs.forEach((tab) => tab.addEventListener('click', (event) => {
    event.preventDefault();
    show(tab.hash.slice(1));
  }));
  const fromHash = panels.find((p) => `#${p.id}` === location.hash)?.id;
  show(fromHash ?? panels[0]?.id ?? '');
}
