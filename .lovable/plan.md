## 1. Refonte POS "vraie" façon Odoo (CreateSessionWithOrderModal + AddOrderFromCustomerModal)

Objectif : se démarquer nettement de l'ancienne modale. Layout 3 colonnes conservé, mais l'interaction change.

### Colonne centrale — Plats (sans images)
- Grille dense de **tuiles compactes** (text-only) : nom en haut, prix en bas, couleur de fond dérivée de la catégorie (pastille teintée). 5–6 colonnes sur desktop au lieu de 2–4. Pas d'`<img>`, pas d'`aspect-square` — disparition complète des images.
- Hauteur fixe par tuile (~76px) → scroll instantané, zéro layout shift.
- Catégories en **onglets horizontaux** au-dessus de la grille (façon caisse Odoo), avec compteur. La colonne gauche "Catégories" verticale est supprimée → plus de place pour les plats.

### Colonne droite — Ticket + Pavé numérique (la grosse différence)
- Le ticket devient une **liste sélectionnable** : on clique sur une ligne, elle devient active (surlignée).
- En dessous : un **pavé numérique Odoo-like** (0–9, `.`, `←`) + 4 boutons modificateurs : `Qté`, `Prix`, `Remise %`, `×` (suppr).
  - Sélectionner `Qté` puis taper `3` → met la quantité de la ligne active à 3.
  - Sélectionner `Prix` puis taper `1500` → change le prix unitaire.
  - Sélectionner `Remise` puis `10` → applique 10 % sur la ligne.
- Boutons d'action en bas : `+ Article libre`, `Vider`, `Ouvrir & Commander`.
- Le champ "Couverts" passe dans le header au-dessus du ticket (toujours visible).

### Comportements
- Cliquer un plat → ajout direct quantité 1, ligne auto-sélectionnée → on peut taper `2` `Qté` pour ajuster.
- Recherche menu : raccourci `/` pour focus, `Échap` pour vider.
- Suppression du `prompt()` natif pour les plats à prix libre → ouverture inline dans le pavé numérique (mode `Prix` auto-activé).

Mêmes changements appliqués à `AddOrderFromCustomerModal.tsx` (variante avec sélection client en haut du panneau droit, pavé numérique en bas).

## 2. Suppression définitive des images dans la prise de commande

- Retrait du bloc `{item.image_url && ...}` dans les deux modales.
- Le champ `image_url` n'est plus sélectionné ni chargé par `useInternalMenuItems` (économie réseau + IndexedDB plus léger).

## 3. Chargement ultra-rapide

### Préchargement global du menu
- Nouveau hook `useMenuPrefetch()` monté dans `App.tsx` (après login) : déclenche `useInternalMenuItems(true)` une seule fois en arrière-plan dès l'arrivée sur l'app → quand l'utilisateur clique sur une table, **le cache mémoire est déjà chaud**, ouverture instantanée.
- Garde le `menuItemsMemoryCache` existant comme source de vérité ; la modale lit synchroneusement et n'affiche jamais le spinner si le cache est peuplé.

### Allègement du fetch Supabase
- Retirer `image_url`, `description`, `is_custom_name` du `select` initial (non utilisés dans le POS sans images).
- **Différer** le chargement des `menu_item_option_groups` / `option_values` : ne les charger qu'au premier clic sur un plat avec options (lazy via `useMenuItemOptionsPicker`). Aujourd'hui c'est fait pour tous les items à chaque refresh → gros gain.
- Paralléliser categories + items avec `Promise.all` au lieu de séquentiel.

### Ouverture de modale instantanée
- `CreateSessionWithOrderModal` : ne plus reset `cart`/`searchTerm` dans un `useEffect` (provoque un re-render après ouverture) — faire le reset dans le `onClose` à la place.
- Memoïser les composants tuiles (`React.memo`) pour éviter de re-render 200 boutons à chaque frappe de recherche.
- Debounce de la recherche (150 ms) sur la valeur utilisée pour le filtre (l'input reste contrôlé instantanément).

### Détails techniques
```
src/
  components/tables/
    CreateSessionWithOrderModal.tsx    ← refonte UI + pavé numérique
    AddOrderFromCustomerModal.tsx      ← idem
    pos/
      PosNumpad.tsx                    ← nouveau
      PosProductTile.tsx               ← nouveau (memo)
      PosCategoryTabs.tsx              ← nouveau
      PosTicketLine.tsx                ← nouveau (memo)
  hooks/
    useInternalMenuItems.ts            ← select allégé, parallélisation, option_groups lazy
    useMenuPrefetch.ts                 ← nouveau
  App.tsx                              ← branche useMenuPrefetch()
```

Aucune modification de schéma DB, aucune migration. Pas de changement de logique de paiement, factures ou triggers SQL.
