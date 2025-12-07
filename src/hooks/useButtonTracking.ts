import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Button categories for organization
export type ButtonCategory = 
  | 'navigation'
  | 'tables'
  | 'orders'
  | 'invoices'
  | 'inventory'
  | 'accounting'
  | 'team'
  | 'settings'
  | 'menu'
  | 'reports'
  | 'general';

export const useButtonTracking = () => {
  const trackClick = useCallback(async (buttonName: string, category: ButtonCategory = 'general') => {
    try {
      await supabase.rpc('track_button_click', {
        _button_name: buttonName,
        _button_category: category
      });
    } catch (error) {
      // Silently fail - tracking should not interrupt user experience
      console.error('Button tracking error:', error);
    }
  }, []);

  return { trackClick };
};

// Pre-defined button names for consistency
export const TRACKED_BUTTONS = {
  // Navigation
  NAV_DASHBOARD: 'Navigation: Dashboard',
  NAV_TABLES: 'Navigation: Tables',
  NAV_ORDERS: 'Navigation: Commandes',
  NAV_INVOICES: 'Navigation: Factures',
  NAV_INVENTORY: 'Navigation: Inventaire',
  NAV_ACCOUNTING: 'Navigation: Comptabilité',
  NAV_MENU: 'Navigation: Menu',
  NAV_TEAM: 'Navigation: Équipe',
  NAV_SETTINGS: 'Navigation: Paramètres',
  NAV_STATS: 'Navigation: Statistiques',
  NAV_REPORTS: 'Navigation: Rapports',
  NAV_QR: 'Navigation: QR Codes',
  NAV_RESERVATIONS: 'Navigation: Réservations',
  NAV_CLIENTS: 'Navigation: Clients',
  NAV_DEBTORS: 'Navigation: Débiteurs',
  
  // Tables actions
  TABLE_OPEN_SESSION: 'Tables: Ouvrir session',
  TABLE_CLOSE_SESSION: 'Tables: Fermer session',
  TABLE_MARK_PAID: 'Tables: Marquer payé',
  TABLE_ADD_ORDER: 'Tables: Ajouter commande',
  TABLE_REOPEN: 'Tables: Réouvrir table',
  TABLE_RENAME: 'Tables: Renommer table',
  
  // Orders actions
  ORDER_CREATE: 'Commandes: Créer',
  ORDER_EDIT: 'Commandes: Modifier',
  ORDER_DELETE: 'Commandes: Supprimer',
  ORDER_STATUS_CHANGE: 'Commandes: Changer statut',
  
  // Invoices actions
  INVOICE_CREATE: 'Factures: Créer',
  INVOICE_PRINT: 'Factures: Imprimer',
  INVOICE_MARK_PAID: 'Factures: Marquer payée',
  INVOICE_EXPORT: 'Factures: Exporter',
  
  // Inventory actions
  INVENTORY_ADD_ITEM: 'Inventaire: Ajouter article',
  INVENTORY_ADJUST: 'Inventaire: Ajuster stock',
  INVENTORY_LOSS: 'Inventaire: Enregistrer perte',
  
  // Accounting actions
  ACCOUNTING_NEW_TRANSACTION: 'Comptabilité: Nouvelle transaction',
  ACCOUNTING_EXPORT: 'Comptabilité: Exporter',
  ACCOUNTING_FILTER: 'Comptabilité: Filtrer',
  
  // Menu actions
  MENU_ADD_ITEM: 'Menu: Ajouter plat',
  MENU_EDIT_ITEM: 'Menu: Modifier plat',
  MENU_DELETE_ITEM: 'Menu: Supprimer plat',
  MENU_ADD_CATEGORY: 'Menu: Ajouter catégorie',
  
  // Team actions
  TEAM_INVITE: 'Équipe: Inviter membre',
  TEAM_REMOVE: 'Équipe: Retirer membre',
  
  // Payment methods
  PAYMENT_CASH: 'Paiement: Espèces',
  PAYMENT_CARD: 'Paiement: Carte',
  PAYMENT_TRANSFER: 'Paiement: Virement',
  PAYMENT_MOBILE: 'Paiement: Mobile Money',
  PAYMENT_DEBTOR: 'Paiement: Débiteur',
  PAYMENT_MULTIPLE: 'Paiement: Multiple',
  
  // Other
  SIDEBAR_TOGGLE: 'Sidebar: Toggle',
  LOGOUT: 'Déconnexion',
  PRINT: 'Imprimer',
} as const;
