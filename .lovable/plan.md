## Diagnostic des deux bugs (online + offline)

### Bug 1 — CA des rapports doublé

**Cause online** (`useDailyReports.ts` lignes 160-198) : si une mutation hors-ligne est en attente, on fusionne `serveur + cache IndexedDB` avec `dedupeById`. Mais après sync, l'ID local change (UUID local → UUID serveur), donc le serveur renvoie le nouvel ID tandis que le cache contient encore l'ancien → la même facture est comptée 2 fois.

**Cause offline** (mêmes fichiers, lignes 76-116 + 89-97 de `useDetailedReports.ts`) : on lit DEUX fois IndexedDB — une fois scopé par outlet (`scopedInvoices`), une fois sans scope (`unscopedInvoices`) — puis on les fusionne. Si la même facture a été stockée dans les deux espaces (ce qui arrive systématiquement via `preloadCriticalData` qui appelle `storeData` puis `storeOutletScopedCopies`), `dedupeById` les réduit à 1 SEUL si les IDs sont identiques. MAIS : si une facture a été créée hors-ligne avec un ID local et qu'un sync partiel a stocké la version serveur dans le cache scopé tandis que la version locale reste dans le cache unscoped → **doublon non détecté** → CA doublé en hors-ligne aussi.

### Bug 2 — Tables payées qui reviennent + fuite inter-PDV

Identique online et offline. Causes combinées :

1. **Realtime non scopé par outlet** (`useOfflineData.ts` lignes 270-275) : tout changement `table_sessions` du `user_id` invalide la query, même si c'est un autre PDV.

2. **Cache unscoped fusionné en aveugle** (`useOfflineData.ts > getCachedWithFallback` lignes 39-80, et `useOptimizedTableSessions.ts > getSessionsSnapshot` lignes 142-156) : on mélange systématiquement le cache `unscoped` avec le cache scopé. Les anciens caches IndexedDB pollués (créés avant le scoping strict) injectent des sessions d'autres PDV.

3. **`localPaidSessionIds` éphémère** (5 min en mémoire) : après redémarrage du PC ou longue fenêtre offline, le set est vide → une session marquée `paid` peut réapparaître si un `update status='closed'` antérieur est rejoué par le sync.

4. **Mutations contradictoires en file offline** : `closeSession` peut être en file → puis `markAsPaid` enfile `status='paid'`. Au sync, l'ordre n'est pas garanti idempotent → la table peut revenir `closed`.

---

## Plan de correction (online + offline)

### Fix 1 — Rapports : déduplication robuste online ET offline

Dans `src/hooks/useDailyReports.ts` ET `src/hooks/useDetailedReports.ts` :

**Online** : supprimer entièrement la fusion avec le cache. Le serveur est la source de vérité.

**Offline** : ne lire QU'UN seul cache (le scopé si `outletId` défini, sinon l'unscoped). Ne JAMAIS fusionner les deux. Cela élimine la source des doublons par ID divergent.

Ajouter en filet de sécurité une déduplication par couple `(invoice_number, outlet_id)` (pas seulement par ID) car le `invoice_number` est unique au sein d'un PDV.

### Fix 2a — Realtime scopé par outlet

Dans `src/hooks/useOfflineData.ts` lignes 270-275 : pour les tables possédant `outlet_id` (`table_sessions`, `orders`, `invoices`, `transactions`), ignorer les payloads dont ni `payload.new.outlet_id` ni `payload.old.outlet_id` ne correspond au PDV courant.

### Fix 2b — Scoping strict des caches (online + offline)

Dans `src/hooks/useOfflineData.ts > filterArrayByOutletIfPossible` : pour `table_sessions`, `orders`, `invoices`, `transactions`, REJETER systématiquement tout enregistrement dont `outlet_id !== outletId courant` (y compris les `null`).

Dans `useOptimizedTableSessions.ts > getSessionsSnapshot` : si `scopedOutletId` est défini, NE PAS fusionner avec le cache unscoped. Lire uniquement le cache scopé.

Appliquer la même règle aux helpers de `useInvoices.ts`, `useOrders.ts`, `useCustomers.ts` (suppression des fallbacks unscoped quand un outlet est sélectionné).

### Fix 2c — Migration one-shot des caches pollués

Dans `src/main.tsx`, au démarrage, exécuter une fois (flag `localStorage.querox_cache_migration_v3`) :
- Pour chaque table outlet-scopée (`table_sessions`, `orders`, `invoices`, `transactions`) : purger les caches stockés sans `outletId` ET re-filtrer les caches scopés pour ne garder que les enregistrements avec le bon `outlet_id`.

### Fix 2d — `localPaidSessionIds` persisté (résiste au redémarrage)

Dans `src/hooks/useOptimizedTableSessions.ts` :
- Persister le set dans `localStorage` (clé `querox_paid_session_ids_v1`) avec horodatages.
- Durée de rétention : 7 jours (couvre largement les fenêtres offline réelles).
- Recharger au démarrage du module.

### Fix 2e — Anti-rejeu : nettoyer les mutations obsolètes

Dans `src/lib/offlineStorage.ts` : ajouter `removePendingMutationsByFilter(predicate)`.

Dans `markSessionAsPaidMutation` (mode offline et online) : juste avant d'enfiler/exécuter le `paid`, supprimer de la file toute mutation `update` antérieure sur la même `session_id` ciblant `status='closed'` ou `status='active'`.

Dans `closeSessionMutation` (offline) : avant d'enfiler le `closed`, supprimer toute mutation antérieure sur cette `session_id` ciblant `status='active'`.

### Fix 2f — `paid` final en sync (idempotence forte)

Dans `src/lib/syncEngine.ts` : avant d'appliquer une mutation `update` sur `table_sessions`, vérifier l'état serveur courant. Si le serveur est déjà `status='paid'` ET la mutation veut écrire `closed`/`active`, **ignorer** la mutation (avec log). `paid` est un état terminal.

---

## Fichiers impactés

- `src/hooks/useDailyReports.ts` — déduplication online+offline (Fix 1)
- `src/hooks/useDetailedReports.ts` — déduplication offline (Fix 1)
- `src/hooks/useOfflineData.ts` — realtime scopé + scoping strict (Fix 2a, 2b)
- `src/hooks/useOptimizedTableSessions.ts` — snapshot strict + paid persisté + anti-rejeu (Fix 2b, 2d, 2e)
- `src/hooks/useInvoices.ts`, `useOrders.ts`, `useCustomers.ts` — suppression fallbacks unscoped (Fix 2b)
- `src/main.tsx` — migration cache one-shot (Fix 2c)
- `src/lib/offlineStorage.ts` — helper `removePendingMutationsByFilter` (Fix 2e)
- `src/lib/syncEngine.ts` — état `paid` terminal (Fix 2f)

---

## Résultat attendu

1. CA des rapports = montant PDF, en ligne ET hors ligne.
2. Une table marquée payée reste libre, même après redémarrage du PC, même après plusieurs jours offline, même après resync.
3. Aucune table d'un PDV X ne peut apparaître dans un PDV Y, ni via realtime ni via cache résiduel.

Confirme « oui » pour que je passe en implémentation.