/** Page du calculateur de talents (avec progression, grimoire, traits raciaux et armurerie). */
import '../styles/pages/talents.css';
import { initSiteChrome } from '../shared/page.ts';
import { initCalculator, readHash } from '../features/talents/calculator.ts';
import { initLeveling } from '../features/leveling/index.ts';
import { initArmory } from '../features/armory/index.ts';

initSiteChrome();
initCalculator();
initLeveling();
addEventListener('hashchange', () => { readHash(); });
readHash();
initArmory();
