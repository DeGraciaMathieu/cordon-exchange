---
name: prd
description: Use when — l'utilisateur veut spécifier une fonctionnalité avant de la coder : rédiger un PRD. N'implémente rien.
user_invocable: true
---

# Workflow : rédiger un PRD

**Ce workflow ne produit aucun code.** Livrable : un document de spécification en markdown, proposé dans la conversation (à sauvegarder dans `docs/prd/<slug>.md` si l'utilisateur le demande).

## 1. Explorer l'existant

Lire le code réel (skills `architecture` + domaine concerné) pour remplir la section « Existant technique » : modules touchés, fonctions, constantes de `src/config.js`, événements de bus existants, état concerné. Ne rien affirmer sans l'avoir vérifié dans le code.

## 2. Poser uniquement les décisions produit

Via AskUserQuestion (questions cliquables), uniquement ce que le code ne tranche pas :
- valeurs d'équilibrage (prix, probabilités, durées) ;
- comportements aux intersections avec les systèmes existants (guerres, primes, blocus, fin de partie) ;
- ce qui est hors-scope.

Ne pas poser de questions techniques dont la réponse est dans l'architecture.

## 3. Rédiger le PRD — format fixe

```
# PRD — <titre>

## Objectif
Une phrase : le problème joueur résolu / l'intérêt gameplay.

## Existant technique
Modules, fonctions, constantes et événements de bus concernés (avec chemins réels).

## Comportement
Règles précises, valeurs chiffrées (avec leur future clé dans src/config.js),
déroulé jour par jour si pertinent, textes joueur (français) si connus.

## Hors-scope
Ce que cette itération ne fait explicitement pas.

## Impacts par couche
- src/config.js : …
- src/<domaine>.js : …
- src/app.js (nextDay / createApp) : …
- render/main.js (messages) / render/hud.js (affichage) / render/input.js (interactions) : …
- index.html / styles.css : …

## Critères d'acceptation
Liste vérifiable, du point de vue du joueur.

## Tests
Tests macro à écrire (fichier cible + comportement vérifié), selon le skill testing.

## Risques & questions ouvertes
Points non tranchés, effets de bord possibles sur l'équilibrage.
```

## 4. S'arrêter

Présenter le PRD et s'arrêter. L'implémentation, si validée, passera par le skill `feature`.
