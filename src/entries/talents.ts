/** Page du calculateur de talents (avec progression, grimoire et traits raciaux). */
import '../styles/pages/talents.css';
import { initSiteChrome } from '../shared/page.ts';
import { initCalculator, readHash } from '../features/talents/calculator.ts';
import { initLeveling } from '../features/leveling/index.ts';

initSiteChrome();
initCalculator();
initLeveling();
addEventListener('hashchange', () => { readHash(); });
readHash();
