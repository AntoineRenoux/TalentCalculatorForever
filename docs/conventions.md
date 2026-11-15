# Conventions du site (Vite + TypeScript)

Règle d'or : **aucun texte affiché ni aucun nombre dans le code**. Tout vient de :
- `config/*.config.ts` : réglages (adresses, règles du jeu, limites, délais, ordres d'affichage) ;
- `src/locales/fr/<zone>.ts` : tous les textes visibles (un fichier par zone, objet `as const`) ;
- `src/styles/tokens/*.css` : toutes les valeurs de style (couleurs, espacements, tailles, ombres…).

Seules exceptions : les identifiants techniques (classes CSS, `id`, attributs, noms d'événements, clés JSON), les données du jeu (`src/data`) et les messages `throw new Error(...)` destinés aux développeurs.

## Arborescence
| Dossier | Rôle |
|---|---|
| `src/*.html` | Gabarits sans texte (un par page, à la racine de `src/`). Marqueurs : `{{t clé}}` (texte échappé), `{{h clé}}` (texte avec HTML de confiance : `<strong>`, `<code>`, `<a>`), `{{cfg chemin}}` (valeur de `siteConfig`), `{{> partiel arg nom=val}}`. Tête de page : `{{> head page=<id>}}`, `{{> header page=<id>}}`, `{{> footer}}`, puis `<script type="module" src="./entries/<id>.ts">`. |
| `plugins/partials/<zone>.ts` | Partiels (HTML généré à la compilation à partir de la config et des textes), pour les listes et blocs répétés. Utiliser `escapeHtml` / `attrs` de `plugins/html/escape.ts`, et `t` / `tDynamic` de `src/shared/i18n.ts`. |
| `src/entries/<page>.ts` | Point d'entrée d'une page : `import '../styles/pages/<page>.css'`, `initSiteChrome()`, puis les modules de la page. |
| `src/features/<zone>/` | Code d'une fonctionnalité (modules TS). |
| `src/shared/` | Code commun (i18n, thème, menu…). |
| `src/styles/pages/<page>.css` | Feuille d'une page : `@import "../shared.css";` puis les jetons et feuilles de la zone. |
| `src/styles/tokens/<zone>.css` | Jetons propres à une zone (déclarés sur `:root`, variantes nuit sous `@media (--prefers-dark) { :root:not([data-theme="light"]) {…} }` et `:root[data-theme="dark"] {…}`). |
| `public/img/` | Images copiées telles quelles (`img/…` dans les gabarits). |

## Règles de code
- Imports relatifs **avec l'extension `.ts`** (`import { t } from '../shared/i18n.ts'`), et `index.ts` explicite pour un dossier.
- Textes : `t('zone.cle', { param })` ; pluriels avec `{ one, other }` et `{ count }`. Clé construite à l'exécution : `tDynamic`.
- Requêtes média en JS : `siteConfig.media.*`. En CSS : `@media (--bp-…)` définis dans `src/styles/tokens/media.css`.
- Pas d'objet global `window.*` : imports ES uniquement.
- Les valeurs de style ne sont jamais écrites dans les `.css` hors `tokens/` (stylelint le vérifie).

## Vérifications (doivent toutes passer)
```bash
npx tsc --noEmit -p tsconfig.json
npx eslint src config plugins server/src
node scripts/check-literals.mjs
npx stylelint "src/styles/**/*.css"
npx vite build
```
