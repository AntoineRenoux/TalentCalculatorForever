/**
 * Formulaire de candidature : validation, anti-spam navigateur, pop-up « Dernière étape »
 * (qui ouvre l'invitation Discord pendant le clic), envoi au serveur, mode manuel et copie du texte.
 */
import { siteConfig } from '../../../config/site.config.ts';
import { recruitmentPageConfig } from '../../../config/recruitment-page.config.ts';
import { t } from '../../shared/i18n.ts';
import { buildSummary, missingFields, readApplication, sendApplication, type Application } from './application.ts';
import { markSent, remainingCooldownMinutes } from './cooldown.ts';
import { getRecruitmentDom, type RecruitmentDom } from './dom.ts';

/** Ton de la ligne de statut (couleur définie en CSS : .statut-envoi[data-tone]). */
type Tone = 'neutral' | 'success' | 'warning';

function showStatus(dom: RecruitmentDom, message: string, tone: Tone = 'neutral'): void {
  dom.sendStatus.textContent = message;
  dom.sendStatus.dataset.tone = tone;
}

function openPopup(dom: RecruitmentDom): void {
  dom.popupConfirm.disabled = false;
  if (typeof dom.popup.showModal === 'function') dom.popup.showModal();
  else dom.popup.setAttribute('open', '');
}

function closePopup(dom: RecruitmentDom): void {
  if (typeof dom.popup.close === 'function') dom.popup.close();
  else dom.popup.removeAttribute('open');
}

export function initRecruitmentForm(): void {
  const dom = getRecruitmentDom();
  const { notConfiguredStatus, copyFeedbackMs } = recruitmentPageConfig.form;
  /** Valeurs figées au moment du clic sur « Envoyer ». */
  let application: Application | null = null;

  dom.popupCancel.addEventListener('click', () => closePopup(dom));

  dom.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const missing = missingFields(dom.form);
    if (missing.length) {
      dom.error.textContent = t('recruitment.form.errors.missing', { count: missing.length });
      missing[0]?.focus();
      return;
    }
    dom.error.textContent = '';

    const wait = remainingCooldownMinutes();
    if (wait) {
      dom.error.textContent = t('recruitment.form.errors.cooldown', { minutes: wait });
      return;
    }

    application = readApplication(dom.form);
    dom.summary.textContent = buildSummary(application);
    openPopup(dom);
  });

  dom.popupConfirm.addEventListener('click', async () => {
    if (!application) return;
    dom.popupConfirm.disabled = true;

    // Le navigateur n'autorise l'ouverture d'un onglet que pendant le clic, avant tout envoi réseau.
    window.open(siteConfig.urls.discordInvite, '_blank', 'noopener');

    closePopup(dom);
    dom.recap.hidden = false;
    dom.recap.scrollIntoView({ behavior: 'smooth', block: 'start' });

    dom.recapIntro.textContent = t('recruitment.recap.manual');
    showStatus(dom, t('recruitment.status.sending'));
    dom.submit.disabled = true;

    try {
      const result = await sendApplication(application, notConfiguredStatus);
      if (result === 'sent') {
        markSent();
        dom.recapIntro.textContent = t('recruitment.recap.sent');
        showStatus(dom, t('recruitment.status.success'), 'success');
        dom.form.reset();
        application = null;
      } else if (result === 'notConfigured') {
        showStatus(dom, t('recruitment.status.notConfigured'));
      } else {
        showStatus(dom, t('recruitment.status.failure'), 'warning');
      }
    } finally {
      dom.submit.disabled = false;
    }
  });

  dom.copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(dom.summary.textContent ?? '');
      dom.copy.textContent = t('recruitment.recap.copied');
      window.setTimeout(() => { dom.copy.textContent = t('recruitment.recap.copy'); }, copyFeedbackMs);
    } catch {
      dom.copy.textContent = t('recruitment.recap.copyFailed');
    }
  });
}
