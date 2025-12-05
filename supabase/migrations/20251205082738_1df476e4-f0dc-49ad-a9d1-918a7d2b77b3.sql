-- Nettoyer les transactions en double : garder seulement la plus récente par numéro de facture
WITH duplicates AS (
  SELECT t.id,
         ROW_NUMBER() OVER (
           PARTITION BY (regexp_match(t.title, 'INV-\d+-\d+'))[1]
           ORDER BY t.created_at DESC
         ) as rn
  FROM transactions t
  WHERE t.category = 'facture'
    AND t.title ~ 'INV-\d+-\d+'
)
DELETE FROM transactions
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Supprimer les transactions liées à des factures B2B encore impayées
DELETE FROM transactions t
USING invoices i
WHERE t.title LIKE '%' || i.invoice_number || '%'
  AND i.invoice_type = 'b2b'
  AND i.status = 'unpaid';