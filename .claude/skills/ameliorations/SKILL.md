---
name: ameliorations
description: Use when — travailler sur les améliorations de la planque : achats définitifs, effets transverses (radiations, expéditions, prix, vols, équipe).
auto_invoke: true
---

# Améliorations de la planque

Achats **définitifs** (onglet Améliorations). Données dans `UPGRADES` (`src/config.js`) : `{id, nm, ico, cost, fx, desc}` — `fx` est la valeur d'effet, branchée dans le module propriétaire.

## Améliorations → point de branchement

| Id | Effet | Où l'effet est câblé |
|---|---|---|
| `leadbox` | dose de radiations × `fx` (0.5) | `radsDose` (`src/radiation.js`) — affecte aussi la prévision affichée |
| `thirdslot` | +`fx` (1) expédition simultanée | `maxExpeditions` (`src/expeditions.js`), consommé par `renderExp` |
| `contact` | prix de vente × `fx` (1.08) | `sellPrice` (`src/market.js`) — toutes factions, marchandage inclus |
| `watchdog` | chance de vol de raid et d'embuscade de prime × `fx` (0.5) | `nightRaid` et `bountyNight` (`src/factions.js`) |
| `hideout` | +`fx` (1) place d'équipe | `maxCrew` (`src/stalkers.js`), consommé par `recruitStalker` et `renderExp` |

## Mécanique

- État : `state.upgrades` (`[id]`), défaut `[]` dans `createApp`.
- `hasUpgrade(state, id)` et `upgradeFx(state, id, neutre)` (`src/upgrades.js`) — `neutre` = 1 pour un multiplicateur, 0 pour un additif.
- `buyUpgrade(state, id)` : garde argent + non possédée → `upgrade:bought {upgradeId}` ; message dans `render/main.js`, cartes dans `renderUpgrades` (`render/hud.js`, `data-act="upgrade"`).

## Ajouter une amélioration

1. Entrée dans `UPGRADES` (`src/config.js`) — id, coût, `fx`, desc française.
2. Brancher l'effet dans le module propriétaire via `upgradeFx(state, "id", neutre)` — jamais de `if` dispersés côté rendu.
3. Si l'effet change un cap affiché (slots, équipe), passer par un helper (`maxExpeditions`-like) consommé par le rendu.
4. Test dans `test/upgrades.test.js` : effet avant/après `state.upgrades.push("id")`.
