# Nouvel onglet "Service" — gestion des tables repartie de zéro

L'onglet `/tables` actuel garde trop d'états parallèles (cache local, zustand, file offline, sessions dupliquées). Résultat : tables qui "reviennent" après paiement, totaux à 0 F CFA, commandes et encaissements en échec.

Plutôt que de continuer à rustiner, on crée un **module indépendant** à côté, sans rien casser de l'existant.

## Ce qu'on construit

Nouvelle page **Service** (route `/service`, entrée dédiée dans le menu latéral), totalement séparée de `/tables` :

- **Une seule source de vérité** : la base de données. Aucun cache local, aucun store zustand, aucune file offline sur ce module.
- **Une table = une session active maximum**. Si plusieurs sessions traînent sur le même numéro, la plus récente gagne et les autres sont ignorées à l'affichage (et refermées à l'encaissement).
- **Cycle de vie simplifié** à 2 états visibles : *Libre* et *Occupée (montant X)*. Plus d'état intermédiaire "En attente" qui piège les tables.
- **Encaisser** = une action unique et atomique : marque la session payée, ferme la session, la table redevient libre immédiatement. Si l'écriture échoue, rien n'est affiché comme payé (pas d'optimisme trompeur) et l'erreur exacte est montrée.
- **Prise de commande** : le ticket est écrit en base d'abord, la modale ne se ferme que sur succès confirmé. En cas d'échec, le ticket reste à l'écran pour réessayer, rien n'est perdu.
- **Vue grille** propre + **vue plan de salle** réutilisant le plan déjà enregistré (lecture seule des positions existantes).

## Pourquoi ça règle les bugs actuels

| Bug | Cause | Correction dans le nouveau module |
|---|---|---|
| Tables qui reviennent après paiement | sessions fantômes en cache local + marqueurs localStorage | zéro cache local, relecture serveur après chaque action |
| 0 F CFA sur table occupée | total stocké et désynchronisé | total recalculé depuis les lignes de commande à chaque lecture |
| Paiement en échec / timeout | requêtes trop larges et écritures multiples non atomiques | requêtes filtrées par point de vente + jour, écriture unique par action |
| Commande enregistrée "à moitié" | fallback local en cas de lenteur | plus de fallback : succès ou échec explicite |

## Détails techniques

- `src/pages/Service.tsx` — page, filtres, statistiques, onglets Grille / Plan.
- `src/hooks/useServiceTables.ts` — hook unique : lecture des sessions du point de vente actif (jour courant), calcul des totaux depuis `orders`, mutations `openTable`, `addOrder`, `payAndClose`.
- `src/components/service/` — `ServiceTableCard`, `ServiceGrid`, `ServiceFloorPlan`, `ServiceOrderModal` (reprise de l'ergonomie POS actuelle, sans images de plats).
- Requêtes bornées : filtre `outlet_id` + `created_at >= début de journée` + `.limit(2000)`, colonnes explicites (pas de `select *`) pour éviter les timeouts.
- Realtime : un seul canal sur `table_sessions` du point de vente, qui déclenche un simple refetch.
- L'ancien `/tables` reste en place et inchangé tant que le nouveau module n'est pas validé.

## Hors périmètre

- Pas de modification de `.env`, `types.ts`, `config.toml`.
- Pas de suppression de l'ancien onglet à cette étape.
