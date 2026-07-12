---
name: testing
description: Use when — écrire, modifier ou lancer des tests ; comprendre la philosophie de test du projet ou trouver où placer un nouveau test.
auto_invoke: true
---

# Testing — Trader du Cordon

## Commandes

- `npm test` — toute la suite (`node --test test/`), ~1,5 s, zéro dépendance.
- `node --test test/market.test.js` — un seul fichier.

## Philosophie : tests macro

On teste le **comportement observable**, jamais l'implémentation :

1. Construire un vrai `state` : `createApp({ rng: mulberry32(seed) })`.
2. Arranger l'état directement si besoin (`s.inv.medusa = 3`, `s.factionEvents.push({...})`, `s.money = 0`).
3. Agir via les fonctions publiques de `src/` (`nextDay`, `sell`, `tickContracts`…) — en boucle si nécessaire.
4. Vérifier l'observable : `money`, `inv`, `rep`, `day`, `over`, ou les événements capturés via `s.bus.on("...", e => ...)` **avant** l'action.

Zéro mock : `src/` s'importe tel quel dans Node. Pas d'assertion sur des détails internes (ordre d'appels, structures intermédiaires).

## Maîtriser l'aléa

- `mulberry32(seed)` : déterminisme reproductible (chaque test prend une seed différente).
- Un rng stub pour forcer une branche : `createApp({ rng: () => 0.999 })` (le stalker survit, loot déterministe), `() => 0` (il meurt). C'est un rng injecté valide.

## Mapping fichier de test → périmètre

| Fichier | Périmètre couvert |
|---|---|
| `test/app.test.js` | État initial, garnissement de dette, victoire/défaite, gel après `game:ended`, jalons narratifs |
| `test/market.test.js` | Achat (arrêt à court d'argent), vente (prix + réputations), marchandage (succès/vexation/blocage), comptoir fermé, soutien de guerre, bornes de prix sur 300 jours, historique de prix (init/suivi/cap), signal sous-évalué |
| `test/factions.test.js` | Résolution de guerre (gagnée/enlisée), prime (déclenchement, rançon, refus), cap d'événements, blocus, demande de catégorie |
| `test/contracts.test.js` | Cycle offre → acceptation → livraison, livraison partielle, échéance ratée, expiration des offres |
| `test/expeditions.test.js` | Coût du lancement, retour avec butin, expédition perdue |
| `test/encounters.test.js` | Tirage quotidien, effets d'option, needs non remplis, risque succès/échec, tuyau marché |
| `test/reputation.test.js` | Retombées alliés/rivaux, clamp ±100 |
| `test/rng.test.js` | Déterminisme, bornes [0,1), `pick`/`randInt` |
| `test/events.test.js` | Bus : ordre de livraison, émission sans abonné |
| `test/config.test.js` | Intégrité des données : ids uniques, refs loot/factions/catégories |
| `test/util.test.js` | `clamp` |

## Où placer un nouveau test

- Comportement d'un module existant → dans le fichier de ce module (tableau ci-dessus).
- Nouveau module `src/<domaine>.js` → nouveau fichier `test/<domaine>.test.js`, **au minimum un test de fumée**.
- Comportement transverse au fil des jours (interaction entre systèmes) → `test/app.test.js`, en bouclant sur `nextDay`.
- Nouvelle donnée dans `config.js` → assertion d'intégrité dans `test/config.test.js`.

Imports type : `import { test } from "node:test"; import assert from "node:assert/strict";` puis les fonctions publiques de `src/`.
