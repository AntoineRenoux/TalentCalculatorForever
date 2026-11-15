# TalentCalculatorForever

Site de la guilde **Former Hope** (WoW Forever) : copie du site former-hope.fr (accueil, recrutement, guide des boss, addon de guilde) intégrée avec le calculateur de talents et l'armurerie.

- Pages de la guilde : `index.html`, `recrutement.html`, `boss.html`, `addon-guilde.html` (thème `css/style.css`).
- Calculateur et armurerie : `talents.html` (`#armory` pour l'armurerie), styles `css/talents.css`, scripts `js/`.
- Le formulaire de recrutement passe par `POST /api/recrutement` : le webhook Discord reste sur le serveur (`DISCORD_WEBHOOK_URL` dans `.env`). Sans webhook, la page passe en mode manuel (texte à copier dans Discord).
- Préproduction : https://talents.warpvault.com (VPS Hostinger). La production former-hope.fr (o2switch) n'est pas touchée.

## Calculateur de talents

Calculateur de talents pour WoW Forever / Classic+, en HTML5, CSS3 et JavaScript (sans dépendance).

- 9 classes, 3 arbres chacune, textes en français
- Niveau 10 à 60 (51 points au niveau 60)
- Règles du jeu : 5 points par rangée, prérequis (flèches), retrait impossible s'il casse le build
- Clic gauche pour ajouter, clic droit ou Maj+clic pour retirer (bouton « −1 » sur mobile)
- Recherche, ordre des talents par niveau, build partageable dans l'URL (`#druid/5032003-05-05/r4`, `r4` = race)
- Traits raciaux selon la race (races jouables par classe dans Forever, dont les deux Éolides)
- Progression par niveau : sorts et rangs appris à chaque niveau (description, école, nouveautés Forever) et point de talent du build
- Grimoire au niveau choisi : plus haut rang connu de chaque sort, par école

## Armurerie de guilde

Onglet « Armurerie » (`#armory`) : membres de la guilde **Former Hope** (liste filtrable), fiche de chaque personnage (équipement avec infobulles, rendu, caractéristiques, talents) et bouton « Ouvrir dans le calculateur ». Seuls les personnages de la guilde sont accessibles : le serveur renvoie 403 pour les autres.

- La guilde se change dans `server/config.mjs` (`GUILD_NAME`, `GUILD_SLUG`).
- Le serveur `server/` (Node 22, sans dépendance) appelle l'API Blizzard avec le namespace `profile-forever-eu`. Forever n'est pas encore dans la doc officielle ; `node server/probe.mjs` vérifie ce que l'API renvoie.
- Il faut un client API créé sur https://develop.battle.net/access/clients, dont l'id et le secret vont dans `.env` (voir `.env.example`), jamais dans le dépôt.
- Un personnage n'apparaît qu'à partir du niveau 10, après une déconnexion.

Données : `data.js` (talents) et `leveling.js` (sorts, races, traits raciaux), extraites de Wowhead (WoW Forever, FR).

## Lancer en local

La page doit être servie par un serveur HTTP (pas en double-cliquant sur le fichier) :

```bash
npx http-server -p 8080
```

puis ouvrir http://localhost:8080.

Les icônes sont chargées depuis le CDN d'images de Wowhead : une connexion internet est nécessaire.
