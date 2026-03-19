
-- Delete the 2 duplicate transactions created by the old trigger
-- These are "Facture Débiteur ..." entries that double-counted debtor payments
DELETE FROM public.transactions 
WHERE id IN (
  '48d48f3e-81c9-4e5a-b3a1-5ec41f6153ab',
  'c8e0c4b6-7bd7-474d-8aec-ea6c1e2ac601'
);
