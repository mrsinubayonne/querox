
-- Ajoute une colonne "slug" pour chaque site web (unique et non nulle)
ALTER TABLE public.websites
ADD COLUMN slug text UNIQUE;

-- Pour les anciens enregistrements, init le slug à partir du nom (remplacer espaces par tirets, tout en minuscules)
UPDATE public.websites 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));

-- S’assurer que le champ "slug" n’est jamais nul
ALTER TABLE public.websites
ALTER COLUMN slug SET NOT NULL;
