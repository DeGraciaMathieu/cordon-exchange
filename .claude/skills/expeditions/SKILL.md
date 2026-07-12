---
name: expeditions
description: Use when — travailler sur les expéditions de stalkers : zones, coûts, risques de perte, butin.
auto_invoke: true
---

# Expéditions

## Concepts → implémentation (`src/expeditions.js`)

| Concept | Implémentation |
|---|---|
| Zone | `ZONES` (`src/config.js`) : `{id, nm, desc, fee, days, death, loot[], qty:[min,max]}` — 4 zones, du Cordon (6 % de perte) à Pripiat (40 %) |
| Lancement | `launchExp(state, zid)` — débite `fee`, tire un nom dans `STALKER_NAMES`, pousse `{zone, left: days, name}` dans `state.exps` → `expedition:launched` |
| Limite | 2 expéditions simultanées (`EXPEDITIONS.maxActive`) |
| Résolution | `resolveExps` (appelé par `nextDay`) : à `left ≤ 0`, `rng < death + bountyExtraDeath` → `expedition:lost` ; sinon tirage de `randInt(qty)` items dans `loot` → inventaire + `expedition:returned {loot}` |
| Surmortalité | `bountyExtraDeath(state)` (`src/factions.js`) : +0.10 si une prime est active |
| Blocus | `zoneBlocked(state, zid)` — bouton désactivé, aucune vérification dans `launchExp` |
| Rendu | `renderExp` (`render/hud.js`) : avertissement prime, expéditions en cours, cartes de zones avec label de risque (faible/modéré/élevé/mortel) |

## ⚠️ Garde-fous côté rendu uniquement

`launchExp` **ne revérifie ni l'argent, ni la limite de 2, ni le blocus** : ces gardes sont le `disabled` du bouton calculé dans `renderExp` (`canGo = money >= fee && !busy && !blocked && !over`). Si un nouveau chemin de code appelle `launchExp`, il doit reproduire ces gardes — ou les déplacer dans `src/` (décision d'architecture à valider).

## Ajouter une zone

1. `src/config.js` → `ZONES` : `{id, nm, desc (français), fee, days, death, loot (ids d'`ITEMS` existants), qty:[min,max]}`.
2. Rien d'autre — rendu et logique sont data-driven.
3. `npm test` — `test/config.test.js` vérifie que le `loot` référence des items existants.

NB : `spawnFactionEvent` tire les blocus dans `ZONES.slice(1)` — la première zone du tableau (Le Cordon) n'est jamais bloquée. Une nouvelle zone insérée en position 0 changerait cette règle.

## Tester une expédition

Rng stub pour forcer la branche : `createApp({ rng: () => 0.999 })` → survie (et loot déterministe : dernier item du `loot`), `() => 0` → mort. Voir `test/expeditions.test.js`.
