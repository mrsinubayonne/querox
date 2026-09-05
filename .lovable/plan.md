# Rendre l'outil rapide et utilisable sans dépendre du réseau

## 1. Pourquoi ça rame aujourd'hui

Trois causes identifiées dans le code actuel :

1. **Un gros téléchargement au démarrage.** À chaque ouverture de session, l'app recharge la totalité des données (menus, catégories, plats, commandes, factures, transactions, inventaire…). Les journaux montrent 88 commandes, 180 factures, 97 transactions rechargées — et ce chargement se relance plusieurs fois de suite quand l'app détecte plusieurs événements de connexion. Pendant ce temps, tout le reste attend.
2. **La section Tables ne s'affiche qu'après réponse du serveur.** Elle fait deux allers-retours réseau (les tables, puis toutes les commandes pour recalculer les montants) avant d'afficher quoi que ce soit. Si le serveur est lent, l'écran reste en attente.
3. **Toute écriture est bloquée sans réseau.** Ouvrir une table, ajouter un plat ou encaisser refuse de fonctionner dès que la connexion vacille — d'où « la prise de commande ne marche pas » quand le réseau est instable (et pas seulement coupé).

## 2. Ce qu'on change : le réseau ne sert plus qu'à synchroniser

Principe cible : l'app travaille sur les données locales de l'appareil, affiche tout instantanément, et le réseau tourne en arrière-plan uniquement pour envoyer/recevoir les mises à jour.

### Affichage instantané
- Tables, menus, inventaire, factures et rapport du jour s'affichent d'abord depuis les données locales, sans attendre le serveur.
- Le rafraîchissement serveur se fait en silence derrière, et met à jour l'écran quand il arrive.
- Fin des écrans « Chargement… » quand des données locales existent.

### Écriture toujours possible
- Ouvrir une table, ajouter des plats, encaisser et générer la facture fonctionnent immédiatement en local, avec ou sans réseau.
- Chaque action part dans une file d'attente envoyée au serveur en arrière-plan, avec réessais automatiques.
- Un petit indicateur montre « X actions en attente de synchronisation » et disparaît une fois tout envoyé.

### Démarrage allégé
- Au lancement, on ne charge que l'essentiel du point de vente courant (tables ouvertes, menu actif, inventaire).
- Factures, transactions et historique se chargent seulement à l'ouverture de leur page.
- Verrou anti-relance pour éviter les rechargements en rafale observés dans les journaux.

## 3. Détails techniques

- `src/hooks/useOptimizedTableSessions.ts` : lecture avec `initialData`/`placeholderData` depuis IndexedDB ; suppression de `assertReady` bloquant hors ligne ; mutations optimistes qui écrivent en local puis appellent les RPC atomiques (`create_table_session_with_order`, `add_order_to_table_session`, `mark_table_session_paid`) via la file de synchronisation.
- Suppression de la 2e requête `orders` au chargement : le total est repris du cache local puis corrigé par le realtime / la réponse RPC.
- `src/hooks/useOfflineData.ts` : `preloadCriticalData` scindé en `preloadEssential` (outlets, menu actif, inventaire, sessions ouvertes) et `preloadDeferred` (factures, transactions, historique) déclenché à la demande, avec limites de lignes réduites.
- `src/contexts/AuthContext.tsx` : dédoublonnage du déclenchement de préchargement (un seul par session utilisateur, ignore les `INITIAL_SESSION` répétés).
- `src/lib/syncEngine.ts` / `offlineQueue.ts` : file unique pour les écritures tables/commandes/paiements, réessai exponentiel, résolution par identifiant UUID déjà généré côté client.
- `src/hooks/useNetworkStatus.ts` : le mode « instable » n'empêche plus les écritures, il bascule simplement en file d'attente.
- Aucune modification de `.env`, `types.ts` ni `config.toml`.

## 4. Vérification

- Tables : ouvrir une table, ajouter des plats, encaisser — en ligne puis en coupant le réseau — et vérifier que tout apparaît instantanément et se synchronise au retour.
- Contrôle qu'aucune table « Occupée – 0 FCFA » n'apparaît après synchronisation.
- Mesure du temps d'affichage de la grille au démarrage (objectif : immédiat depuis le cache).
