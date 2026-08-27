/**
 * Code d'accès passe-partout (master).
 * Permet d'ouvrir n'importe quel accès protégé : propriétaire, profils
 * (superviseur, caissière...), comptabilité et gestion.
 */
export const MASTER_ACCESS_CODE = '7777';

export const isMasterCode = (code?: string | null): boolean =>
  (code ?? '').trim() === MASTER_ACCESS_CODE;
