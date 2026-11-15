/** Initialisation commune à toutes les pages qui utilisent l'en-tête du site. */
import { initNavigation } from './navigation.ts';
import { initThemeToggle } from './theme.ts';
import { initMotion } from './motion.ts';

export function initSiteChrome(): void {
  initThemeToggle();
  initNavigation();
  initMotion();
}
