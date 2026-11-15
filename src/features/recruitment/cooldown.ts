/** Anti-spam côté navigateur : délai minimal entre deux candidatures envoyées depuis ce navigateur. */
import { recruitmentConfig } from '../../../config/recruitment.config.ts';
import { recruitmentPageConfig } from '../../../config/recruitment-page.config.ts';

const { clientCooldownMinutes, clientStorageKey } = recruitmentConfig;
const { msPerMinute } = recruitmentPageConfig.form;

/** Minutes restantes avant de pouvoir renvoyer une candidature (0 si possible). */
export function remainingCooldownMinutes(): number {
  try {
    const last = Number(localStorage.getItem(clientStorageKey)) || 0;
    const left = clientCooldownMinutes * msPerMinute - (Date.now() - last);
    return left > 0 ? Math.ceil(left / msPerMinute) : 0;
  } catch {
    return 0;
  }
}

/** Mémorise l'heure du dernier envoi réussi. */
export function markSent(): void {
  try {
    localStorage.setItem(clientStorageKey, String(Date.now()));
  } catch {
    /* stockage indisponible : l'anti-spam serveur reste actif */
  }
}
