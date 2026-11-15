/**
 * Page « GuildProfessions » (addon de guilde). Elle garde sa propre mise en page
 * (menu latéral, pied de page) : pas d'initSiteChrome(), seulement ses propres modules.
 */
import '../styles/pages/addon.css';
import { initAddonSidebar, initAddonTheme } from '../features/addon/index.ts';

initAddonTheme();
initAddonSidebar();
