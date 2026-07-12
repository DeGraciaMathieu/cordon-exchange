---
description: Revue complète des changements en cours — conventions, tests, maintenabilité, cohérence système
---

Fais une revue complète des changements en cours de ce dépôt.

## Périmètre

1. Lis CLAUDE.md (racine) pour recharger les conventions.
2. Récupère le périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
3. **S'il n'y a aucun changement (diffs vides, rien d'untracked pertinent), dis-le et arrête-toi là.**

## Vérifications — point par point

### A. Conventions (CLAUDE.md)
- Dépendance unidirectionnelle : aucun import de `render/` dans `src/`.
- Pureté de `src/` : pas de `document`/`window`/timers ; pas de `Math.random()` (uniquement `state.rng`, `pick`, `randInt`).
- État : tout nouveau champ a sa valeur par défaut dans `createApp` (`src/app.js`) ; mutations uniquement via les fonctions de `src/` (`state` en 1ᵉʳ argument).
- Bus : faits notables émis en `sujet:verbe` ; messages joueur construits dans `render/main.js`, en français.
- Constantes de gameplay dans `src/config.js`, pas de valeur magique dupliquée.
- Style : 2 espaces, doubles quotes, code/commentaires en anglais.

### B. Couverture de tests
- Chaque comportement nouveau ou modifié a un test macro (state seedé, assertions observables — voir skill `testing`).
- Nouveau module `src/` → fichier `test/<module>.test.js` avec au moins un test de fumée.
- Les tests ne vérifient pas de détails d'implémentation.

### C. Maintenabilité
- Couplage : le changement passe-t-il par les interfaces existantes (actions, bus, prédicats) ou crée-t-il des chemins parallèles ?
- Responsabilité unique : chaque module garde son rôle (voir carte du skill `architecture`).
- Duplication : logique ou constantes dupliquées entre fichiers.
- Complexité : fonctions longues, imbrications profondes, conditions illisibles.
- Nommage : cohérent avec la terminologie du projet (fac, cat, zone, offer/contract, exp…).
- Magic values : chiffres en dur qui devraient être dans `src/config.js`.

### D. Cohérence système
- Intégration : le changement interagit-il correctement avec guerres/primes/blocus/fin de partie ?
- Forme de l'état : les nouvelles données suivent-elles la forme existante (objets plats dans `state`, listes `factionEvents`-like) ?
- Patterns : délégation `data-act` pour les boutons, prédicats `src/factions.js` pour désactiver l'UI, `fmt()` pour la monnaie.
- Doc vivante : hints d'`index.html`, skills et CLAUDE.md à jour si le comportement décrit change.

## Tests

Lance `npm test` puis `npm run lint`. Rapporte la sortie réelle.

## Rapport

Rapport structuré : pour chaque item ci-dessus, statut **OK / VIOLATION / N/A** avec justification d'une ligne (fichier:ligne pour les violations). Termine par un verdict global : **APPROUVÉ** ou **À CORRIGER** avec la liste priorisée des corrections.
