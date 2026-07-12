---
name: contrats
description: Use when — travailler sur les commandes de livraison des factions (offres, acceptation, livraison, échéances, récompenses).
auto_invoke: true
---

# Contrats de livraison

## Concepts → implémentation (`src/contracts.js`)

| Concept | Implémentation |
|---|---|
| Offre | `{id, fac, itemId, qty, days, reward, expire}` dans `state.deliveryOffers` — `genDeliveryOffer` : max `DELIVERY.maxOffers` (3), faction au comptoir ouvert, item toujours un **artefact**, qty 2–4, délai 3–4 j, offre visible 3 j |
| Récompense | `round(base × qty × DELIVERY.rewardMult (1.4) × (1 + rep[fac]/DELIVERY.rewardRepDiv))` — figée à la création |
| Identifiant | `++state.contractSeq` (numérique, sert de `data-id` aux boutons) |
| Acceptation | `acceptDelivery(state, id)` — déplace l'offre vers `state.activeDeliveries` avec `delivered: 0`, `left: days` → `contract:accepted` |
| Livraison | `deliverContract(state, id)` — consomme l'inventaire jusqu'à `qty` ; complet → `+reward`, `shiftRep(fac, +14)`, retrait de la liste, `contract:completed` ; partiel → `contract:progressed` ; rien en stock → `contract:blocked` |
| Échéance | `tickContracts` (appelé par `nextDay`) : offres expirées supprimées **en silence** ; contrat en retard → `shiftRep(fac, −18)`, `contract:failed`, items déjà livrés perdus |
| Constantes | groupe `DELIVERY` — `src/config.js` |
| Rendu | `renderContracts` (`render/hud.js`) : menaces (primes), offres, contrats en cours, badge d'onglet |

## Pièges

- La livraison **partielle consomme les items** : si le contrat échoue ensuite, ils sont perdus. C'est voulu (le texte du journal le dit au joueur).
- Les offres ne sont générées que pour des factions au comptoir ouvert, mais un comptoir peut fermer **après** acceptation — la livraison reste possible (seule la vente directe est bloquée).
- Le badge de l'onglet Contrats compte offres + primes (pas les contrats en cours).

## Modifier ou étendre les contrats

1. Réglages chiffrés → `DELIVERY` (`src/config.js`), jamais en dur dans `contracts.js`.
2. Nouvelle règle → `src/contracts.js`, en émettant un événement `contract:<verbe>` pour tout fait notable.
3. Message joueur → abonnement dans `render/main.js` ; affichage → `renderContracts` (`render/hud.js`).
4. Tests dans `test/contracts.test.js` : générer une offre seedée (`genDeliveryOffer`), puis dérouler le cycle via les fonctions publiques.
