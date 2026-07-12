---
description: Analyse la couverture de tests des changements en cours, propose les tests manquants et les écrit après validation
---

Analyse la couverture de tests des changements en cours et comble les manques.

## Périmètre

1. Lis CLAUDE.md (racine) et le skill `testing`.
2. Récupère le périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
3. **S'il n'y a aucun changement, dis-le et arrête-toi là.**

## Analyse

1. Liste les comportements ajoutés ou modifiés dans le diff (côté `src/` surtout ; le rendu pur n'est pas testé unitairement).
2. Pour chacun, cherche le test macro qui le couvre (mapping fichier → périmètre du skill `testing`).
3. Statut par comportement : **COUVERT / NON COUVERT / N/A** (avec le test existant ou le manque identifié).

## Proposition

Pour chaque comportement NON COUVERT, propose un test **macro** (jamais un test d'implémentation) :
- fichier cible (`test/<module>.test.js`) ;
- nom du test et scénario en une phrase (seed ou rng stub, arrange, act, assertion observable).

**Attends la validation de l'utilisateur (AskUserQuestion ou réponse libre) avant d'écrire quoi que ce soit.** Il peut accepter tout, une partie, ou rien.

## Écriture et vérification

1. Écris uniquement les tests validés, dans le style existant (`node:test`, `assert/strict`, `createApp` + rng seedé).
2. Relance `npm test` — la suite complète doit être verte ; corrige les tests (pas le code testé, sauf bug avéré à signaler).
3. Rapport final : tests ajoutés, résultat de la suite, comportements restants non couverts (si refusés).
