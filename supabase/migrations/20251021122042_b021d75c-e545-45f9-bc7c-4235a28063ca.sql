-- Create outlets for existing users based on their menu names
INSERT INTO public.outlets (user_id, name, address, phone)
SELECT DISTINCT ON (m.user_id)
  m.user_id,
  m.name,
  NULL as address,
  NULL as phone
FROM public.menus m
WHERE NOT EXISTS (
  SELECT 1 FROM public.outlets o 
  WHERE o.user_id = m.user_id
)
ORDER BY m.user_id, m.created_at ASC;

-- Update profiles to select the first outlet for each user
UPDATE public.profiles p
SET selected_outlet_id = (
  SELECT o.id 
  FROM public.outlets o 
  WHERE o.user_id = p.id 
  ORDER BY o.created_at ASC 
  LIMIT 1
)
WHERE p.selected_outlet_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.outlets o 
    WHERE o.user_id = p.id
  );