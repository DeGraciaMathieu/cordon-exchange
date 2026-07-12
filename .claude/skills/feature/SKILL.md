---
name: feature
description: Use when — l'utilisateur demande d'implémenter une fonctionnalité, une évolution de gameplay ou une modification de comportement du jeu.
user_invocable: true
---

# Workflow : implémenter une fonctionnalité

## 1. Comprendre la demande

1. Reformuler la demande en une phrase et la faire valider si elle est ambiguë.
2. Invoquer le skill `architecture` (+ le skill de domaine concerné : `simulation`, `marche`, `factions`, `contrats`, `expeditions`) pour situer l'impact.
3. Poser les questions de clarification **avant de coder** (via AskUserQuestion) :
   - valeurs numériques (prix, probabilités, durées, seuils — elles iront dans `src/config.js`) ;
   - interactions avec l'existant (ex. « et si une guerre ferme le comptoir pendant ce nouvel événement ? », « et pendant une prime ? ») ;
   - cas limites (jour 24, argent à 0, inventaire vide, partie terminée).
4. Ce que le code ne tranche pas et que l'utilisateur ne précise pas : le noter comme question ouverte, ne pas l'inventer.

## 2. Implémenter

- Respecter CLAUDE.md et le skill `architecture` : constantes dans `src/config.js`, logique pure dans `src/` (state en 1ᵉʳ argument, aléa via `state.rng`), faits notables émis en `sujet:verbe`, messages français dans `render/main.js`, rendu dans `render/hud.js`, interactions dans `render/input.js`.
- Nouveau champ d'état → valeur par défaut dans `createApp`.
- Suivre la procédure « Ajouter un X » du skill de domaine quand elle existe.

## 3. Tester

- Écrire des tests **macro** (voir skill `testing`) : state seedé, fonctions publiques, assertions observables. Au moins un test par comportement nouveau.
- `npm test` et `npm run lint` — corriger jusqu'au vert. Si une approche échoue après 2 tentatives, reprendre le plan avant de continuer.

## 4. Synchroniser la doc

Si le périmètre change :
- hints statiques d'`index.html` s'ils décrivent la règle modifiée (hint du marché, hints des onglets, hint 💡 du pied de page) ;
- skill de domaine concerné (tables, procédures) ;
- CLAUDE.md si une convention ou une commande change.

## 5. Résumer

Terminer par : fichiers modifiés, tests ajoutés (nom + comportement couvert), résultat de `npm test` et `npm run lint`, questions ouvertes restantes.
