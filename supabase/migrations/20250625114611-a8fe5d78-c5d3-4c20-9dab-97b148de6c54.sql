
-- Add missing columns to the websites table for hero section
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS hero_title text;
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS hero_subtitle text;
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS hero_button_primary text DEFAULT 'Voir le Menu';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS hero_button_secondary text DEFAULT 'Découvrir l''histoire';

-- Add missing columns for stats section
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS stats_experience text DEFAULT '15+';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS stats_clients text DEFAULT '10k+';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS stats_dishes text DEFAULT '50+';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS stats_rating text DEFAULT '4.8★';

-- Add missing columns for specialities section
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS specialities_title text DEFAULT 'Découvrez nos spécialités';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS specialities_subtitle text DEFAULT 'Chaque plat est préparé avec des ingrédients frais et de qualité';

-- Add missing columns for dishes
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish1_name text DEFAULT 'Hamburger Royal';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish1_price text DEFAULT '14.50 €';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish1_rating text DEFAULT '4.8';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish1_image_url text;

ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish2_name text DEFAULT 'Salade Fraîche';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish2_price text DEFAULT '12.90 €';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish2_rating text DEFAULT '4.7';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish2_image_url text;

ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish3_name text DEFAULT 'Pasta al Pomodoro';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish3_price text DEFAULT '16.20 €';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish3_rating text DEFAULT '4.9';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS dish3_image_url text;

-- Add missing columns for contact section
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS contact_title text DEFAULT 'Venez nous rendre visite';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS contact_subtitle text DEFAULT 'Nous sommes ouverts du lundi au dimanche';
