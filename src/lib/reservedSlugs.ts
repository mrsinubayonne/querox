// Slugs réservés (routes système) — ne peuvent pas être utilisés comme slug de restaurant
export const RESERVED_SLUGS = new Set([
  'auth', 'dashboard', 'menus', 'all-menus', 'commandes', 'tables', 'inventaire',
  'qr-codes', 'site-web', 'site-web-container', 'site-web-benefits', 'statistiques',
  'rapports', 'parametres', 'abonnement', 'comptabilite', 'marketing-hub', 'marketing',
  'conception-graphique', 'reseaux-sociaux', 'publicite-facebook', 'consulting',
  'services', 'admin', 'partner-dashboard', 'partner-signup', 'reservations', 'support',
  'factures', 'equipe', 'clients', 'debiteurs', 'performance-personnel', 'staff-request',
  'team-login', 'team-join', 'team-setup', 'select-outlet', 'menu', 'w', 'blog',
  'cgu-cgv', 'payment-success', 'payment-failure', 'profile-management',
  'clients-entreprise', 'menus-protected', 'parametres-protected', 'inventaire-protected',
  'comptabilite-protected', 'equipe-protected', 'statistiques-protected', 'plus',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
