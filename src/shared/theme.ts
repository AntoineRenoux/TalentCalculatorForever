/** Bouton jour / nuit de l'en-tête (le thème enregistré est déjà appliqué par le script du <head>). */
import { siteConfig } from '../../config/site.config.ts';
import { iconSvg } from '../../config/icons.config.ts';
import { t } from './i18n.ts';

const { storageKey, light, dark, icons } = siteConfig.theme;

export interface ThemeToggleIds { button: string; icon: string }
const DEFAULT_IDS: ThemeToggleIds = { button: 'theme-toggle', icon: 'theme-icon' };

export function initThemeToggle(ids: ThemeToggleIds = DEFAULT_IDS): void {
  const button = document.getElementById(ids.button);
  const icon = document.getElementById(ids.icon);
  if (!button || !icon) return;

  const root = document.documentElement;
  const systemDark = window.matchMedia(siteConfig.media.prefersDark);
  const isDark = () => (root.dataset.theme ? root.dataset.theme === dark : systemDark.matches);

  const paint = () => {
    const darkNow = isDark();
    const label = darkNow ? t('theme.toLight') : t('theme.toDark');
    icon.innerHTML = iconSvg(darkNow ? icons.dark : icons.light);
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(darkNow));
  };

  button.addEventListener('click', () => {
    const next = isDark() ? light : dark;
    root.dataset.theme = next;
    try { localStorage.setItem(storageKey, next); } catch { /* stockage indisponible : le choix vaut pour la session */ }
    paint();
  });
  systemDark.addEventListener('change', paint);
  paint();
}
