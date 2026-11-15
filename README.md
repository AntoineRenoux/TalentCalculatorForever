# Site Former Hope

Site de la guilde **Former Hope** (WoW Forever) : accueil, recrutement, guide des boss, addon de guilde,
calculateur de talents (avec progression par niveau, grimoire et traits raciaux) et armurerie des membres.

Construit avec **Vite + TypeScript**, sans framework. Aucun texte affiché ni aucun nombre n'est écrit dans le
code : tout se règle dans les fichiers de configuration, de textes et de jetons de design.

- Préproduction : https://talents.warpvault.com (VPS Hostinger, Docker Compose derrière le Caddy partagé).
- La production actuelle former-hope.fr (o2switch) n'est pas concernée.

## Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Le nom de la guilde, le Discord, les pages, le menu, la clé du thème | `config/site.config.ts` |
| Un texte du site (n'importe lequel) | `src/locales/fr/<zone>.ts` (`common`, `home`, `recruitment`, `boss`, `addon`, `talents`, `leveling`, `armory`) |
| Une couleur, un espacement, une taille, une ombre | `src/styles/tokens/*.css` (`core` pour tout le site, puis `guild`, `addon`, `talents`) |
| Les règles du calculateur (niveaux, points par rangée…) | `config/talents.config.ts` |
| Le formulaire de recrutement (champs, limites anti-spam) | `config/recruitment.config.ts` (partagé avec le serveur) et `config/recruitment-page.config.ts` |
| La fiche de l'armurerie (emplacements, caractéristiques) | `config/armory.config.ts` |
| L'API (cache, Blizzard, statuts HTTP) | `config/server.config.ts`, textes du serveur dans `server/src/locales/fr.ts` |
| Les réglages de la page addon | `config/addon.config.ts` |

Les conventions de code (gabarits, partiels, imports) sont décrites dans [docs/conventions.md](docs/conventions.md).

## Organisation

```
config/          réglages typés (site, pages, règles du jeu, API…)
src/*.html       gabarits des pages, sans texte : {{t clé}}, {{cfg chemin}}, {{> partiel}}
src/entries/     un point d'entrée TypeScript par page
src/features/    calculateur, progression, armurerie, recrutement, addon
src/shared/      i18n, thème, menu, infobulle…
src/locales/     textes (français)
src/styles/      feuilles de style ; valeurs dans src/styles/tokens/
src/data/        données du jeu (talents, sorts, races), extraites de Wowhead (WoW Forever, FR)
plugins/         plugin Vite qui remplit les gabarits à la compilation, et les partiels
server/src/      API Node (armurerie via l'API Blizzard, relais des candidatures vers Discord)
public/img/      images
```

## Commandes

```bash
npm install
npm run dev          # site en développement (http://localhost:5173), /api relayé vers le port 8080
npm run server:dev   # API en développement (variables BNET_* dans l'environnement)
npm run check        # lint (dont « aucun texte ni nombre en dur »), lint CSS, types et compilation
npm run build        # compilation du site dans dist/
```

## Déploiement (préprod)

Sur le VPS, dans `/opt/talentcalculator` :

```bash
git pull && docker compose up -d --build
```

- `web` : image Node qui compile le site, puis nginx qui sert `dist/`.
- `api` : serveur TypeScript compilé.
- Les deux services sont sur le réseau `proxy`. Le Caddy partagé envoie `/api/*` à l'API et le reste au site (`deploy/talentcalculator.caddy`).

Secrets dans `/opt/talentcalculator/.env`, jamais dans le dépôt (voir `.env.example`) :
- `BNET_CLIENT_ID`, `BNET_CLIENT_SECRET` : client créé sur https://develop.battle.net/access/clients ;
- `DISCORD_WEBHOOK_URL` : webhook du salon #candidatures. Sans webhook, le formulaire passe en mode manuel.

## Armurerie

L'API Blizzard de WoW Forever n'est pas encore documentée officiellement, mais elle fonctionne avec le namespace `profile-forever-eu`. Les personnages n'ont pas de royaume (`/profile/wow/character/{prénom}-{nom}`), et un personnage n'apparaît qu'à partir du niveau 10, après une déconnexion. Seuls les membres de la guilde configurée sont accessibles : le serveur renvoie 403 pour les autres. Pour vérifier les réponses de l'API, lancer `node server/dist/server/src/probe.js` après `npm run server:build`.
