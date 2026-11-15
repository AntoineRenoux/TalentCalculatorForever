/** Valeurs de la candidature, texte récapitulatif et envoi au serveur du site. */
import { recruitmentConfig } from '../../../config/recruitment.config.ts';
import { siteConfig } from '../../../config/site.config.ts';
import { t } from '../../shared/i18n.ts';

/** Valeurs des champs, par identifiant (prenom, pseudo, classe…). */
export type Application = Record<string, string>;

const LINE_BREAK = '\n';
const ENDPOINT = `${siteConfig.api.base}/recrutement`;

/** Lit les valeurs (nettoyées) de tous les champs déclarés dans la config. */
export function readApplication(form: HTMLFormElement): Application {
  const data = new FormData(form);
  return Object.fromEntries(
    recruitmentConfig.fields.map((f) => [f.id, String(data.get(f.id) ?? '').trim()]),
  );
}

/** Champs obligatoires encore vides, dans l'ordre du formulaire. */
export function missingFields(form: HTMLFormElement): HTMLElement[] {
  return [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]')]
    .filter((c) => !c.value.trim());
}

/** Texte à copier dans #candidatures quand l'envoi automatique n'a pas abouti. */
export function buildSummary(c: Application): string {
  const logs = c[recruitmentConfig.urlFieldId];
  return [
    t('recruitment.summary.title', { guild: siteConfig.guild.name }),
    t('recruitment.summary.identity', c),
    logs ? t('recruitment.summary.logs', c) : null,
    t('recruitment.summary.answers', c),
  ].filter((l): l is string => l !== null).join(LINE_BREAK);
}

export type SendResult = 'sent' | 'failed' | 'notConfigured';

/** Envoie la candidature au serveur (qui construit et publie l'embed Discord). */
export async function sendApplication(c: Application, notConfiguredStatus: number): Promise<SendResult> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    if (response.ok) return 'sent';
    return response.status === notConfiguredStatus ? 'notConfigured' : 'failed';
  } catch {
    return 'failed';
  }
}
