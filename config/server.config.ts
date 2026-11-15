/**
 * Configuration du serveur de l'API (armurerie + relais du recrutement), compilé depuis server/src.
 * La guilde (nom, slug) vient de site.config.ts et les règles du formulaire de recruitment.config.ts.
 * Les textes renvoyés aux visiteurs sont dans server/src/locales.
 */

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Mode de lecture d'une statistique dans la réponse /statistics de Blizzard. */
export type StatMode = 'raw' | 'name' | 'effective';

export interface StatPick {
  /** Clé dans la réponse de notre API. */
  key: string;
  /** Clé dans la réponse Blizzard. */
  source: string;
  /** raw : valeur telle quelle ; name : sa propriété name ; effective : effective ?? value ?? null. */
  mode: StatMode;
}

/** Texte de remplacement d'un champ vide dans l'embed Discord (clé de server/src/locales). */
export type EmbedEmpty = 'none' | 'dash' | 'notProvided';

export interface EmbedField {
  /** Identifiant du champ (recruitment.config.ts) ; le libellé est discord.fields.<id>. */
  id: string;
  /** Affiché en colonne (absent : propriété inline omise). */
  inline?: boolean;
  empty: EmbedEmpty;
}

export const serverConfig = {
  /** Port d'écoute si la variable PORT est absente. */
  defaultPort: 8080,

  /** Statuts HTTP renvoyés. */
  http: {
    ok: 200,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    methodNotAllowed: 405,
    payloadTooLarge: 413,
    tooManyRequests: 429,
    internalError: 500,
    badGateway: 502,
    unavailable: 503,
  },

  /** En-têtes des réponses JSON. */
  headers: {
    contentType: 'application/json; charset=utf-8',
    cacheOk: 'public, max-age=300',
    cacheError: 'no-store',
  },

  /** Base factice pour analyser le chemin de la requête. */
  urlBase: 'http://x',

  routes: {
    health: '/api/health',
    guild: '/api/guild',
    characterPrefix: '/api/character/',
    recruitment: '/api/recrutement',
  },

  /** Longueur maximale d'un slug de personnage dans l'adresse. */
  slugMaxLength: 80,

  blizzard: {
    /** Région si la variable BNET_REGION est absente. */
    defaultRegion: 'eu',
    locale: 'fr_FR',
    tokenUrl: 'https://oauth.battle.net/token',
    apiHost: (region: string) => `https://${region}.api.blizzard.com`,
    namespaces: {
      profile: (region: string) => `profile-forever-${region}`,
      static: (region: string) => `static-forever-${region}`,
    },
    /** Le token est renouvelé avant son expiration réelle (secondes). */
    tokenRenewMarginSeconds: 300,
    secondMs: SECOND_MS,
    /** Au plus N appels simultanés vers Blizzard (limite : 100 req/s). */
    maxParallel: 8,
  },

  /** Durées de cache (ms). Blizzard ne met à jour un perso qu'à sa déconnexion. */
  ttl: {
    roster: HOUR_MS,
    character: 15 * MINUTE_MS,
    itemMedia: DAY_MS,
    notFound: 5 * MINUTE_MS,
  },

  /** Id de classe Blizzard → clé de classe du site. */
  classKeys: {
    1: 'warrior', 2: 'paladin', 3: 'hunter', 4: 'rogue', 5: 'priest', 7: 'shaman', 8: 'mage', 9: 'warlock', 11: 'druid',
  } as Record<number, string>,

  /** Clés des images renvoyées par l'API média. */
  mediaAssets: {
    avatar: 'avatar',
    render: 'main-raw',
    icon: 'icon',
  },

  /** Statistiques retenues, dans l'ordre de la réponse. */
  stats: [
    { key: 'health', source: 'health', mode: 'raw' },
    { key: 'power', source: 'power', mode: 'raw' },
    { key: 'powerType', source: 'power_type', mode: 'name' },
    { key: 'strength', source: 'strength', mode: 'effective' },
    { key: 'agility', source: 'agility', mode: 'effective' },
    { key: 'stamina', source: 'stamina', mode: 'effective' },
    { key: 'intellect', source: 'intellect', mode: 'effective' },
    { key: 'spirit', source: 'spirit', mode: 'effective' },
    { key: 'armor', source: 'armor', mode: 'effective' },
    { key: 'attackPower', source: 'attack_power', mode: 'raw' },
    { key: 'rangedAttackPower', source: 'ranged_attack_power', mode: 'raw' },
    { key: 'spellPower', source: 'spell_power', mode: 'raw' },
    { key: 'meleeCrit', source: 'melee_crit', mode: 'effective' },
    { key: 'rangedCrit', source: 'ranged_crit', mode: 'effective' },
    { key: 'spellCrit', source: 'spell_crit', mode: 'effective' },
    { key: 'dodge', source: 'dodge', mode: 'effective' },
    { key: 'parry', source: 'parry', mode: 'effective' },
    { key: 'block', source: 'block', mode: 'effective' },
    { key: 'defense', source: 'defense', mode: 'effective' },
  ] satisfies StatPick[],

  recruitment: {
    /** Fenêtre du plafond global de candidatures. */
    globalWindowMs: HOUR_MS,
    minuteMs: MINUTE_MS,
    /** Valeur attendue pour le champ adresse (recruitmentConfig.urlFieldId). */
    urlPattern: /^https?:\/\//i,
    /** Champs de l'embed Discord, dans l'ordre d'affichage. */
    embedFields: [
      { id: 'prenom', inline: true, empty: 'dash' },
      { id: 'pseudo', inline: true, empty: 'none' },
      { id: 'discord', inline: true, empty: 'none' },
      { id: 'classe', inline: true, empty: 'dash' },
      { id: 'spe', inline: true, empty: 'dash' },
      { id: 'role', inline: true, empty: 'dash' },
      { id: 'logs', inline: false, empty: 'notProvided' },
      { id: 'motivation', empty: 'none' },
      { id: 'experience', empty: 'dash' },
    ] satisfies EmbedField[],
  },

  /** Script de sonde (server/src/probe.ts). */
  probe: {
    samplesDir: 'samples',
    /** Les slugs passés en argument commencent après « node » et le script. */
    argvOffset: 2,
    rulesetPath: '/data/wow/ruleset/index',
    rulesetNamespaces: (region: string) => [`dynamic-forever-${region}`, `dynamic-classic1x-${region}`],
    characterSubPaths: ['', '/equipment', '/specializations', '/character-media', '/statistics'],
    /** Nombre de membres du roster sondés. */
    rosterSample: 2,
    /** Longueur conservée d'une réponse non JSON. */
    rawBodyMaxLength: 2000,
    jsonIndent: 2,
    statusPad: 4,
    labelPad: 40,
    keysMaxLength: 120,
  },
} as const;

export type ServerConfig = typeof serverConfig;
