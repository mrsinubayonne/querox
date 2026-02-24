
# Correction definitive : Menus et Plats en mode Hors-ligne

## Diagnostic précis

### Problème 1 : Section Tables (QuickAddOrderToSessionModal)

La sequence d'execution actuelle crée une condition de course (race condition) :

```text
1. Modal s'ouvre → setOfflineMenuItems([]) est appelé (reset)
2. loadOfflineMenuItems() démarre (async)
3. useMenuData(activeMenuId) s'execute en parallele
   → cherche dans localStorage (publicMenu_v2_xxx) — souvent absent
   → onlineMenuItems = []
4. menuItems = merge([]) = [] → affichage vide
5. loadOfflineMenuItems() se termine → setOfflineMenuItems([items])
   MAIS useMenuData retourne toujours [] car activeMenuId peut ne pas être set encore
```

La dépendance croisée entre `useMenuData` (qui cherche dans `localStorage` avec le préfixe `publicMenu_v2_`) et la logique IndexedDB crée un vide systématique.

### Problème 2 : Page Menus (/menus)

`Menus.tsx` appelle directement Supabase sans aucun fallback offline. Quand la connexion échoue, `menus` reste vide et `MenuItemManager` n'affiche rien. La page ne lit pas du tout IndexedDB.

---

## Solution

### Fix 1 : QuickAddOrderToSessionModal — Supprimer la dépendance à useMenuData

Le hook `useMenuData` est conçu pour le menu PUBLIC (affiché aux clients) et utilise le cache `localStorage publicMenu_v2_`. Il n'est pas adapté à l'usage interne (tables). La correction consiste à :

1. **Supprimer `useMenuData`** du composant — il n'est utile que si online ET que le cache localStorage existe
2. **Toujours charger depuis IndexedDB d'abord** (online ou offline), puis enrichir avec les données fraiches si online
3. **Corriger l'ordre des opérations** : ne pas reset `offlineMenuItems` avant que le chargement soit terminé

Nouvelle logique :
```text
Modal s'ouvre :
  1. Lancer loadMenuItems() immédiatement (sans reset préalable)
  2. loadMenuItems() lit IndexedDB → setState avec les données du cache
  3. Si online : appel Supabase en arrière-plan → mise à jour si données fraîches
  4. Plus de dépendance à useMenuData
```

### Fix 2 : Page Menus — Ajouter un fallback IndexedDB

Modifier `Menus.tsx` pour lire le cache IndexedDB quand Supabase échoue (ou quand offline) :

```text
fetchMenus() :
  1. Si isOffline → lire depuis IndexedDB (getData('menus', userId))
  2. Si online → appel Supabase normal, avec catch → fallback IndexedDB
  3. Passer les menus récupérés à setMenus() dans tous les cas
```

Pour `MenuItemManager`, il utilise `useMenus()` qui a déjà une logique offline correcte — le problème vient uniquement de `Menus.tsx` qui ne lui donne pas de menu actif.

---

## Fichiers à modifier

### `src/components/tables/QuickAddOrderToSessionModal.tsx`
- Supprimer l'import et l'usage de `useMenuData`
- Réécrire `loadOfflineMenuItems` en `loadMenuItems` : charge IndexedDB d'abord, puis Supabase si online
- Supprimer le reset prématuré `setOfflineMenuItems([])`
- Renommer `offlineMenuItems` en `menuItems` (unique source de vérité)
- Supprimer la logique de merge `onlineMenuItems / offlineMenuItems`

### `src/pages/Menus.tsx`
- Ajouter `useNetworkStatus` pour détecter le mode hors-ligne
- Modifier `fetchMenus()` pour lire IndexedDB quand offline ou en cas d'erreur réseau
- Ajouter `getData` de `@/lib/offlineStorage` pour le fallback
- Ne plus bloquer sur `!selectedOutletId` en mode offline (utiliser `localStorage`)

---

## Résultat attendu

| Scénario | Avant | Après |
|---|---|---|
| Tables → ouvrir commande (offline) | Liste vide | Plats du cache IndexedDB |
| Section Menus (offline) | Page blanche | Menus du cache IndexedDB |
| Tables → ouvrir commande (online) | Plats ok | Plats ok (inchangé) |
| Section Menus (online) | Menus ok | Menus ok (inchangé) |
