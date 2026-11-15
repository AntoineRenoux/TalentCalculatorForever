/** Armurerie : disposition de la fiche personnage et caractéristiques affichées. */

export type StatFormat = 'number' | 'percent';

export interface StatRow {
  /** Champ renvoyé par /api/character (stats.<key>). */
  key: string;
  /** Clé de texte du libellé (armory.stats.<labelKey>). */
  labelKey: string;
  format: StatFormat;
  /** Ne pas afficher la ligne si la valeur vaut 0. */
  hideZero?: boolean;
  /** Libellé repris de la valeur d'un autre champ (ex. type de ressource : Mana, Énergie…). */
  labelFrom?: string;
}

export const armoryConfig = {
  /** Emplacements d'équipement : colonne gauche, colonne droite, ligne du bas (types renvoyés par l'API). */
  slots: {
    left: ['HEAD', 'NECK', 'SHOULDER', 'BACK', 'CHEST', 'SHIRT', 'TABARD', 'WRIST'],
    right: ['HANDS', 'WAIST', 'LEGS', 'FEET', 'FINGER_1', 'FINGER_2', 'TRINKET_1', 'TRINKET_2'],
    bottom: ['MAIN_HAND', 'OFF_HAND', 'RANGED'],
  },

  /** Qualités connues (type API → classe CSS q-<minuscules>). */
  qualities: ['POOR', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'ARTIFACT', 'HEIRLOOM'],

  /** Rang de guilde du maître de guilde. */
  guildMasterRank: 0,

  /** Décimales des pourcentages (critique, esquive…). */
  percentDecimals: 2,

  stats: [
    { key: 'health', labelKey: 'health', format: 'number' },
    { key: 'power', labelKey: 'power', format: 'number', labelFrom: 'powerType' },
    { key: 'strength', labelKey: 'strength', format: 'number' },
    { key: 'agility', labelKey: 'agility', format: 'number' },
    { key: 'stamina', labelKey: 'stamina', format: 'number' },
    { key: 'intellect', labelKey: 'intellect', format: 'number' },
    { key: 'spirit', labelKey: 'spirit', format: 'number' },
    { key: 'armor', labelKey: 'armor', format: 'number' },
    { key: 'defense', labelKey: 'defense', format: 'number' },
    { key: 'attackPower', labelKey: 'attackPower', format: 'number' },
    { key: 'rangedAttackPower', labelKey: 'rangedAttackPower', format: 'number' },
    { key: 'spellPower', labelKey: 'spellPower', format: 'number', hideZero: true },
    { key: 'meleeCrit', labelKey: 'meleeCrit', format: 'percent' },
    { key: 'rangedCrit', labelKey: 'rangedCrit', format: 'percent' },
    { key: 'spellCrit', labelKey: 'spellCrit', format: 'percent', hideZero: true },
    { key: 'dodge', labelKey: 'dodge', format: 'percent' },
    { key: 'parry', labelKey: 'parry', format: 'percent', hideZero: true },
    { key: 'block', labelKey: 'block', format: 'percent', hideZero: true },
  ] satisfies StatRow[],

  /** Ressources de l'API utilisées pour les images. */
  api: { guild: 'guild', character: 'character' },
} as const;
