
UPDATE public.profiles p
SET selected_outlet_id = o.id
FROM public.outlets o
WHERE o.user_id = p.id
  AND p.selected_outlet_id IS NULL
  AND p.id IN (
    '11c2e223-9be0-4032-9f3a-dbdec4c468af',
    'd09c7d84-8360-410a-8770-d6122bb2ff51'
  );
