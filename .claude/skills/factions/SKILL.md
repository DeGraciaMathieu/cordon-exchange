---
name: factions
description: Use when — travailler sur la réputation, les guerres, contrats de catégorie, blocus, raids ou primes (tout ce qui vit dans state.factionEvents).
auto_invoke: true
---

# Factions — réputation & événements

## Concepts → implémentation

| Concept | Implémentation |
|---|---|
| Réputation | `state.rep[fac]` ∈ [−100, 100] ; `shiftRep(state, fac, delta)` (`src/reputation.js`) : la cible reçoit `delta`, ses alliés `+delta × REP.allySpill` (0.4), ses rivaux `−delta × REP.rivalSpill` (0.6) |
| Graphe alliances/rivalités | `FACTIONS` (`src/config.js`) : `allies`, `rivals`, `name`, `color` |
| Guerre | `{type:"war", a, b, left, support}` — le comptoir de `b` est fermé (`marketClosed`) ; vendre armes/conso à `a` accumule `support` ; à l'échéance : `support ≥ 4` → `a` gagne (`shiftRep(a, +18)`, `faction:war-won`), sinon `shiftRep(b, +6)` (`faction:war-stalled`) |
| Contrat de catégorie | `{type:"contract", fac, cat, mult}` — prix ×1.5 (`catDemand`) et réputation ×2 (`repMult`) sur cette catégorie |
| Blocus | `{type:"blockade", zone, fac}` — `zoneBlocked(state, zid)` : expéditions impossibles (bouton désactivé). Jamais sur Le Cordon (`ZONES.slice(1)` au spawn) |
| Raid | `{type:"raid"}` — chaque nuit restante : vol d'un item (p 0.45, `nightRaid`) ; les bandits fourguent ×1.2 (`catDemand`) |
| Prime (bounty) | `{type:"bounty", fac, left, ransom}` — posée par `checkBounty` quand `rep ≤ BOUNTY.repThreshold` (−60) ; comptoir fermé, embuscades nocturnes (`bountyNight`, p 0.4, perte 400–1300 ₽), `+0.10` de mortalité d'expédition (`bountyExtraDeath`) ; sortie par `payRansom` (réput plancher −30) ou expiration 6 j (plancher −35) |
| Cycle de vie | `spawnFactionEvent` (cap `FACTION_EVENTS.maxActive` = 2 hors primes, une seule guerre à la fois) et `tickFactionEvents` — `src/factions.js`, appelés par `nextDay` |
| Prédicats pour le rendu | `marketClosed`, `hasBounty`, `bountyExtraDeath`, `zoneBlocked` — importés par `render/hud.js` pour désactiver les boutons |
| Constantes | groupes `FACTION_EVENTS`, `BOUNTY`, `REP` — `src/config.js` |

## Événements de bus émis

`faction:war-started/-won/-stalled`, `faction:contract-started/-ended`, `faction:blockade-started/-ended`, `faction:raid-started/-ended`, `player:robbed`, `bounty:placed/-expired/-ambushed/-paid/-unaffordable`. Messages français correspondants : `render/main.js` ; bannière : `renderFacEvents` (`render/hud.js`).

## Ajouter un type d'événement de faction

1. Constantes (durée `[min, max]`, probabilités, multiplicateurs) dans `FACTION_EVENTS` (`src/config.js`).
2. Spawn dans `spawnFactionEvent` + décompte/résolution dans `tickFactionEvents` (`src/factions.js`).
3. Effet prix/réputation → l'insérer dans `catDemand` / `repMult` / `marketCatMult`.
4. Émettre les événements `sujet:verbe` (`faction:<x>-started` / `-ended` au minimum).
5. Messages journal dans `render/main.js` ; entrée dans la bannière `renderFacEvents` (`render/hud.js`).
6. Si l'événement doit désactiver des boutons : nouveau prédicat dans `src/factions.js`, consommé par `hud.js`.
7. Tests dans `test/factions.test.js` : pousser l'événement à la main dans `state.factionEvents` et vérifier l'effet observable (pas besoin de passer par le spawn aléatoire).
8. Si la règle est décrite dans les hints d'`index.html` (ex. le hint 💡 du pied de page), les mettre à jour.
