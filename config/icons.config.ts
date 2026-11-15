/**
 * Icônes du site (tracés SVG, grille 24×24, trait), remplacent les emojis d'interface.
 * Utilisation : {{> icon nom}} dans les gabarits, iconSvg('nom') dans le code.
 */
export const iconsConfig = {
  viewBox: '0 0 24 24',
  strokeWidth: 2,
  paths: {
    sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-5-5',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    reset: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
    minus: 'M5 12h14',
    plus: 'M12 5v14M5 12h14',
    eraser: 'M7 20h13M5 15l9-9 5 5-9 9H8l-3-3Z',
    arrow: 'M7 17 17 7M8 7h9v9',
    close: 'M6 6l12 12M18 6 6 18',
  },
} as const;

export type IconName = keyof typeof iconsConfig.paths;

/** Balise SVG d'une icône (décorative : aria-hidden). */
export function iconSvg(name: IconName, className = 'icone'): string {
  const { viewBox, strokeWidth, paths } = iconsConfig;
  return `<svg class="${className}" viewBox="${viewBox}" aria-hidden="true" focusable="false"><path d="${paths[name]}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
