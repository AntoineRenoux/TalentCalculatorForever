/** Page « GuildProfessions » (addon de guilde). */
import '../styles/pages/addon.css';
import { initSiteChrome } from '../shared/page.ts';
import { initAddonTabs } from '../features/addon/index.ts';
import { initMemberStrip } from '../features/home/strip.ts';

initSiteChrome();
initAddonTabs();
void initMemberStrip();
