-- Migration: Suppression complète de toutes les données business
-- Remise à zéro complète de l'application

-- Supprimer les factures
DELETE FROM public.invoices;

-- Supprimer les commandes
DELETE FROM public.orders;

-- Supprimer les réservations
DELETE FROM public.reservations;

-- Supprimer les transactions comptables
DELETE FROM public.transactions;

-- Supprimer les mouvements de stock
DELETE FROM public.stock_movements;

-- Supprimer les articles d'inventaire
DELETE FROM public.inventory_items;

-- Supprimer les fournisseurs
DELETE FROM public.suppliers;

-- Supprimer les clients
DELETE FROM public.customers;

-- Note: Les outlets et les profiles sont conservés pour que les utilisateurs puissent se reconnecter