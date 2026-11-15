/** Page « Recrutement » : postes, étapes et formulaire de candidature. */
import '../styles/pages/recruitment.css';
import { initSiteChrome } from '../shared/page.ts';
import { initRecruitmentForm } from '../features/recruitment/index.ts';
import { initMemberStrip } from '../features/home/strip.ts';

initSiteChrome();
initRecruitmentForm();
void initMemberStrip();
