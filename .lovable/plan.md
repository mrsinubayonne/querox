

# Plan de Correction Definitive -- QUEROX

## Diagnostic Confirmé (données live)

| Probleme | Cause racine | Preuve |
|----------|-------------|--------|
| Factures doublees | Offline queue insère OFF-xxx + trigger SQL crée FAC-xxx | **1074 factures doublées** en base |
| Transactions doublees | Frontend crée manuellement dans 3 endroits, aucun trigger auto | **23 transactions doublées** en base |
| Tables qui disparaissent | `cleanup_stale_table_sessions` = 12h trop court | Fonction SQL confirmée |
| "Marqué payé" absent du rapport | OrderStatusSelect crée catégorie `ventes` au lieu de `facture` | Code confirmé ligne 74 |

## Etapes d'Implementation

### Etape 1 -- Migration SQL (nettoyage + trigger manquant)

1. **Attacher le trigger `create_transaction_from_paid_invoice`** sur la table `invoices` (AFTER UPDATE) -- chaque facture passant à "paid" créera automatiquement sa transaction
2. **Supprimer les 1074 factures OFF-xxx doublées** (garder FAC-xxx quand les deux existent pour une même session)
3. **Supprimer les 23 transactions doublées** (garder la plus récente par fingerprint)
4. **Augmenter le délai de nettoyage** de 12h à 24h dans `cleanup_stale_table_sessions`

### Etape 2 -- OrderStatusSelect.tsx : supprimer la création manuelle de transaction

Quand une commande passe à "delivered" :
- Garder la mise à jour du statut de la commande
- Garder la mise à jour de la facture à "paid" (le trigger `create_invoice_for_order` crée déjà la facture à l'INSERT, et le nouveau trigger créera la transaction quand on la marque "paid")
- **Supprimer** le bloc lignes 54-79 (création manuelle de transaction "Commande livrée")
- Ajouter `payment_method` lors de la mise à jour de la facture pour que le trigger ait l'info

### Etape 3 -- useOptimizedTableSessions.ts : supprimer les créations manuelles

**Flux online (lignes 717-745)** :
- **Supprimer** le bloc qui crée manuellement `Facture FAC-xxx` dans les transactions
- Le trigger SQL s'en charge maintenant automatiquement

**Flux offline (lignes 554-622)** :
- **Supprimer** le `queueMutation` pour l'INSERT de facture (ligne 554-563) -- la facture locale reste en cache pour l'impression du reçu mais n'est plus envoyée au serveur (le trigger `create_invoice_for_closed_session` la créera côté serveur)
- **Supprimer** le `queueMutation` pour l'INSERT de transaction (ligne 602-622) -- le trigger s'en chargera quand la facture sera marquée payée après sync
- Garder le `queueMutation` pour l'UPDATE de facture existante (ligne 565-580) -- nécessaire pour marquer les factures existantes comme payées

### Etape 4 -- Comptabilite.tsx : simplifier la déduplication

- Renforcer le filtre des synthétiques : ne créer une entrée synthétique que si AUCUNE transaction avec le même `invoice_number` OU le même `amount+date` n'existe déjà
- Cela sert de filet de sécurité uniquement, le trigger étant la source principale

## Résumé des Changements

```text
AVANT :
  Commande livrée → frontend crée transaction + trigger crée facture → DOUBLON
  Table payée online → frontend crée transaction + (pas de trigger) → OK mais inconsistant
  Table payée offline → queue(invoice OFF-xxx) + queue(transaction) → sync → trigger crée FAC-xxx → DOUBLON x2
  Cleanup 12h → tables actives supprimées pendant le service

APRÈS :
  Commande livrée → trigger crée facture → frontend marque paid → trigger crée transaction → 1 seule entrée
  Table payée online → frontend marque facture paid → trigger crée transaction → 1 seule entrée
  Table payée offline → session sync → trigger crée FAC-xxx + marque paid → trigger crée transaction → 1 seule entrée
  Cleanup 24h → marge suffisante pour le service
```

**Fichiers modifiés** : 3 fichiers + 1 migration SQL
- `supabase/migrations/xxx.sql`
- `src/components/orders/OrderStatusSelect.tsx`
- `src/hooks/useOptimizedTableSessions.ts`
- `src/pages/Comptabilite.tsx`

