-- Make partner company fields optional or use defaults
ALTER TABLE partners 
  ALTER COLUMN company_name SET DEFAULT 'Nouveau partenaire',
  ALTER COLUMN company_type SET DEFAULT 'Partenaire',
  ALTER COLUMN description SET DEFAULT 'Nouveau partenaire';