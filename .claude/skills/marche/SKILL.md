---
name: marche
description: Use when — travailler sur les prix, l'achat/vente, les fluctuations du marché, les préférences de faction ou les items.
auto_invoke: true
---

# Marché — économie

## Concepts → implémentation

| Concept | Implémentation |
|---|---|
| Prix courant | `state.price[id]`, initialisé à `ITEMS[].base` dans `createApp` |
| Prix d'achat | `buyPrice(state, id)` = `round(price × TRADE.buyMarkup)` (1.05) — `src/market.js` |
| Prix de vente à une faction | `sellPrice(state, id, fac)` = `round(price × PREF[fac][cat] × (1 + rep/TRADE.repPriceDiv) × TRADE.merchantMargin × catDemand)` — soit préférence × bonus réput (±33 %) × marge 0.9 × demande conjoncturelle |
| Préférences de faction | `PREF` (`src/config.js`) — multiplicateur par catégorie (ex. Liberté paie les artefacts ×1.35) |
| Demande conjoncturelle | `catDemand(state, fac, cat)` (`src/factions.js`) : contrat de catégorie ×1.5, guerre (armes/conso pour l'agresseur) ×1.35, raid (bandits) ×1.2 |
| Achat | `buy(state, id, n)` — s'arrête à court d'argent, émet `item:bought {id, count}` (toujours, même count 0) |
| Vente | `sell(state, id, n)` — bloquée si `marketClosed` (`trade:blocked`), sinon émet `item:sold {id, fac, count, total, gain}` |
| Marchandage | `haggle(state, id)` — pari sur 1 item (`HAGGLE`, config) : `chance` 0.5 de vendre à `sellPrice × (1 + bonus 0.15)` avec le gain de réputation normal ; sinon **pas de vente** et `shiftRep(fac, −repPenalty 4)`. Émet `trade:haggled {success, …}` ; même garde `marketClosed` que `sell` |
| Gain de réputation à la vente | `saleRepGain` (helper partagé `sell`/`haggle`) : `TRADE.repGainBase (3) + round(count × 1.5 si artefact)` ; ×0.7 pour les bandits ; × `repMult` (contrat ×2, guerre ×1.6) → `shiftRep` |
| Soutien de guerre | vendre armes/conso à l'agresseur incrémente `war.support` de `count` (dans `saleRepGain`, donc aussi via un marchandage réussi) |
| Fluctuations quotidiennes | `fluctuate(state, ev)` : bruit `±vol` (par item), rappel vers `base` (`MARKET.meanPull` 0.15), multiplicateur d'événement, biais de guerre (`marketCatMult`), clamp `[0.4×base, 2.2×base]` |
| Historique de prix | `state.history[id]` (init `[base]` dans `createApp`) — alimenté par `fluctuate`, fenêtre glissante de `MARKET.historyLen` (10) jours |
| Signal « sous-évalué » | `isUndervalued(state, id)` (`src/market.js`) : `price ≤ base × MARKET.undervaluedAt` (0.85) — badge 💰 + bordure dorée sur la carte marché |
| Sparkline | `sparkline(history, base)` (`render/hud.js`) : SVG inline sur les cartes marché **et** vente, pointillé = prix de référence, couleur selon la position vs base |
| Faction de vente sélectionnée | `state.sellFaction` via `selectFaction(state, fac)` |
| Constantes | groupes `TRADE` et `MARKET` — `src/config.js` |

Les constantes purement UI (achat ×5, vente « Tout » = 999, seuil de tendance ±4 %) vivent dans `render/hud.js`.

## Ajouter un item

1. `src/config.js` → `ITEMS` : `{ id, nm (français), ico (emoji), cat (catégorie existante), base, rad, vol }`.
2. Optionnel : l'ajouter au `loot` d'une ou plusieurs `ZONES`.
3. Rien d'autre — marché, vente, contrats (si `cat: "artefact"`) et rendu sont data-driven.
4. `npm test` — `test/config.test.js` vérifie les refs.

## Ajouter une catégorie d'item

1. `CATEGORIES` + une entrée dans `PREF` **pour chaque faction** (`src/config.js`).
2. Décider si `catDemand`/`repMult` (guerre = armes+conso) doivent la traiter → question produit, ne pas trancher seul.
3. Tests : `test/config.test.js` (intégrité) + `test/market.test.js` si règle spécifique.
