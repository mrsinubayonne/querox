-- Table pour lier les items du menu aux items de l'inventaire (recettes)
CREATE TABLE IF NOT EXISTS public.menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity_needed NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(menu_item_id, inventory_item_id)
);

-- RLS policies pour menu_item_ingredients
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ingredients of their menu items"
ON public.menu_item_ingredients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.menu_items mi
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE mi.id = menu_item_ingredients.menu_item_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage ingredients of their menu items"
ON public.menu_item_ingredients
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.menu_items mi
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE mi.id = menu_item_ingredients.menu_item_id
    AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.menu_items mi
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE mi.id = menu_item_ingredients.menu_item_id
    AND m.user_id = auth.uid()
  )
);

-- Fonction pour déduire automatiquement l'inventaire lors d'une commande
CREATE OR REPLACE FUNCTION public.deduct_inventory_from_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item JSONB;
  menu_item_id UUID;
  quantity INTEGER;
  ingredient RECORD;
BEGIN
  -- Vérifier que la commande est livrée/terminée
  IF NEW.status = 'delivered' OR NEW.status = 'completed' THEN
    -- Parcourir chaque item de la commande
    FOR order_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      menu_item_id := (order_item->>'id')::UUID;
      quantity := (order_item->>'quantity')::INTEGER;
      
      -- Pour chaque ingrédient du menu item
      FOR ingredient IN
        SELECT 
          mii.inventory_item_id,
          mii.quantity_needed,
          mii.unit
        FROM public.menu_item_ingredients mii
        WHERE mii.menu_item_id = menu_item_id
      LOOP
        -- Déduire la quantité de l'inventaire
        UPDATE public.inventory_items
        SET 
          current_stock = current_stock - (ingredient.quantity_needed * quantity),
          updated_at = now()
        WHERE id = ingredient.inventory_item_id
        AND user_id = NEW.user_id;
        
        -- Créer un mouvement de stock
        INSERT INTO public.stock_movements (
          item_id,
          quantity,
          movement_type,
          reason
        ) VALUES (
          ingredient.inventory_item_id,
          -(ingredient.quantity_needed * quantity),
          'sortie',
          'Vente automatique - Commande #' || NEW.id
        );
      END LOOP;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger pour déduction automatique lors d'une commande
DROP TRIGGER IF EXISTS trigger_deduct_inventory ON public.orders;
CREATE TRIGGER trigger_deduct_inventory
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.deduct_inventory_from_order();

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_menu_item_ingredients_menu_item ON public.menu_item_ingredients(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_ingredients_inventory_item ON public.menu_item_ingredients(inventory_item_id);

-- Trigger pour updated_at
CREATE TRIGGER update_menu_item_ingredients_updated_at
BEFORE UPDATE ON public.menu_item_ingredients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();