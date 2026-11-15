/** Bouton jour / nuit du menu latéral (mêmes réglages et même clé de stockage que le reste du site). */
import { addonConfig } from '../../../config/addon.config.ts';
import { initThemeToggle } from '../../shared/theme.ts';

export function initAddonTheme(): void {
  initThemeToggle({ button: addonConfig.ids.themeToggle, icon: addonConfig.ids.themeIcon });
}
