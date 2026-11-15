/** Réglages de compilation et du serveur de développement. */
export const buildConfig = {
  /** Dossier des gabarits HTML (racine Vite). */
  pagesDir: 'src',
  /** Fichiers statiques copiés tels quels (images). */
  publicDir: 'public',
  outDir: 'dist',
  /** Seuil d'alerte de taille (ko) : la page du calculateur embarque les données du jeu (~750 ko). */
  chunkSizeWarningKb: 1000,
  dev: {
    port: 5173,
    /** API locale (npm run server:dev) vers laquelle /api est relayé en développement. */
    apiTarget: 'http://127.0.0.1:8080',
  },
} as const;
