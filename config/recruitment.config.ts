/**
 * Formulaire de recrutement : champs, contrôles et limites anti-spam.
 * Partagé par la page (src/features/recruitment) et le serveur (server/src), pour que les deux
 * appliquent exactement les mêmes règles. Les libellés sont dans src/locales/fr/recruitment.ts
 * (recruitment.form.fields.<id>.label / .placeholder / .help, options : recruitment.form.options.<optionsKey>.<option>).
 */

export type FieldKind = 'text' | 'url' | 'select' | 'textarea';

export interface RecruitmentField {
  id: string;
  kind: FieldKind;
  /** Obligatoire dans le formulaire (navigateur). */
  required: boolean;
  /** Obligatoire côté serveur (garde-fou minimal si le navigateur est contourné). */
  serverRequired: boolean;
  /** Longueur maximale conservée par le serveur. */
  maxLength: number;
  /** Occupe toute la largeur de la grille. */
  wide?: boolean;
  /** Pour un select : clé du groupe d'options dans les textes, et identifiants des options dans l'ordre. */
  optionsKey?: string;
  options?: readonly string[];
}

export const recruitmentConfig = {
  fields: [
    { id: 'prenom', kind: 'text', required: true, serverRequired: false, maxLength: 100 },
    { id: 'pseudo', kind: 'text', required: true, serverRequired: true, maxLength: 100 },
    {
      id: 'classe', kind: 'select', required: true, serverRequired: false, maxLength: 60, optionsKey: 'classes',
      options: ['shaman', 'hunter', 'warlock', 'druid', 'warrior', 'mage', 'paladin', 'priest', 'rogue'],
    },
    { id: 'spe', kind: 'text', required: true, serverRequired: false, maxLength: 60 },
    {
      id: 'role', kind: 'select', required: true, serverRequired: false, maxLength: 60, optionsKey: 'roles',
      options: ['tank', 'healer', 'melee', 'ranged'],
    },
    { id: 'discord', kind: 'text', required: true, serverRequired: true, maxLength: 100 },
    { id: 'motivation', kind: 'textarea', required: true, serverRequired: true, maxLength: 1000, wide: true },
    { id: 'experience', kind: 'textarea', required: true, serverRequired: false, maxLength: 1000, wide: true },
    { id: 'logs', kind: 'url', required: false, serverRequired: false, maxLength: 300, wide: true },
  ] satisfies RecruitmentField[],

  /** Champ dont la valeur doit être une adresse http(s) (sinon le serveur l'ignore). */
  urlFieldId: 'logs',
  /** Champ utilisé dans le titre de l'embed Discord. */
  titleFieldId: 'pseudo',

  /** Navigateur : délai minimal entre deux envois depuis le même navigateur. */
  clientCooldownMinutes: 10,
  clientStorageKey: 'fh_dernier_envoi',

  /** Serveur : une candidature par IP sur cette durée, et plafond global par heure. */
  serverPerIpCooldownMinutes: 10,
  serverMaxPerHour: 30,
  /** Taille maximale du corps JSON accepté par le serveur (octets). */
  serverMaxBodyBytes: 20_000,

  discord: {
    /** Couleur de la barre latérale de l'embed (bleu de la guilde). */
    embedColor: 0x2f63ad,
    /** Longueur maximale d'un titre d'embed imposée par Discord. */
    titleMaxLength: 256,
    /** Le message ne doit notifier personne (@everyone, rôles…). */
    allowedMentions: [] as string[],
  },
} as const;

export type RecruitmentConfig = typeof recruitmentConfig;
