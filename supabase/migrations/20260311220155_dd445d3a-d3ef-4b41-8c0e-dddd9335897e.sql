DO $$
DECLARE
  v_user_id uuid := '328c736d-b113-4f18-80eb-b8b846e6a685'::uuid;
  v_outlet_id uuid := '4b90c488-8bfa-4e0e-91a3-3ff83225f3d3'::uuid;
BEGIN
  -- Menus hierarchy
  DELETE FROM public.menu_item_ingredients mii
  WHERE mii.menu_item_id IN (
    SELECT mi.id
    FROM public.menu_items mi
    JOIN public.menu_categories mc ON mc.id = mi.category_id
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE m.user_id = v_user_id
      AND (m.outlet_id = v_outlet_id OR m.outlet_id IS NULL)
  );

  DELETE FROM public.menu_items mi
  WHERE mi.category_id IN (
    SELECT mc.id
    FROM public.menu_categories mc
    JOIN public.menus m ON m.id = mc.menu_id
    WHERE m.user_id = v_user_id
      AND (m.outlet_id = v_outlet_id OR m.outlet_id IS NULL)
  );

  DELETE FROM public.menu_categories mc
  WHERE mc.menu_id IN (
    SELECT m.id
    FROM public.menus m
    WHERE m.user_id = v_user_id
      AND (m.outlet_id = v_outlet_id OR m.outlet_id IS NULL)
  );

  DELETE FROM public.menus m
  WHERE m.user_id = v_user_id
    AND (m.outlet_id = v_outlet_id OR m.outlet_id IS NULL);

  -- Core operations
  DELETE FROM public.debtor_payments dp
  WHERE dp.user_id = v_user_id
    AND (dp.outlet_id = v_outlet_id OR dp.outlet_id IS NULL);

  DELETE FROM public.invoices i
  WHERE i.user_id = v_user_id
    AND (i.outlet_id = v_outlet_id OR i.outlet_id IS NULL);

  DELETE FROM public.transactions t
  WHERE t.user_id = v_user_id
    AND (t.outlet_id = v_outlet_id OR t.outlet_id IS NULL);

  DELETE FROM public.orders o
  WHERE o.user_id = v_user_id
    AND (o.outlet_id = v_outlet_id OR o.outlet_id IS NULL);

  DELETE FROM public.table_sessions ts
  WHERE ts.user_id = v_user_id
    AND (ts.outlet_id = v_outlet_id OR ts.outlet_id IS NULL);

  -- CRM / planning
  DELETE FROM public.reservations r
  WHERE r.user_id = v_user_id
    AND (r.outlet_id = v_outlet_id OR r.outlet_id IS NULL);

  DELETE FROM public.business_periods bp
  WHERE bp.user_id = v_user_id
    AND (bp.outlet_id = v_outlet_id OR bp.outlet_id IS NULL);

  DELETE FROM public.purchase_orders po
  WHERE po.user_id = v_user_id
    AND (po.outlet_id = v_outlet_id OR po.outlet_id IS NULL);

  DELETE FROM public.inventory_losses il
  WHERE il.user_id = v_user_id
    AND (il.outlet_id = v_outlet_id OR il.outlet_id IS NULL);

  DELETE FROM public.inventory_reorder_rules irr
  WHERE irr.user_id = v_user_id
    AND irr.inventory_item_id IN (
      SELECT ii.id
      FROM public.inventory_items ii
      WHERE ii.user_id = v_user_id
        AND (ii.outlet_id = v_outlet_id OR ii.outlet_id IS NULL)
    );

  DELETE FROM public.inventory_items ii
  WHERE ii.user_id = v_user_id
    AND (ii.outlet_id = v_outlet_id OR ii.outlet_id IS NULL);

  DELETE FROM public.business_customers bc
  WHERE bc.user_id = v_user_id
    AND (bc.outlet_id = v_outlet_id OR bc.outlet_id IS NULL);

  DELETE FROM public.customers c
  WHERE c.user_id = v_user_id
    AND (c.outlet_id = v_outlet_id OR c.outlet_id IS NULL);

  DELETE FROM public.events e
  WHERE e.user_id = v_user_id;

  DELETE FROM public.invoice_settings s
  WHERE s.user_id = v_user_id
    AND (s.outlet_id = v_outlet_id::text OR s.outlet_id IS NULL);
END $$;