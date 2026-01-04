-- Ajouter les permissions manquantes
INSERT INTO public.permissions (name, category, description) VALUES
  ('view_tables', 'tables', 'Consulter les tables'),
  ('manage_tables', 'tables', 'Gérer les tables'),
  ('view_accounting', 'accounting', 'Consulter la comptabilité'),
  ('manage_accounting', 'accounting', 'Gérer la comptabilité'),
  ('view_events', 'events', 'Consulter les événements'),
  ('manage_events', 'events', 'Gérer les événements'),
  ('view_website', 'website', 'Consulter le site web'),
  ('manage_website', 'website', 'Gérer le site web'),
  ('view_qrcodes', 'qrcodes', 'Consulter les QR codes'),
  ('manage_qrcodes', 'qrcodes', 'Gérer les QR codes'),
  ('view_reports', 'reports', 'Consulter les rapports journaliers'),
  ('manage_reports', 'reports', 'Gérer les rapports journaliers'),
  ('view_debtors', 'debtors', 'Consulter les débiteurs'),
  ('manage_debtors', 'debtors', 'Gérer les débiteurs')
ON CONFLICT (name) DO NOTHING;