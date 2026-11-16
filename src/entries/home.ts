/** Page d'accueil, avec l'armurerie de la guilde (la redirection des anciens liens du calculateur est faite dans le <head> : partiel legacyRedirect). */
import '../styles/pages/home.css';
import { initSiteChrome } from '../shared/page.ts';
import { initArmory } from '../features/armory/index.ts';

initSiteChrome();
initArmory();
