// Seul endroit où la guilde est fixée : changer ces deux valeurs suffit pour une autre guilde.
export const GUILD_NAME = 'Former Hope';
export const GUILD_SLUG = 'former-hope';

export const REGION = process.env.BNET_REGION || 'eu';
export const LOCALE = 'fr_FR';
export const API_HOST = `https://${REGION}.api.blizzard.com`;
export const NS_PROFILE = `profile-forever-${REGION}`;
export const NS_STATIC = `static-forever-${REGION}`;

export const PORT = Number(process.env.PORT) || 8080;

// Durées de cache (ms). Blizzard ne met à jour un perso qu'à sa déconnexion.
export const TTL = {
  roster: 60 * 60 * 1000,
  character: 15 * 60 * 1000,
  itemMedia: 24 * 60 * 60 * 1000,
  notFound: 5 * 60 * 1000,
};
