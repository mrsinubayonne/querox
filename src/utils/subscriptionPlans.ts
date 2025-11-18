/**
 * Utilitaires pour la gestion des plans d'abonnement
 * Ce fichier centralise toutes les informations sur les plans
 */

export type SubscriptionTier = 'starter' | 'premium' | 'pro' | 'business' | 'licence' | 'admin';

export interface PlanLimits {
  outlets: number;
  profiles: number;
  teamMembers: number;
}

export interface PlanInfo {
  id: SubscriptionTier;
  displayName: string;
  price: number;
  limits: PlanLimits;
  color: string;
  badgeClass: string;
}

// Configuration centralisée des plans
export const PLANS: Record<SubscriptionTier, PlanInfo> = {
  starter: {
    id: 'starter',
    displayName: 'Starter',
    price: 59,
    limits: {
      outlets: 1,
      profiles: 2,
      teamMembers: 3,
    },
    color: 'from-blue-600 to-blue-700',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  premium: {
    id: 'premium',
    displayName: 'Professionnel',
    price: 99,
    limits: {
      outlets: 2,
      profiles: 5,
      teamMembers: 10,
    },
    color: 'from-purple-600 to-purple-700',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  pro: {
    id: 'pro',
    displayName: 'Entreprise',
    price: 139,
    limits: {
      outlets: 3,
      profiles: 10,
      teamMembers: 50,
    },
    color: 'from-orange-600 to-orange-700',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
  business: {
    id: 'business',
    displayName: 'Business',
    price: 0, // Sur devis
    limits: {
      outlets: 5,
      profiles: 15,
      teamMembers: 100,
    },
    color: 'from-green-600 to-green-700',
    badgeClass: 'bg-green-100 text-green-800',
  },
  licence: {
    id: 'licence',
    displayName: 'Licence Querox',
    price: 0, // Sur devis
    limits: {
      outlets: 999,
      profiles: 999,
      teamMembers: 999,
    },
    color: 'from-yellow-600 to-yellow-700',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  admin: {
    id: 'admin',
    displayName: 'Admin',
    price: 0,
    limits: {
      outlets: 999,
      profiles: 999,
      teamMembers: 999,
    },
    color: 'from-red-600 to-red-700',
    badgeClass: 'bg-red-100 text-red-800',
  },
};

/**
 * Obtenir le nom commercial d'un plan à partir de son identifiant technique
 */
export function getPlanDisplayName(tier: string | null | undefined): string {
  if (!tier) return 'Starter';
  const plan = PLANS[tier as SubscriptionTier];
  return plan?.displayName || tier;
}

/**
 * Obtenir les informations complètes d'un plan
 */
export function getPlanInfo(tier: string | null | undefined): PlanInfo {
  if (!tier) return PLANS.starter;
  return PLANS[tier as SubscriptionTier] || PLANS.starter;
}

/**
 * Obtenir les limites d'un plan
 */
export function getPlanLimits(tier: string | null | undefined): PlanLimits {
  return getPlanInfo(tier).limits;
}

/**
 * Obtenir la classe CSS du badge d'un plan
 */
export function getPlanBadgeClass(tier: string | null | undefined): string {
  return getPlanInfo(tier).badgeClass;
}

/**
 * Obtenir les couleurs du gradient d'un plan
 */
export function getPlanColor(tier: string | null | undefined): string {
  return getPlanInfo(tier).color;
}

/**
 * Obtenir le plan suivant (pour les suggestions d'upgrade)
 */
export function getNextPlan(tier: string | null | undefined): PlanInfo | null {
  const planOrder: SubscriptionTier[] = ['starter', 'premium', 'pro', 'licence'];
  const currentIndex = planOrder.indexOf((tier || 'starter') as SubscriptionTier);
  
  if (currentIndex === -1 || currentIndex >= planOrder.length - 1) {
    return null;
  }
  
  return PLANS[planOrder[currentIndex + 1]];
}
