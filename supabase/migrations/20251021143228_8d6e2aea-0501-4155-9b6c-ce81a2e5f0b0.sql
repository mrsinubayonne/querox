-- Migration: Suppression de tous les menus existants pour repartir de zéro
-- Chaque outlet doit créer ses propres menus indépendamment

-- Supprimer tous les menu_items (sera fait en cascade via les catégories)
-- Supprimer toutes les catégories (sera fait en cascade via les menus)
-- Supprimer tous les menus
DELETE FROM public.menus;