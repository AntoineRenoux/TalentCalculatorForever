/** Page d'accueil (la redirection des anciens liens du calculateur est faite dans le <head> : partiel legacyRedirect). */
import '../styles/pages/home.css';
import { initSiteChrome } from '../shared/page.ts';
import { initRoster } from '../features/home/roster.ts';

initSiteChrome();
void initRoster();
