/**
 * Réglages d'affichage de la page de recrutement (postes, étapes, comportement du formulaire).
 * Les règles des champs (partagées avec le serveur) sont dans recruitment.config.ts ;
 * les textes sont dans src/locales/fr/recruitment.ts.
 */

/** État d'un poste : sert de clé de texte (recruitment.posts.status.<id>) et de classe CSS. */
export type PostStatus = 'closed' | 'priority' | 'open';

export interface RecruitmentPost {
  /** Identifiant (textes : recruitment.posts.items.<id>.name / .detail). */
  id: string;
  /** Icône (clé de recruitmentPageConfig.icons). */
  icon: string;
  status: PostStatus;
}

export const recruitmentPageConfig = {
  /** Postes affichés, dans l'ordre. */
  posts: [
    { id: 'tank', icon: 'shield', status: 'closed' },
    { id: 'healer', icon: 'heart', status: 'priority' },
    { id: 'melee', icon: 'sword', status: 'closed' },
    { id: 'ranged', icon: 'spark', status: 'closed' },
  ] satisfies RecruitmentPost[],

  /** Classe CSS de la pastille d'état (.statut.<classe>). */
  statusClass: { closed: 'ferme', priority: 'prio', open: 'ouvert' } satisfies Record<PostStatus, string>,

  /** Icônes SVG des postes (viewBox et tracés). */
  iconViewBox: '0 0 24 24',
  iconStroke: 'var(--bleu)',
  iconStrokeWidth: 1.7,
  icons: {
    shield: { d: 'M12 2 21 5v8c0 5-4 8-9 9-5-1-9-4-9-9V5z' },
    heart: { d: 'M12 21s-8-4.7-8-10a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.3-8 10-8 10z' },
    sword: { d: 'M20 4 9 15M4 20l4-1 1-4M6 14l4 4', linecap: 'round' },
    spark: { d: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18', linecap: 'round' },
  } as Record<string, { d: string; linecap?: string }>,

  /** Étapes « Comment ça se passe », dans l'ordre (textes : recruitment.steps.items.<id>.title / .text). */
  steps: ['apply', 'talk', 'join'],

  /** Comportement du formulaire. */
  form: {
    /** Code HTTP renvoyé par le serveur quand l'envoi automatique n'est pas configuré. */
    notConfiguredStatus: 503,
    /** Durée d'affichage de « Texte copié » avant de revenir au libellé du bouton (ms). */
    copyFeedbackMs: 2000,
    /** Millisecondes par minute (calcul du délai anti-spam). */
    msPerMinute: 60_000,
  },
} as const;

export type RecruitmentPageConfig = typeof recruitmentPageConfig;
