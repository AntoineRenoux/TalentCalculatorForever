/** Menu latéral sur mobile : bouton « Menu », voile cliquable, fermeture au clic sur un lien ou avec Échap. */
import { addonConfig } from '../../../config/addon.config.ts';
import { t } from '../../shared/i18n.ts';

export function initAddonSidebar(): void {
  const { ids, classes, closeKey } = addonConfig;
  const button = document.getElementById(ids.menuToggle);
  const menu = document.getElementById(ids.sidebar);
  const overlay = document.getElementById(ids.overlay);
  if (!button || !menu || !overlay) return;

  const update = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? t('addon.menu.close') : t('addon.menu.open'));
    overlay.hidden = !open;
  };

  const close = () => {
    document.body.classList.remove(classes.menuOpen);
    update(false);
  };

  button.addEventListener('click', () => {
    update(document.body.classList.toggle(classes.menuOpen));
  });

  overlay.addEventListener('click', close);
  menu.querySelectorAll(classes.navLinks).forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === closeKey) close();
  });
}
