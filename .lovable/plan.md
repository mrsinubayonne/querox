
## Plan complet : Mode Hors-Ligne Pleinement Opérationnel

### Diagnostic du problème actuel

L'infrastructure offline existe (IndexedDB, `useOfflineData`, `useOfflineMutation`, `SyncEngine`), mais plusieurs modules critiques ne l'utilisent pas encore :

1. **Tables** : La page `Tables.tsx` utilise `useTableSessions` (Supabase direct), pas `useOptimizedTableSessions`
2. **Modals des tables** : `CreateSessionWithOrderModal`, `QuickAddOrderToSessionModal`, `TableSessionModal` font des appels Supabase directs
3. **Menus dans les modals** : `useMenuData` ne supporte pas le mode offline
4. **Factures offline** : Le numéro de facture doit être généré localement (format `OFF-xxx`)

---

### Phase 1 : Tables Page - Basculer sur le hook optimisé

**Fichier : `src/pages/Tables.tsx`**

Actuellement, la page importe `useTableSessions` qui fait des appels Supabase directs. 

Modifications :
- Remplacer l'import de `useTableSessions` par `useOptimizedTableSessions`  
- Adapter les noms des fonctions exportées (`createSession` devient une mutation, etc.)
- Ajouter `markSessionAsPaid` et `reopenSession` au hook optimisé s'ils manquent

---

### Phase 2 : Compléter le hook `useOptimizedTableSessions`

**Fichier : `src/hooks/useOptimizedTableSessions.ts`**

Le hook existe mais il manque :
- `markSessionAsPaid` (avec support offline)
- `reopenSession` (avec support offline)
- `getActiveSessionForTable` (lecture depuis cache)

Ajouter ces mutations avec `queueMutation` pour le mode offline.

---

### Phase 3 : Modals des Tables - Support Offline

**Fichiers concernés :**
- `src/components/tables/CreateSessionWithOrderModal.tsx`
- `src/components/tables/QuickAddOrderToSessionModal.tsx`
- `src/components/tables/TableSessionModal.tsx`
- `src/components/tables/RenameTableModal.tsx`

Pour chaque modal :
1. Détecter le statut réseau via `useNetworkStatus()`
2. Si offline, utiliser `queueMutation` au lieu de `supabase.from(...).insert/update`
3. Générer des IDs locaux avec `generateLocalId()`
4. Stocker les nouvelles données dans le cache local pour affichage immédiat

---

### Phase 4 : `useMenuData` - Fallback Offline

**Fichier : `src/hooks/useMenuData.ts`**

Ce hook est utilisé dans les modals pour afficher les plats disponibles. Il fait des appels Supabase sans fallback.

Modifications :
- Ajouter un fallback vers IndexedDB si offline
- Utiliser les données pré-chargées par `preloadCriticalData`
- Retourner les plats en cache quand `!navigator.onLine`

```text
+------------------+      Online?      +------------------+
|  useMenuData()   | -----> Yes -----> | Fetch Supabase   |
+------------------+                   +------------------+
        |                                      |
        v No                                   v
+------------------+                   +------------------+
| Load from IDB    |                   | Cache in IDB     |
| (menu_items)     |                   | + Return data    |
+------------------+                   +------------------+
```

---

### Phase 5 : Factures Offline avec numéro `OFF-xxx`

**Fichiers concernés :**
- `src/hooks/useInvoices.ts`
- `src/hooks/useOptimizedTableSessions.ts` (pour la création de facture à la fermeture)

Quand l'utilisateur ferme une table hors ligne :
1. Générer un numéro de facture local : `OFF-{timestamp}-{randomHex}`
2. Créer la facture localement via `queueMutation`
3. Marquer comme `status: 'paid'` si l'utilisateur encaisse immédiatement
4. À la synchronisation, le serveur garde ce numéro (pas de remplacement)

---

### Phase 6 : Encaissement Offline

Quand l'utilisateur marque une table comme payée hors ligne :
1. Mettre à jour la session localement (`status: 'paid'`, `payment_method: ...`)
2. Créer/mettre à jour la facture localement (`status: 'paid'`)
3. Créer la transaction comptable localement
4. Tout sera synchronisé au retour en ligne

---

### Phase 7 : Vider le message "lecture seule" persistant (PWA Cache)

Le message "lecture seule" n'existe plus dans le code actuel de `NetworkStatusBanner`, mais si l'utilisateur le voit encore, c'est à cause du cache PWA.

Solutions déjà en place :
- Le bouton "Réparer l'application (cache)" dans `SubscriptionGuard` vide les service workers et caches
- Le PWA est configuré avec `skipWaiting: true` et `clientsClaim: true`

Action requise de l'utilisateur : forcer un rafraîchissement complet ou utiliser le bouton de réparation.

---

### Récapitulatif des fichiers à modifier

| Fichier | Action |
|---------|--------|
| `src/pages/Tables.tsx` | Basculer sur `useOptimizedTableSessions` |
| `src/hooks/useOptimizedTableSessions.ts` | Ajouter `markSessionAsPaid`, `reopenSession` avec support offline |
| `src/components/tables/CreateSessionWithOrderModal.tsx` | Utiliser `queueMutation` si offline |
| `src/components/tables/QuickAddOrderToSessionModal.tsx` | Utiliser `queueMutation` si offline |
| `src/components/tables/TableSessionModal.tsx` | Utiliser `queueMutation` pour fermeture/paiement offline |
| `src/components/tables/RenameTableModal.tsx` | Utiliser `queueMutation` si offline |
| `src/hooks/useMenuData.ts` | Ajouter fallback IndexedDB |
| `src/hooks/useInvoices.ts` | Générer numéro `OFF-xxx` si offline |

---

### Détails techniques

#### Génération de numéro de facture offline

```typescript
function generateOfflineInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OFF-${timestamp}-${random}`;
}
```

#### Pattern pour mutations offline dans les modals

```typescript
const { isOffline } = useNetworkStatus();

const handleSubmit = async () => {
  if (isOffline) {
    const localId = generateLocalId();
    await queueMutation({
      table: 'table_sessions',
      operation: 'insert',
      data: { ...sessionData, id: localId },
      localId,
      userId: user.id,
      maxRetries: 3,
      conflictResolution: 'client-wins',
    });
    // Mettre à jour le cache local pour affichage immédiat
    toast({ title: 'Enregistré localement' });
    onSuccess();
    return;
  }
  
  // Online: appel Supabase normal
  const { data, error } = await supabase.from('table_sessions').insert(...);
};
```

---

### Résultat attendu

Après implémentation :
- Ouvrir une table offline : session créée localement, synchronisée plus tard
- Ajouter des plats offline : liste des plats visible depuis le cache
- Fermer et encaisser offline : facture générée avec numéro `OFF-xxx`, marquée payée
- Retour en ligne : synchronisation automatique de toutes les actions en attente
- Plus de message "lecture seule" après refresh du cache PWA
