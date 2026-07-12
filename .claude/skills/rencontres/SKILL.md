---
name: rencontres
description: Use when — travailler sur les rencontres quotidiennes à choix : carte du jour, options risquées, effets déclaratifs, tuyau marché.
auto_invoke: true
---

# Rencontres à choix

Chaque jour, une carte-événement propose 2-3 options ; l'occasion disparaît le lendemain si le joueur ne choisit pas.

## Concepts → implémentation

| Concept | Implémentation |
|---|---|
| Définitions | `ENCOUNTERS` (`src/config.js`) : `{id, ico, text, options[]}` — texte français, données déclaratives |
| Option | `{id, label, needs?, effects?, risk?}` — `needs` gate le bouton, `effects` s'applique toujours, `risk` roule ensuite |
| Conditions (`needs`) | `{money: n}` et/ou `{items: {id: n}}` — vérifiées par `canPick(state, opt)` (`src/encounters.js`), consommé par `render/hud.js` pour désactiver le bouton **et** revérifié dans `chooseEncounter` |
| Effets (`effects` / `risk.success` / `risk.failure`) | `money` (± ; pertes bornées au cash disponible), `items {id: ±n}` (bornés au stock), `rep {fac: ±n}` (via `shiftRep`, retombées incluses), `tip: true` (tuyau marché), `t` (texte de journal) |
| Risque | `risk: {p, success, failure}` — `state.rng() < p` → succès. Le texte du journal vient de l'issue tirée |
| Tirage quotidien | `drawEncounter(state)` — appelé dans `createApp` (jour 1) et dans `nextDay` (étape 13) ; la carte courante n'est jamais retirée deux fois de suite |
| État | `state.encounter` (`{id}` ou `null` une fois jouée) et `state.marketTip` (index dans `MARKET_EVENTS` ou `null`) — défauts dans `createApp` |
| Tuyau marché (`tip`) | tire un `MARKET_EVENTS` haussier (`mult > 1`), arme `state.marketTip` ; `nextDay` force cet événement le lendemain puis le remet à `null` |
| Résolution | `chooseEncounter(state, optionId)` → applique les effets, émet `encounter:resolved {encounterId, optionId, outcome, text, applied}` |
| Rendu | `renderEncounter` (`render/hud.js`), conteneur `#encounter` (`index.html`), styles `.enc` (`styles.css`), boutons `data-act="encounter"` routés par `render/input.js` |
| Résultat | abonnement `encounter:resolved` dans `render/main.js` : modale bloquante (`showEncounterResult`, `render/hud.js`, styles `.enc-result`) — icône, texte narratif, deltas réellement appliqués colorés selon l'issue — plus la même ligne dans le journal ; les chiffres ne sont jamais dupliqués dans les textes |

## Ajouter une rencontre

1. `src/config.js` → `ENCOUNTERS` : `{id, ico, text, options}` avec 2-3 options ; textes en français. Les montants s'affichent dans `text`/`label` (c'est l'offre), mais **jamais dans les textes de journal `t`** — le résumé des conséquences est généré depuis `applied`.
2. Chaque option a `effects` et/ou `risk` ; chaque bloc d'effets terminal porte un `t`.
3. Toute option coûteuse porte un `needs` équivalent à son coût (sinon le clamp fausserait l'échange).
4. Rien d'autre à toucher — tirage, rendu et résolution sont data-driven.
5. `npm test` — `test/config.test.js` vérifie ids uniques, 2-3 options, refs items/factions et présence des textes.

Un nouveau **type d'effet** (au-delà de money/items/rep/tip) se code dans `applyEffects` (`src/encounters.js`) + le résumé dans `render/main.js` + un test dans `test/encounters.test.js`.

## Pièges

- Les pertes d'argent sont bornées au cash disponible (comme les embuscades de prime) : `applied` reflète le delta réel, pas le delta théorique.
- `rep` passe par `shiftRep` : les retombées alliés/rivaux s'appliquent (seul le delta direct est affiché).
- La carte reste visible après la fin de partie mais ses boutons sont désactivés (`state.over`).
