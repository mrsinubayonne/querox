
## Plan complet : Mode Hors-Ligne Pleinement Opérationnel

### ✅ IMPLÉMENTÉ

#### Phase 1 : Tables Page - Basculer sur le hook optimisé ✅
- `Tables.tsx` utilise maintenant `useOptimizedTableSessions` avec support offline
- Indicateur visuel "Hors ligne" affiché dans l'en-tête

#### Phase 2 : Compléter le hook `useOptimizedTableSessions` ✅
- `markSessionAsPaid` avec support offline (queue mutation + transaction comptable)
- `reopenSession` avec support offline (suppression facture/transaction)
- `getActiveSessionForTable` lecture depuis cache local

#### Phase 3 : Modals des Tables - Support Offline ✅
- `CreateSessionWithOrderModal` : détection offline, queue mutations, IDs locaux
- `QuickAddOrderToSessionModal` : idem
- `RenameTableModal` : queue mutation si offline

#### Phase 4 : `useMenuData` - Fallback Offline ✅
- Chargement depuis IndexedDB si offline
- Cache automatique après chaque fetch réussi
- Fallback gracieux en cas d'erreur réseau

#### Phase 5 : Factures Offline avec numéro `OFF-xxx` ✅
- `generateOfflineInvoiceNumber()` dans `useInvoices.ts`
- Format: `OFF-{timestamp}-{random4chars}`
- Numéro conservé après synchronisation

#### Phase 6 : Encaissement Offline ✅
- Session mise à jour localement (`status: 'paid'`)
- Facture créée/mise à jour localement
- Transaction comptable créée localement
- Tout synchronisé au retour en ligne

---

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/pages/Tables.tsx` | Import `useOptimizedTableSessions`, badge "Hors ligne" |
| `src/hooks/useOptimizedTableSessions.ts` | Mutations complètes avec support offline |
| `src/components/tables/CreateSessionWithOrderModal.tsx` | Support offline complet |
| `src/components/tables/QuickAddOrderToSessionModal.tsx` | Support offline complet |
| `src/components/tables/RenameTableModal.tsx` | Queue mutation si offline |
| `src/hooks/useMenuData.ts` | Fallback IndexedDB, cache automatique |
| `src/hooks/useInvoices.ts` | Génération numéro `OFF-xxx` |

---

### Fonctionnalités opérationnelles hors ligne

1. ✅ Ouvrir une table avec commande
2. ✅ Ajouter des plats à une table existante
3. ✅ Renommer une table
4. ✅ Fermer une table et générer facture (numéro OFF-xxx)
5. ✅ Marquer comme payée avec méthode de paiement
6. ✅ Réouvrir une table
7. ✅ Affichage des plats depuis le cache

---

### Synchronisation automatique

Au retour en ligne :
- `SyncEngine` traite toutes les mutations en file d'attente
- IDs locaux remplacés par IDs serveur
- UI mise à jour automatiquement via invalidation React Query

