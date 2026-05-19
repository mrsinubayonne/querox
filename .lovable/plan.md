
# Plan — 5 corrections chirurgicales

## Bug 1 — Réactivité `outletId` (déjà partiellement fait)

`OutletContext.tsx` et l'enveloppe dans `main.tsx` existent déjà. Il reste à :
- Vérifier que `useOptimizedOrders`, `useInvoices`, `useInventory`, `useTransactions`, `useCustomers` consomment bien `useOutletContext()` (certains sont déjà migrés, à confirmer fichier par fichier).
- Normaliser toutes les `queryKey` au format `[name, outletId ?? 'no-outlet']` (supprimer les variantes `[name, user?.id, outletId]`).
- Dans `useOutlets.ts` : injecter `setContextOutletId(outletId)` après chacun des 7 `localStorage.setItem('selectedOutletId', ...)` pour propager immédiatement le changement au contexte (sans attendre l'événement `storage` qui ne se déclenche pas dans le même onglet).

## Bug 2 — Erreurs silencieuses dans les hooks

Parcourir `src/hooks/*.ts` et remplacer les `catch` vides ou réduits à `console.error` (sans feedback UI) par :
```ts
} catch (error: any) {
  console.error('Erreur hook:', error);
  toast.error("Erreur de chargement", { description: "Impossible de charger les données. Veuillez réessayer." });
}
```
Ajouter `import { toast } from 'sonner';` si absent. Ne pas toucher aux `catch` qui ont déjà un toast ou qui sont volontairement silencieux (ex. sync queue offline, retries).

## Bug 3 — `useDashboardStats` loading infini

Dans le `useEffect` principal :
- `let cancelled = false;` au début.
- `const timeoutId = setTimeout(() => { if (!cancelled) setLoading(false); }, 15000);`
- Gating `if (!cancelled)` autour des `setLoading(false)`.
- Cleanup : `return () => { cancelled = true; clearTimeout(timeoutId); };`
- Ajouter un toast d'erreur dans le `catch`.

## Bug 4 — `team-member-auth` au-delà de 200 utilisateurs

Dans `supabase/functions/team-member-auth/index.ts`, remplacer le bloc de recherche utilisateur (depuis `// Try to find existing user by email` jusqu'à la fin du `else { updateUserById ... }`) par une version qui :
- Utilise `listUsers({ page: 1, perPage: 1000 })` au lieu de 200.
- Gère explicitement le cas "already been registered" depuis `createUser` avec un message clair.
- Conserve la synchro du mot de passe via `updateUserById` quand l'utilisateur existe.

## Bug 5 — Membre équipe sans outlet

Dans `src/pages/TeamMemberAuth.tsx` :
- Importer `useOutletContext`.
- Récupérer `setSelectedOutletId` du contexte.
- Remplacer le bloc `localStorage.setItem('selectedOutletId', ...)` par :
```ts
const assignedOutletId = member.outlet_id || member.outlet_ids?.[0] || null;
if (assignedOutletId) {
  setSelectedOutletId(assignedOutletId);
} else {
  toast.warning("Aucun point de vente assigné", {
    description: "Contactez votre responsable pour vous assigner à un outlet."
  });
}
```

## Détails techniques

- Aucune modif de schéma DB.
- Aucune dépendance ajoutée.
- `OutletProvider` déjà monté → pas de risque de régression sur l'arbre React.
- L'événement `storage` ne se déclenche pas dans l'onglet émetteur : c'est pourquoi `useOutlets.ts` doit appeler explicitement `setContextOutletId` après chaque écriture localStorage.
- Pour Bug 2, je passerai en revue chaque hook avant édition pour éviter d'écraser des `catch` légitimes (offline queue, conflict resolution, sync engine).
- Pour Bug 4, la limite `perPage: 1000` est le maximum supporté par l'API admin Supabase ; au-delà il faudrait paginer, mais cela couvre le besoin actuel.

## Fichiers touchés

- `src/hooks/useOptimizedOrders.ts`, `useInvoices.ts`, `useInventory.ts`, `useTransactions.ts`, `useCustomers.ts`, `useOutlets.ts`, `useDashboardStats.ts`
- Hooks divers (Bug 2, à identifier après audit)
- `src/pages/TeamMemberAuth.tsx`
- `supabase/functions/team-member-auth/index.ts`
