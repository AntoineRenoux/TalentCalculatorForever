/**
 * Réglages de la page « GuildProfessions » (addon de guilde) : identifiants, ancres,
 * ordre des blocs, liens de téléchargement et version publiée.
 * Les textes affichés sont dans src/locales/fr/addon.ts (mêmes clés que les listes ci-dessous).
 */

export type AddonSectionKey = 'home' | 'how' | 'downloads' | 'install' | 'discord' | 'faq';
export type AddonPlatformKey = 'windows' | 'macArm' | 'macIntel' | 'linux';
export type AddonInstallKey = 'windows' | 'mac' | 'linux';

export interface AddonInstallTab {
  key: AddonInstallKey;
  /** Ancre du panneau (le lien d'onglet y mène). */
  id: string;
  /** Étapes, dans l'ordre (clés de addon.install.panels.<key>.steps). */
  steps: readonly string[];
  /** Le panneau se termine-t-il par un paragraphe de remarque ? */
  note: boolean;
}

export const addonConfig = {
  meta: {
    /** Couleur de la barre du navigateur mobile. */
    themeColor: '#100d16',
  },

  /** Onglets du guide d'installation : un seul panneau visible à la fois (sans JS, tous restent visibles). */
  tabs: {
    tabSelector: '.addon-onglet',
    panelSelector: '.addon-panneau',
    activeClass: 'is-active',
  },

  /** Ancres des sections. */
  sections: {
    home: 'accueil',
    how: 'fonctionnement',
    downloads: 'telechargements',
    platforms: 'telechargements-systeme',
    install: 'installation',
    discord: 'discord',
    faq: 'faq',
  },

  /** Entrées du sommaire de la page, dans l'ordre (libellés : addon.nav.<clé>). */
  nav: ['home', 'how', 'downloads', 'install', 'discord', 'faq'] satisfies AddonSectionKey[],

  /** Carte d'illustration du bandeau : nombre d'artisans par métier. */
  heroArt: {
    professions: [
      { key: 'alchemy', crafters: 12 },
      { key: 'enchanting', crafters: 8 },
      { key: 'blacksmithing', crafters: 5 },
    ],
  },

  /** Les trois pièces du système (clés de addon.how.cards). */
  featureCards: ['addon', 'companion', 'bot'],

  /** Étapes du parcours de synchronisation (la première est mise en avant). */
  flow: ['play', 'scan', 'sync', 'consult'],

  /** Canal manuel : étapes de chaque carte (clés de addon.manual.<carte>.steps). */
  manual: {
    export: ['open', 'copy', 'paste'],
    import: ['export', 'fetch', 'open'],
  },

  /** Points forts du pack tout-en-un. */
  featuredPoints: ['install', 'detect', 'sync', 'updates'],

  release: {
    version: 'v1.0.34',
    /** Date de publication (AAAA-MM-JJ). */
    date: '2026-10-25',
    dateFormat: { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } satisfies Intl.DateTimeFormatOptions,
  },

  /** Liens de téléchargement (à renseigner lors de la publication). */
  downloads: {
    addon: '#',
    sourceCode: '#',
    /** Pack tout-en-un et compagnon seul, par système, dans l'ordre d'affichage. */
    platforms: [
      { key: 'windows', pack: '#', companion: '#' },
      { key: 'macArm', pack: '#', companion: '#' },
      { key: 'macIntel', pack: '#', companion: '#' },
      { key: 'linux', pack: '#', companion: '#' },
    ] satisfies { key: AddonPlatformKey; pack: string; companion: string }[],
  },

  /** Onglets du guide d'installation, dans l'ordre. */
  install: [
    { key: 'windows', id: 'installation-windows', steps: ['pack', 'separate', 'scan'], note: true },
    { key: 'mac', id: 'installation-mac', steps: ['download', 'separate', 'unblock', 'scan'], note: false },
    { key: 'linux', id: 'installation-linux', steps: ['unzip', 'run', 'separate', 'scan'], note: false },
  ] satisfies AddonInstallTab[],

  /** Commandes Discord, dans l'ordre (clés de addon.discord.commands). */
  discordCommands: [
    'metierList', 'metierWho', 'metierRecipes', 'metierSet',
    'craftOrder', 'craftList', 'craftAccept', 'craftDone', 'craftCancel',
    'link', 'main', 'exportAddon', 'import',
  ],

  /** Questions fréquentes, dans l'ordre (clés de addon.faq.items). */
  faq: ['safe', 'outsideGuild', 'missingRecipes', 'craftOrder'],
} as const;

export type AddonConfig = typeof addonConfig;
