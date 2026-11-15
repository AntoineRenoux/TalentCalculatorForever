/** Page d'accueil (la redirection des anciens liens du calculateur est faite dans le <head> : partiel legacyRedirect). */
import '../styles/pages/home.css';
import { initSiteChrome } from '../shared/page.ts';
import { initMemberStrip } from '../features/home/strip.ts';

initSiteChrome();
void initMemberStrip();
