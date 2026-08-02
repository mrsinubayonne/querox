
// Limites par plan d'abonnement
export const PLAN_LIMITS = {
  pro: { tables: Infinity, employees: 10, categories: Infinity, outlets: 2, menuItems: Infinity },
  business: { tables: Infinity, employees: Infinity, categories: Infinity, outlets: 3, menuItems: Infinity },
  max: { tables: Infinity, employees: Infinity, categories: Infinity, outlets: Infinity, menuItems: Infinity },
  // Alias historique (anciens abonnements enregistrés en base)
  enterprise: { tables: Infinity, employees: Infinity, categories: Infinity, outlets: 3, menuItems: Infinity },
  licence: { tables: Infinity, employees: Infinity, categories: Infinity, outlets: Infinity, menuItems: Infinity }
};

export const plans = [
  {
    name: "Pro",
    price: "65 000",
    period: "FCFA/mois",
    annualPrice: "680 000",
    annualPeriod: "FCFA/an",
    description: "Idéal pour les restaurants en croissance",
    spotsLeft: 4,
    maxOutlets: 2,
    features: [
      "2 points de vente inclus",
      "Menu digital QR code (commandes en salle ET en ligne, livraison & click&collect)",
      "Catégories et plats illimités",
      "Jusqu'à 10 membres d'équipe",
      "Tables illimitées",
      "Fidélisation clients (CRM + base de données clients)",
      "Statistiques avancées (ventes par période, plats rentables, suivi tendances)",
      "Gestion avancée des stocks (historique, pertes, marges)",
      "Comptabilité complète (entrées/sorties, rapports)",
      "Programme de fidélité clients (points, coupons)",
      "Support prioritaire"
    ],
    popular: true,
    cta: "Commencer maintenant",
    tier: "pro"
  },
  {
    name: "Business",
    price: "101 000",
    period: "FCFA/mois",
    annualPrice: "1 060 000",
    annualPeriod: "FCFA/an",
    description: "Pour les chaînes et grandes structures",
    spotsLeft: 7,
    maxOutlets: 3,
    features: [
      "3 points de vente inclus",
      "Tout le Plan Pro",
      "Membres d'équipe illimités",
      "Notifications temps réel (pertes, ruptures, pics de commandes)",
      "Reporting financier complet (profit net, marges, comparatifs mensuels)",
      "Système de réservation en ligne intégré",
      "Tableau de bord analytique (plats rentables, pics horaires, etc.)",
      "Gestion des débiteurs avancée",
      "Consulting personnalisé mensuel avec nos experts SaaS",
      "Sécurité renforcée + sauvegarde cloud illimitée"
    ],
    popular: false,
    cta: "Commencer maintenant",
    tier: "business"
  },
  {
    name: "Max",
    price: "120 000",
    period: "FCFA/mois",
    annualPrice: "1 260 000",
    annualPeriod: "FCFA/an",
    description: "Sans aucune limite, pour les groupes multi-sites",
    spotsLeft: 3,
    maxOutlets: Infinity,
    features: [
      "Points de vente illimités",
      "Tout le Plan Business",
      "Membres d'équipe illimités",
      "Accompagnement dédié et prioritaire",
      "Rapports consolidés multi-établissements",
      "Support dédié 24/7"
    ],
    popular: false,
    cta: "Commencer maintenant",
    tier: "max"
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
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "QR Code personnalisé",
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "Gestion des commandes",
    pro: "Sur place + Livraison",
    business: "Sur place + Livraison",
    max: "Illimité",
    licence: "Illimité"
  },
  {
    feature: "Catégories de plats",
    pro: "Illimitées",
    business: "Illimitées",
    max: "Illimitées",
    licence: "Illimitées"
  },
  {
    feature: "Gestion des tables",
    pro: "Illimitées",
    business: "Illimitées",
    max: "Illimitées",
    licence: "Illimitées"
  },
  {
    feature: "Membres d'équipe",
    pro: "10 max",
    business: "Illimités",
    max: "Illimités",
    licence: "Illimités"
  },
  {
    feature: "Points de vente",
    pro: "2",
    business: "3",
    max: "Illimités",
    licence: "Illimités"
  },
  {
    feature: "Gestion des stocks",
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "Comptabilité",
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "Statistiques avancées",
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "CRM / Fidélisation clients",
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "Gestion des débiteurs",
    pro: "Basique",
    business: "Avancée",
    max: "Avancée",
    licence: true
  },
  {
    feature: "Rapports journaliers",
    pro: true,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "Notifications temps réel",
    pro: false,
    business: true,
    max: true,
    licence: true
  },
  {
    feature: "Rapports consolidés multi-sites",
    pro: false,
    business: false,
    max: true,
    licence: true
  },
  {
    feature: "Support",
    pro: "Prioritaire",
    business: "Dédié 24/7",
    max: "Dédié 24/7",
    licence: "Technique inclus"
  }
];
