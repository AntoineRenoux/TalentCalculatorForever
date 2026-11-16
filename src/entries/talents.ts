/** Page du calculateur de talents (avec progression, grimoire et traits raciaux). */
import '../styles/pages/talents.css';
import { initSiteChrome } from '../shared/page.ts';
import { initCalculator, readHash, setLevel } from '../features/talents/calculator.ts';
import { initLeveling } from '../features/leveling/index.ts';
import { takePendingLevel } from '../features/armory/index.ts';

initSiteChrome();
initCalculator();
initLeveling();
addEventListener('hashchange', () => { readHash(); });
readHash();

// Venu de l'armurerie (« Ouvrir dans le calculateur ») : niveau du personnage.
const pendingLevel = takePendingLevel();
if (pendingLevel !== null) setLevel(pendingLevel);
