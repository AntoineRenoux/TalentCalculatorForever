/**
 * Configuration générale du site : identité de la guilde, adresses, pages et menu.
 * Les textes affichés sont dans src/locales ; ici on ne trouve que des valeurs de réglage.
 */

/** Identifiant d'une page du site (sert aussi de préfixe de traduction : pages.<id>). */
export type PageId = 'home' | 'recruitment' | 'boss' | 'addon' | 'talents';

export interface PageConfig {
  /** Nom du fichier HTML produit (les adresses actuelles sont conservées). */
  file: string;
  /** Section de l'outil à ouvrir, ajoutée en ancre (#) à l'adresse. */
  anchor?: string;
}

export interface NavLink {
  page: PageId;
  /** Clé de traduction du libellé. */
  labelKey: string;
  anchor?: string;
  /** Identifiant DOM (permet au JS de marquer l'entrée active quand l'ancre change). */
  domId?: string;
}

export interface NavGroup {
  labelKey: string;
  menuId: string;
  items: NavLink[];
}

export const siteConfig = {
  /** Langue du site (attribut lang, règles de pluriel, formats). */
  lang: 'fr',

  guild: {
    name: 'Former Hope',
    slug: 'former-hope',
    foundedYear: 2026,
  },

  urls: {
    discordInvite: 'https://discord.gg/4CXctFZfJd',
    discordDisplay: 'discord.gg/formerhope',
    fonts: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap',
    fontsPreconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  },

  assets: {
    emblem: 'img/emblem-formerhope.png',
    logo: 'img/logo-formerhope.jpg',
    seal: 'img/sceau-formerhope.jpg',
    loadingBanner: 'img/banniere-chargement.jpg',
  },

  theme: {
    /** Clé localStorage du choix jour / nuit (la même que sur former-hope.fr). */
    storageKey: 'formerhope-theme',
    light: 'light',
    dark: 'dark',
    /** Icônes (config/icons.config.ts) du thème actif. */
    icons: { light: 'sun', dark: 'moon' },
  },

  /** Requêtes média utilisées par le JavaScript. */
  media: {
    prefersDark: '(prefers-color-scheme: dark)',
    fineHover: '(hover: hover) and (pointer: fine)',
    noHover: '(hover: none)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
  },

  api: {
    /** Chemin relatif de l'API (même domaine, servie par le Caddy sur /api). */
    base: 'api',
  },

  pages: {
    home: { file: 'index.html' },
    recruitment: { file: 'recrutement.html' },
    boss: { file: 'boss.html' },
    addon: { file: 'addon-guilde.html' },
    talents: { file: 'talents.html' },
  } satisfies Record<PageId, PageConfig>,

  /** Menu principal (en-tête). */
  nav: {
    links: [
      { page: 'home', labelKey: 'nav.home' },
      { page: 'recruitment', labelKey: 'nav.recruitment' },
    ] satisfies NavLink[],
    groups: [
      {
        labelKey: 'nav.tools',
        menuId: 'menu-guides',
        items: [
          { page: 'boss', labelKey: 'nav.boss' },
          { page: 'addon', labelKey: 'nav.addon' },
          { page: 'talents', labelKey: 'nav.talents', domId: 'menuCalc' },
          { page: 'talents', labelKey: 'nav.armory', anchor: 'armory', domId: 'menuArmory' },
        ],
      },
    ] satisfies NavGroup[],
  },

  /** Liens du pied de page. */
  footerLinks: [
    { page: 'home', labelKey: 'nav.home' },
    { page: 'recruitment', labelKey: 'nav.recruitment' },
    { page: 'boss', labelKey: 'nav.bossFooter' },
    { page: 'talents', labelKey: 'nav.talents' },
    { page: 'talents', labelKey: 'nav.armory', anchor: 'armory' },
  ] satisfies NavLink[],
} as const;

export type SiteConfig = typeof siteConfig;

/** Adresse relative d'une page (avec son ancre éventuelle). */
export function pageHref(page: PageId, anchor?: string): string {
  const { file } = siteConfig.pages[page];
  return anchor ? `${file}#${anchor}` : file;
}
