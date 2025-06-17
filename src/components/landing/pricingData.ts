
export const plans = [
  {
    name: "Starter",
    price: "20 000",
    period: "FCFA/mois",
    description: "Parfait pour les petits restaurants",
    cta: "Commencer",
    tier: "starter",
    popular: false,
    features: [
      "Gestion des menus",
      "Jusqu'à 50 réservations/mois",
      "Inventaire de base",
      "Support par email",
      "1 utilisateur"
    ]
  },
  {
    name: "Professionnel",
    price: "35 000",
    period: "FCFA/mois",
    description: "Idéal pour les restaurants en croissance",
    cta: "Choisir Pro",
    tier: "professional",
    popular: true,
    features: [
      "Toutes les fonctionnalités Starter",
      "Réservations illimitées",
      "Statistiques avancées",
      "Gestion des clients",
      "QR Codes",
      "3 utilisateurs",
      "Support prioritaire"
    ]
  },
  {
    name: "Enterprise VIP",
    price: "40 000",
    period: "FCFA/mois",
    description: "Pour les chaînes et grands restaurants",
    cta: "Devenir VIP",
    tier: "enterprise",
    popular: false,
    features: [
      "Toutes les fonctionnalités Pro",
      "Comptabilité complète",
      "Marketing & Social",
      "Multi-restaurants",
      "API access",
      "Utilisateurs illimités",
      "Support 24/7",
      "Formation personnalisée"
    ]
  }
];

export const featureComparison = [
  { feature: "Gestion des menus", starter: true, pro: true, enterprise: true },
  { feature: "Réservations", starter: "50/mois", pro: "Illimitées", enterprise: "Illimitées" },
  { feature: "Inventaire", starter: "Base", pro: "Avancé", enterprise: "Complet" },
  { feature: "Statistiques", starter: false, pro: true, enterprise: true },
  { feature: "QR Codes", starter: false, pro: true, enterprise: true },
  { feature: "Multi-restaurants", starter: false, pro: false, enterprise: true },
  { feature: "API access", starter: false, pro: false, enterprise: true },
  { feature: "Support 24/7", starter: false, pro: false, enterprise: true },
  { feature: "Formation", starter: false, pro: false, enterprise: true }
];

export type Plan = typeof plans[0];
export type FeatureComparison = typeof featureComparison[0];
