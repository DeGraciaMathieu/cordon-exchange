---
name: architecture
description: Use when — comprendre la structure du projet, décider où placer du nouveau code, ou vérifier une règle d'architecture (séparation src/render, bus, état).
auto_invoke: true
---

# Architecture — Trader du Cordon

Séparation stricte logique/rendu : `render/` importe `src/`, jamais l'inverse. `src/` est pur et tourne dans Node sans mock.

## Carte des modules

| Module | Rôle | Dépendances clés |
|---|---|---|
| `index.html` | Markup seul : vues à onglets, ids des conteneurs | `styles.css`, `render/main.js` |
| `styles.css` | Tout le CSS, variables dans `:root` | — |
| `src/config.js` | Données du jeu et constantes d'équilibrage : `ITEMS`, `ZONES`, `FACTIONS`, `PREF`, `MARKET_EVENTS`, `TRADE`, `MARKET`, `REP`, `FACTION_EVENTS`, `BOUNTY`, `DELIVERY`, `STORY_BEATS`, `DEBT`, `START`, `MAX_DAY` | — |
| `src/rng.js` | `mulberry32(seed)`, `pick(rng, arr)`, `randInt(rng, min, max)` | — |
| `src/events.js` | `createBus()` → `{ on(type, fn), emit(type, payload) }` | — |
| `src/util.js` | `clamp` | — |
| `src/reputation.js` | `shiftRep(state, fac, delta)` avec retombées alliés/rivaux | config, util |
| `src/factions.js` | Événements de faction (guerre, contrat, blocus, raid, prime) + prédicats `marketClosed`, `zoneBlocked`, `hasBounty`, `bountyExtraDeath` + multiplicateurs `catDemand`, `repMult`, `marketCatMult` | config, rng, reputation |
| `src/market.js` | `buyPrice`, `sellPrice`, `buy`, `sell`, `fluctuate`, `selectFaction` | config, util, factions, reputation |
| `src/contracts.js` | `genDeliveryOffer`, `acceptDelivery`, `deliverContract`, `tickContracts` | config, rng, factions, reputation |
| `src/expeditions.js` | `launchExp`, `resolveExps` | config, rng, factions |
| `src/encounters.js` | Rencontres à choix : `drawEncounter`, `canPick`, `chooseEncounter` (interpréteur des effets déclaratifs d'`ENCOUNTERS`) | config, rng, reputation |
| `src/app.js` | `createApp({rng})` → `state` ; `nextDay(state)` — orchestration du jour | tous les modules `src/` |
| `render/main.js` | Point d'entrée : crée le `state`, abonne le bus (~25 événements → journal/toast/modale), messages français, init | `src/*`, hud, input |
| `render/hud.js` | Tout le rendu DOM : `renderAll` + `renderTop/Market/Sell/Contracts/Exp/FacEvents`, helpers `$`, `fmt`, `log`, `toast`, `showModal` | `src/` (lecture seule) |
| `render/input.js` | `bindInput(state)` : onglets + délégation de clics `data-act` → actions `src/` | actions `src/`, hud |
| `test/*.test.js` | Tests macro `node --test` | `src/` uniquement |

## Flux d'une action joueur

1. `render/hud.js` génère les boutons avec `data-act` / `data-id` / `data-n`.
2. `render/input.js` (délégation sur `#game`) appelle l'action `src/` correspondante.
3. L'action mute `state` et émet des événements `sujet:verbe` sur `state.bus`.
4. `render/main.js` (abonnements) écrit journal/toast/modale ; `input.js` relance `renderAll(state)`.

Le bouton « Dormir » appelle `nextDay(state)` — seule porte d'entrée de la simulation.

## Où placer du nouveau code

| Type de changement | Fichiers à toucher (dans l'ordre) |
|---|---|
| Nouvelle constante d'équilibrage | `src/config.js` (dans le groupe existant : `TRADE`, `BOUNTY`…) → l'utiliser dans le module concerné |
| Nouvel item, zone ou événement de marché | `src/config.js` seulement (tout est data-driven) → `npm test` (`config.test.js` vérifie les refs) |
| Nouvelle rencontre à choix | `src/config.js` → `ENCOUNTERS` (texte, options, effets déclaratifs — voir skill `rencontres`) → `npm test` |
| Nouvelle règle économique | `src/market.js` + constantes dans `config.js` → messages dans `render/main.js` si événement → `test/market.test.js` |
| Nouveau type d'événement de faction | Voir procédure du skill `factions` |
| Nouveau champ d'état | `src/app.js` `createApp` (valeur par défaut) → mutations dans le module de domaine → tests |
| Nouvel élément d'UI | `index.html` (markup/id) → `render/hud.js` (rendu) → `render/input.js` si interactif → `styles.css` |
| Effet purement visuel ou sonore | `render/` uniquement (s'abonner au bus dans `main.js`) — jamais dans `state` |
| Nouveau module de logique | `src/<domaine>.js` (fonctions `state` en 1ᵉʳ argument) + import dans `app.js` si tick quotidien + `test/<domaine>.test.js` |
