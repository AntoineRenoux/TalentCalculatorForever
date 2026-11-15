# TalentCalculatorForever

Calculateur de talents pour WoW Forever / Classic+, en HTML5, CSS3 et JavaScript (sans dépendance).

- 9 classes, 3 arbres chacune, textes en français
- Niveau 10 à 60 (51 points au niveau 60)
- Règles du jeu : 5 points par rangée, prérequis (flèches), retrait impossible s'il casse le build
- Clic gauche pour ajouter, clic droit ou Maj+clic pour retirer (bouton « −1 » sur mobile)
- Recherche, ordre des talents par niveau, build partageable dans l'URL (`#druid/5032003-05-05`)

## Lancer en local

La page doit être servie par un serveur HTTP (pas en double-cliquant sur le fichier) :

```bash
npx http-server -p 8080
```

puis ouvrir http://localhost:8080.

Les icônes sont chargées depuis le CDN d'images de Wowhead : une connexion internet est nécessaire.
