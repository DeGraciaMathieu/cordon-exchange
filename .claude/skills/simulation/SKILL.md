---
name: simulation
description: Use when — travailler sur l'état du jeu, la boucle de jour, la dette, les jalons narratifs ou les conditions de fin de partie.
auto_invoke: true
---

# Simulation — état & boucle de jour

## Concepts → implémentation

| Concept | Implémentation |
|---|---|
| État complet | `createApp({rng})` — `src/app.js`. Champs : `day`, `money`, `debt`, `rep{fac}`, `price{id}`, `inv{id}`, `exps[]`, `factionEvents[]`, `deliveryOffers[]`, `activeDeliveries[]`, `contractSeq`, `sellFaction`, `milestones{}`, `over`, plus `rng` et `bus` |
| Valeurs de départ | `START` et `DEBT.start` (22 000) — `src/config.js` ; inventaire initial : 1 Méduse, 2 Saucissons |
| Boucle de jour | `nextDay(state)` — `src/app.js`, seule porte d'entrée de la simulation (bouton « Dormir ») |
| Dette | `DEBT { start: 22000, garnish: 0.5 }` — prélèvement nocturne de 50 % du cash en tête de `nextDay` → `debt:paid` |
| Jalons narratifs | `STORY_BEATS` (config) + `checkStory` (app.js), déclenchés sur le total remboursé → `story:reached` (une seule fois, via `state.milestones`) |
| Fin de partie | `endGame` (interne) : `state.over = true` + `game:ended {win, day, money, debt}`. Victoire = dette soldée ; défaite = `day > MAX_DAY` (24) |
| Événement de marché du jour | tiré dans `MARKET_EVENTS` (config) → `market:shifted {ev}` → `fluctuate(state, ev)` |

## Ordre exact de `nextDay` (ne pas réordonner sans raison)

1. Garde : `if (state.over) return`.
2. Prélèvement de dette (si `debt > 0` et cash > 0) → `debt:paid`.
3. `checkStory` (les jalons peuvent tomber la nuit de la victoire).
4. **Victoire** si `debt <= 0` — le jour n'avance pas.
5. `day++` ; **défaite** si `day > MAX_DAY`.
6. `day:started {day}`.
7. `resolveExps` (retours d'expédition).
8. `tickFactionEvents` (décompte, raids/embuscades nocturnes, résolutions).
9. `tickContracts` (expiration des offres, échéances).
10. Spawn éventuel d'un événement de faction (`day ≥ 3`, p = 0,45 — `FACTION_EVENTS.spawnFromDay/spawnChance`).
11. Offre de livraison éventuelle (`day ≥ 2`, p = 0,5 — `DELIVERY.spawnFromDay/spawnChance`).
12. `checkBounty` (réputation ≤ −70 → prime).
13. Tirage de l'événement de marché → `market:shifted` → `fluctuate`.

## Ajouter un champ d'état

1. Valeur par défaut dans `createApp` (`src/app.js`) — jamais ailleurs.
2. Mutations uniquement dans les fonctions de `src/` (`state` en 1ᵉʳ argument).
3. Si le rendu doit réagir : émettre un événement `sujet:verbe` + abonnement dans `render/main.js` ; affichage dans `render/hud.js`.
4. Test macro (`test/app.test.js` si lié au cycle de jour).

## Pièges connus

- La victoire se joue **avant** l'avancée du jour : gagner au jour N affiche « en N jours ».
- Après `game:ended`, `render/input.js` ne relance pas `renderAll` (c'est le handler `game:ended` de `main.js` qui rend la barre + la modale).
- Le reset de partie est `location.reload()` — il n'existe pas de fonction reset dans `src/`.
- Le 3ᵉ jalon (24 000) est inatteignable (dette max 22 000) — quirk préservé volontairement.
