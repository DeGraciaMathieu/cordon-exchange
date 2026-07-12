---
name: expeditions
description: Use when — travailler sur les expéditions ou le roster de stalkers : zones, traits, niveaux, recrutement, permadeath, butin.
auto_invoke: true
---

# Expéditions & roster de stalkers

## Concepts → implémentation

| Concept | Implémentation |
|---|---|
| Zone | `ZONES` (`src/config.js`) : `{id, nm, desc, fee, days, death, loot[], qty:[min,max]}` — 4 zones, du Cordon (6 %) à Pripiat (40 %) |
| Stalker (définition) | `STALKERS` (`src/config.js`) : `{id, name, trait}` — 10 stalkers nommés, trait fixe par nom (Loup = vétéran, Poker = fouineur…) ; lookup `stalkerById` |
| Traits | `TRAITS` (config) : `veteran` (risque × `ROSTER.veteranMult` 0.7), `scavenger` (+`scavengerBonus` 1 butin), `runner` (−`runnerDaysOff` 1 jour, min 1) |
| Roster (état) | `state.stalkers` `[{id, xp}]` (embauchés), `state.activeStalker` (part en mission), `state.fallen` `[id]` (morts, définitif) — défauts dans `createApp` (`ROSTER.start` = Loup + Poker) |
| Niveaux | `stalkerLevel(xp)` (`src/stalkers.js`) : `1 + xp/xpPerLevel` (2), plafonné à `maxLevel` (5) ; +1 xp par retour vivant ; chaque niveau rabote `deathPerLevel` (0.03) de risque |
| Risque personnalisé | `deathChance(state, stalkerId, zone)` (`src/expeditions.js`) : `death + prime` × trait − niveaux, plancher `minDeath` (0.02) — affiché par zone pour le stalker sélectionné |
| Recrutement | `recruitStalker(state, id)` (`src/stalkers.js`) : coût `hireCost` (800 ₽), cap `maxHired` (4), pool = `recruitPool` (ni embauché, ni mort) → `stalker:recruited` |
| Sélection | `selectStalker(state, id)` — pattern `sellFaction` : barre `#roster` (`data-act="stalker"`), le bouton de zone envoie le stalker actif |
| Lancement | `launchExp(state, zid)` — garde : stalker actif embauché et disponible (`isBusy`) ; débite `fee` → `expedition:launched {zoneId, stalkerId, fee}` |
| Résolution | `resolveExps` (dans `nextDay`) : jet contre `deathChance` → mort **permanente** (retiré du roster, poussé dans `fallen`, `activeStalker` bascule) `expedition:lost {stalkerId, level}` ; sinon butin + 1 xp `expedition:returned`, et `stalker:promoted {level}` au passage de niveau |
| Limite | `EXPEDITIONS.maxActive` (2) expéditions simultanées + 1 mission max par stalker |
| Rendu | `renderExp` (`render/hud.js`) : roster, campement (`#recruits`, `data-act="recruit"`), zones avec risque personnalisé et label « Envoyer \<nom\> » |
| Réglages | groupe `ROSTER` — `src/config.js` |

## ⚠️ Répartition des gardes

`launchExp` vérifie le stalker (embauché + libre) ; **l'argent, la limite de 2 et le blocus restent des gardes du bouton** (`canGo` dans `renderExp`). `recruitStalker` vérifie tout (argent, cap, pool) — pattern `payRansom`.

## Ajouter un stalker ou un trait

1. Stalker : `STALKERS` (config) — `{id, name, trait existant}`. Rien d'autre (recrutement, rendu et résolution sont data-driven). `npm test` (`config.test.js` vérifie ids/traits).
2. Trait : entrée dans `TRAITS` (nm, ico, desc) **+ son effet en code** — `deathChance`/`launchExp`/`resolveExps` (`src/expeditions.js`) selon la nature de l'effet + test dans `test/expeditions.test.js`.
3. Zone : `ZONES` (config), loot = ids d'`ITEMS` existants ; `spawnFactionEvent` tire les blocus dans `ZONES.slice(1)` (la première zone n'est jamais bloquée).

## Tester

Rng stub : `() => 0` tue à coup sûr, `() => 0.999` survit avec le tirage de butin maximal. `deathChance` se vérifie par calcul direct avec les constantes `ROSTER`. Voir `test/expeditions.test.js` et `test/stalkers.test.js`.
