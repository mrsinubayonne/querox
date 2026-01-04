
// Limites par plan d'abonnement
export const PLAN_LIMITS = {
  starter: { tables: 12, employees: 2, categories: 8, outlets: 1, menuItems: 50 },
  pro: { tables: Infinity, employees: 10, categories: Infinity, outlets: 2, menuItems: Infinity },
  enterprise: { tables: Infinity, employees: Infinity, categories: Infinity, outlets: 3, menuItems: Infinity },
  licence: { tables: Infinity, employees: Infinity, categories: Infinity, outlets: Infinity, menuItems: Infinity }
};

export const plans = [
  {
    name: "Starter",
    price: "35 000",
    period: "FCFA/mois",
    annualPrice: "370 000",
    annualPeriod: "FCFA/an",
    description: "Version Lite - Parfait pour débuter",
    spotsLeft: 12,
    maxOutlets: 1,
    features: [
      "1 point de vente",
      "Menu digital QR code (commandes sur place)",
      "Jusqu'à 8 catégories de plats",
      "Jusqu'à 12 tables",
      "1 administrateur + 2 employés max",
      "Gestion des réservations simple",
      "Factures simples",
      "Statistiques basiques (commandes du jour)"
    ],
    popular: false,
    cta: "Commencer maintenant",
    tier: "starter"
  },
  {
    name: "Professionnel",
    price: "65 000",
    period: "FCFA/mois",
    annualPrice: "680 000",
    annualPeriod: "FCFA/an",
    description: "Idéal pour les restaurants en croissance",
    spotsLeft: 4,
    maxOutlets: 2,
    features: [
      "2 points de vente inclus",
      "Site web avancé (design pro + SEO basique)",
      "Menu digital QR code (commandes en salle ET en ligne, livraison & click&collect)",
      "Catégories et plats illimités",
      "Jusqu'à 10 membres d'équipe",
      "Tables illimitées",
      "Fidélisation clients (CRM + base de données clients)",
      "Statistiques avancées (ventes par période, plats rentables, suivi tendances)",
      "Gestion avancée des stocks (historique, pertes, marges)",
      "Comptabilité complète (entrées/sorties, rapports)",
      "Programme de fidélité clients (points, coupons)",
      "Support prioritaire",
      "3 affiches & flyers promotionnels gratuits par mois",
      "Accès aux services marketing avec 30% de réduction"
    ],
    popular: true,
    cta: "Commencer maintenant",
    tier: "pro"
  },
  {
    name: "Entreprise",
    price: "91 000",
    period: "FCFA/mois",
    annualPrice: "955 000",
    annualPeriod: "FCFA/an",
    description: "Pour les chaînes et grandes structures",
    spotsLeft: 7,
    maxOutlets: 3,
    features: [
      "3 points de vente inclus",
      "Tout le Plan Pro",
      "Membres d'équipe illimités",
      "Notifications temps réel sur mobile (vols, pertes, ruptures, pics de commandes)",
      "Reporting financier complet (profit net, marges, comparatifs mensuels)",
      "Gestion RH (pointages, performances du personnel)",
      "Système de réservation en ligne intégré",
      "Tableau de bord analytique (plats rentables, pics horaires, etc.)",
      "Gestion des débiteurs avancée",
      "Accès aux experts avec 60% de réduction",
      "Consulting personnalisé mensuel avec nos experts SaaS",
      "Accès VIP à la communauté Querox (workshops, événements privés)",
      "Sécurité renforcée + sauvegarde cloud illimitée"
    ],
    popular: false,
    cta: "Commencer maintenant",
    tier: "enterprise"
  },
  {
    name: "LICENCE QUEROX",
    price: "Sur devis",
    period: "",
    description: "Solution personnalisée sans abonnement mensuel",
    features: [
      "Licence perpétuelle",
      "Installation sur vos serveurs",
      "Personnalisation complète",
      "Formation dédiée",
      "Support technique inclus",
      "Pas d'abonnement mensuel"
    ],
    popular: false,
    cta: "Contacter sur WhatsApp",
    tier: "licence",
    isWhatsApp: true,
    whatsappNumber: "+242064563021"
  }
];

export const featureComparison = [
  {
    feature: "Menu numérique interactif",
    starter: true,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "QR Code personnalisé",
    starter: true,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Gestion des commandes",
    starter: "Sur place",
    pro: "Sur place + Livraison",
    enterprise: "Sur place + Livraison",
    licence: "Illimité"
  },
  {
    feature: "Catégories de plats",
    starter: "8 max",
    pro: "Illimitées",
    enterprise: "Illimitées",
    licence: "Illimitées"
  },
  {
    feature: "Gestion des tables",
    starter: "12 max",
    pro: "Illimitées",
    enterprise: "Illimitées",
    licence: "Illimitées"
  },
  {
    feature: "Membres d'équipe",
    starter: "2 max",
    pro: "10 max",
    enterprise: "Illimités",
    licence: "Illimités"
  },
  {
    feature: "Points de vente",
    starter: "1",
    pro: "2",
    enterprise: "3+",
    licence: "Illimités"
  },
  {
    feature: "Gestion des stocks",
    starter: false,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Comptabilité",
    starter: false,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Statistiques avancées",
    starter: false,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Site web personnalisé",
    starter: false,
    pro: "Basique",
    enterprise: "Avancé",
    licence: true
  },
  {
    feature: "CRM / Fidélisation clients",
    starter: false,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Gestion des débiteurs",
    starter: false,
    pro: "Basique",
    enterprise: "Avancée",
    licence: true
  },
  {
    feature: "Rapports journaliers",
    starter: false,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Performance du personnel",
    starter: false,
    pro: false,
    enterprise: true,
    licence: true
  },
  {
    feature: "Notifications temps réel",
    starter: false,
    pro: false,
    enterprise: true,
    licence: true
  },
  {
    feature: "API personnalisée",
    starter: false,
    pro: false,
    enterprise: true,
    licence: true
  },
  {
    feature: "Support",
    starter: "Email",
    pro: "Prioritaire",
    enterprise: "Dédié 24/7",
    licence: "Technique inclus"
  }
];
