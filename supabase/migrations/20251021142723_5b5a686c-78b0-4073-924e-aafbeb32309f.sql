-- Migration: Assigner les menus orphelins aux outlets sélectionnés
-- Cette migration associe automatiquement les menus existants (outlet_id = NULL)
-- à l'outlet actuellement sélectionné par l'utilisateur dans son profil

UPDATE public.menus m
SET outlet_id = p.selected_outlet_id
FROM public.profiles p
WHERE m.user_id = p.id
  AND m.outlet_id IS NULL
  AND p.selected_outlet_id IS NOT NULL;