---
description: Vérification rapide des conventions du projet sur les changements en cours + run des tests
---

Vérifie que les changements en cours respectent les conventions du projet.

## Périmètre

1. Lis CLAUDE.md (racine).
2. Récupère le périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
3. **S'il n'y a aucun changement, dis-le et arrête-toi là.**

## Vérifications — point par point

1. `render/` importe `src/`, jamais l'inverse.
2. `src/` pur : pas de DOM, pas de timers, pas de `Math.random()` (→ `state.rng`).
3. Constantes de gameplay dans `src/config.js` ; nouveau champ d'état initialisé dans `createApp`.
4. Événements de bus en `sujet:verbe` ; textes joueur en français dans `render/`, code/commentaires en anglais.
5. Cohérence tests/doc :
   - comportement modifié → test macro correspondant modifié/ajouté (`test/`) ;
   - règle décrite dans les hints d'`index.html`, un skill ou CLAUDE.md → texte encore exact.

## Tests

Lance `npm test` et `npm run lint`. Rapporte la sortie réelle.

## Rapport

Statut **OK / VIOLATION / N/A** par item (fichier:ligne pour les violations), puis verdict global : **CONFORME** ou **À CORRIGER**.
