/**
 * Gestion locale des accès profils : code propriétaire, permissions personnalisées,
 * attribution des actions (qui a facturé) et journal d'activité.
 * Tout est stocké localement (offline-first) et lié au compte propriétaire.
 */

import { isMasterCode } from './masterCode';

export type PermissionKey =
  | 'dashboard'
  | 'orders'
  | 'reservations'
  | 'menus'
  | 'inventory'
  | 'invoices'
  | 'accounting'
  | 'statistics'
  | 'customers'
  | 'events'
  | 'qrcodes'
  | 'settings'
  | 'team'
  | 'support';

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: 'Tableau de bord',
  orders: 'Commandes & Tables',
  reservations: 'Réservations',
  menus: 'Menus',
  inventory: 'Inventaire',
  invoices: 'Factures',
  accounting: 'Comptabilité & Salaires',
  statistics: 'Statistiques & Rapports',
  customers: 'Clients',
  events: 'Événements',
  qrcodes: 'QR Codes',
  settings: 'Paramètres',
  team: 'Équipe',
  support: 'Support',
};

export const EDITABLE_PERMISSIONS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

const OVERRIDES_KEY = 'querox_profile_permissions';
const ACTOR_KEY = 'querox_action_actors';
const AUDIT_KEY = 'querox_audit_log';
const AUDIT_MAX = 400;

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
};

/* ---------------------------------- Code propriétaire --------------------------------- */

const ownerKey = (userId: string) => `querox_owner_code_${userId}`;

const encode = (code: string) => btoa(unescape(encodeURIComponent(`qx:${code}`)));

export const hasOwnerCode = (userId?: string | null): boolean =>
  !!userId && !!localStorage.getItem(ownerKey(userId));

export const setOwnerCode = (userId: string, code: string) => {
  localStorage.setItem(ownerKey(userId), encode(code));
};

export const verifyOwnerCode = (userId: string, code: string): boolean =>
  isMasterCode(code) || localStorage.getItem(ownerKey(userId)) === encode(code);

export const clearOwnerCode = (userId: string) => localStorage.removeItem(ownerKey(userId));

export const isOwnerUnlocked = (): boolean => sessionStorage.getItem('querox_owner_unlocked') === '1';
export const markOwnerUnlocked = () => sessionStorage.setItem('querox_owner_unlocked', '1');
export const clearOwnerUnlocked = () => sessionStorage.removeItem('querox_owner_unlocked');

/* --------------------------- Permissions personnalisées par profil -------------------- */

export type PermissionOverrides = Partial<Record<PermissionKey, boolean>>;

export const getPermissionOverrides = (profileId: string): PermissionOverrides =>
  readJSON<Record<string, PermissionOverrides>>(OVERRIDES_KEY, {})[profileId] || {};

export const setPermissionOverrides = (profileId: string, overrides: PermissionOverrides) => {
  const all = readJSON<Record<string, PermissionOverrides>>(OVERRIDES_KEY, {});
  all[profileId] = overrides;
  writeJSON(OVERRIDES_KEY, all);
  try {
    window.dispatchEvent(new CustomEvent('profile:permissions-changed', { detail: { profileId } }));
  } catch {
    /* noop */
  }
};

/* ------------------------------- Profil actuellement connecté ------------------------- */

export interface ActiveActor {
  profileId: string | null;
  name: string;
  role: string;
}

export const getActiveActor = (): ActiveActor => {
  try {
    const raw = localStorage.getItem('outletProfile');
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.profileName) {
        return { profileId: s.profileId ?? null, name: s.profileName, role: s.role || 'profil' };
      }
    }
  } catch {
    /* noop */
  }
  return { profileId: null, name: 'Propriétaire', role: 'proprietaire' };
};

/* ------------------------------ Attribution (qui a fait quoi) ------------------------- */

export interface ActorStamp {
  name: string;
  role: string;
  at: string;
}

export const recordActor = (key: string) => {
  if (!key) return;
  const actor = getActiveActor();
  const map = readJSON<Record<string, ActorStamp>>(ACTOR_KEY, {});
  map[key] = { name: actor.name, role: actor.role, at: new Date().toISOString() };
  const entries = Object.entries(map);
  if (entries.length > 2000) {
    writeJSON(ACTOR_KEY, Object.fromEntries(entries.slice(-1500)));
  } else {
    writeJSON(ACTOR_KEY, map);
  }
};

export const getActor = (...keys: (string | null | undefined)[]): ActorStamp | null => {
  const map = readJSON<Record<string, ActorStamp>>(ACTOR_KEY, {});
  for (const k of keys) {
    if (k && map[k]) return map[k];
  }
  return null;
};

/* ------------------------------------- Journal ---------------------------------------- */

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: 'ajout' | 'modification' | 'suppression';
  entity: string;
  details?: string;
}

const ENTITY_LABELS: Record<string, string> = {
  orders: 'Commandes',
  order_items: 'Lignes de commande',
  invoices: 'Factures',
  menu_items: 'Plats',
  menus: 'Menus',
  inventory_items: 'Inventaire',
  transactions: 'Transactions',
  table_sessions: 'Sessions de table',
  outlet_profiles: 'Profils',
  outlets: 'Points de vente',
  reservations: 'Réservations',
  customers: 'Clients',
  employees: 'Employés',
  salary_payments: 'Salaires',
};

export const entityLabel = (table: string) => ENTITY_LABELS[table] || table;

export const appendAudit = (
  action: AuditEntry['action'],
  entity: string,
  details?: string
) => {
  const actor = getActiveActor();
  const entry: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    actor: actor.name,
    role: actor.role,
    action,
    entity,
    details,
  };
  const log = readJSON<AuditEntry[]>(AUDIT_KEY, []);
  log.unshift(entry);
  writeJSON(AUDIT_KEY, log.slice(0, AUDIT_MAX));
};

export const getAuditLog = (): AuditEntry[] => readJSON<AuditEntry[]>(AUDIT_KEY, []);

export const clearAuditLog = () => localStorage.removeItem(AUDIT_KEY);
