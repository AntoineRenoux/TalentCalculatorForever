/** Adresses des icônes du jeu (CDN configuré dans talents.config). */
import { talentsConfig } from '../../config/talents.config.ts';

const { cdnBase, extension, sizes, classIconPrefix, fallback, placeholder } = talentsConfig.icons;
export type IconSize = keyof typeof sizes;

/** Nom d'icône utilisable (remplace les icônes absentes ou « temp » par l'icône de repli). */
export function iconName(name: string | null | undefined): string {
  return name && name !== placeholder ? name : fallback;
}

export function iconUrl(name: string | null | undefined, size: IconSize = 'large'): string {
  return `${cdnBase}/${sizes[size]}/${iconName(name)}${extension}`;
}

export function classIconUrl(classKey: string, size: IconSize = 'medium'): string {
  return iconUrl(`${classIconPrefix}${classKey}`, size);
}
