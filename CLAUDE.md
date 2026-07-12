# Trader du Cordon

Jeu de négoce au tour par tour dans la Zone : rembourser la dette de 22 000 ₽ au Fixeur en 24 jours en jouant sur le marché, les factions, les contrats de livraison et les expéditions.

## Stack

- JavaScript ES2022, modules ES natifs, **zéro dépendance runtime**, pas de build ni bundler.
- Node ≥ 18 requis (runner `node --test`) ; ESLint 8 (et non 9) pour compatibilité Node 18.16.
- Commandes :
  - `npm run dev` — sert le site via `npx serve .` (**obligatoire** : les modules ES ne se chargent pas en `file://`)
  - `npm test` — `node --test test/` (tests macro, zéro dépendance)
  - `node --test test/<fichier>.test.js` — un seul fichier de test
  - `npm run lint` — ESLint (config `.eslintrc.json`)

## Architecture (résumé — détail dans le skill `architecture`)

| Dossier | Rôle |
|---|---|
| `src/` | Logique métier **pure** : état, règles, simulation. S'importe telle quelle dans Node. |
| `render/` | Tout ce qui touche le DOM : rendu (`hud.js`), entrées (`input.js`), câblage du bus (`main.js`). |
| `test/` | Tests macro `node --test`, un fichier par module de `src/`. |
| `index.html` | Markup seul + `<script type="module" src="render/main.js">`. |

## Conventions de code — non négociables

1. **Dépendance unidirectionnelle** : `render/` importe `src/`, jamais l'inverse.
2. **`src/` est pur** : aucun accès à `document`, `window`, canvas, timers, `performance`. Le lint le vérifie.
3. **Jamais de `Math.random()` dans `src/`** : tout aléa passe par `state.rng` (mulberry32 seedé, injecté via `createApp({rng})`). Helpers `pick`/`randInt` dans `src/rng.js`.
4. **Aucun état global de module** : tout l'état vit dans l'objet retourné par `createApp` (`src/app.js`). Les fonctions de `src/` prennent `state` en premier argument. Tout nouveau champ d'état reçoit sa valeur par défaut dans `createApp`.
5. **La logique n'appelle jamais le rendu** : `src/` émet `state.bus.emit("sujet:verbe", payload)` ; `render/main.js` s'abonne et produit journal, toasts, modale.
6. **Toute constante de gameplay vit dans `src/config.js`** — aucune valeur magique dupliquée dans la logique. Les constantes purement UI (taille de lot ×5, durée du toast 1600 ms, seuil de tendance ±4 %) restent côté `render/`.
7. **`nextDay(state)` (`src/app.js`) est la seule porte d'entrée de la simulation** ; les actions joueur (`buy`, `sell`, `haggle`, `launchExp`, `acceptDelivery`, `deliverContract`, `payRansom`, `selectFaction`, `chooseEncounter`) sont les seules autres mutations.
8. **À ne jamais faire** : logique métier dans `render/` (formule de prix, règle de réputation → `src/`) ; texte destiné au joueur dans la logique de `src/` (les messages se construisent dans `render/main.js` ; seules les *données* de `config.js` — noms d'items, descriptions de zones, textes narratifs — sont en français côté src) ; muter `state` depuis `render/` autrement que via les actions ; créer de l'état hors de `createApp`.

## Style

- 2 espaces, doubles quotes, code compact, une responsabilité par module.
- Code et commentaires **en anglais** ; tous les textes visibles par le joueur **en français**.
- Événements de bus nommés `sujet:verbe` (`player:robbed`, `faction:war-started`, `game:ended`…).

## Conventions de domaine

- Terminologie : la Zone, le Fixeur, stalker, comptoir (point de vente d'une faction), prime (bounty), Émission. Factions : Solitaires (`loners`), Devoir (`duty`), Liberté (`freedom`), Bandits (`bandits`).
- Monnaie : roubles, formatés en `fr-FR` + « ₽ » via `fmt()` (`render/hud.js`) — jamais de formatage ad hoc.
- Catégories d'items : `artefact`, `arme`, `conso` (`CATEGORIES` dans `src/config.js`).
- Couleurs : variables CSS de `styles.css` (`:root`) ; seules exceptions, les `FACTIONS[].color` de `config.js`.

## Comportement

- **Ne jamais déclarer une tâche terminée sans avoir lancé les tests (`npm test`) et vérifié qu'ils passent.** Lancer aussi `npm run lint`.
- **Si une approche échoue après 2 tentatives, reprendre le plan avant de continuer.**
- Tout changement de comportement observable doit synchroniser la doc vivante : les hints statiques d'`index.html` s'ils décrivent la règle modifiée, les skills de `.claude/skills/` et ce fichier.
- Les tests sont **macro** : état seedé + assertions sur le comportement observable (argent, inventaire, réputation, événements du bus), jamais sur un détail d'implémentation.
- Quirks préservés volontairement (ne pas « corriger » sans demande) : le « 25 000 ₽ » du markup initial (écrasé au chargement par la vraie dette), le 3ᵉ jalon narratif à 24 000 ₽ inatteignable (dette max 22 000), le reset de partie par `location.reload()`.

## Skills disponibles

| Skill | Périmètre |
|---|---|
| `architecture` | Carte module → rôle → dépendances ; où placer du nouveau code selon le type de changement |
| `testing` | Commande de test, philosophie macro, mapping fichier de test → périmètre, où placer un nouveau test |
| `simulation` | État `createApp`, boucle `nextDay` (ordre exact), dette, jalons narratifs, fin de partie |
| `marche` | Formules de prix, achat/vente, fluctuations, préférences de faction |
| `factions` | Réputation et événements de faction : guerres, contrats de catégorie, blocus, raids, primes |
| `contrats` | Commandes de livraison : cycle offre → acceptation → livraison → échéance |
| `expeditions` | Zones, envoi de stalkers, résolution du butin et des pertes |
| `rencontres` | Rencontres quotidiennes à choix : carte du jour, options risquées, effets déclaratifs, tuyau marché |
| `feature` | Workflow d'implémentation d'une fonctionnalité (comprendre → coder → tester → synchroniser la doc) |
| `prd` | Rédaction d'un PRD sans implémentation |

## Questions ouvertes

- Pas de CI configurée : les hooks Stop locaux (`.claude/settings.json`) sont le seul garde-fou automatique.
- Compatibilité navigateur cible non définie (ES2022 natif requis, testé sur navigateurs récents uniquement).
