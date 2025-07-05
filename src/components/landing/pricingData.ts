
export const plans = [
  {
    name: "Starter",
    price: "29€",
    period: "/mois",
    description: "Parfait pour débuter avec les fonctionnalités essentielles",
    features: [
      "Menu numérique avec QR Code",
      "Jusqu'à 50 plats",
      "Gestion des commandes de base",
      "Support par email",
      "1 utilisateur"
    ],
    highlighted: false,
    trialText: "3 jours gratuits",
    cta: "Commencer l'essai gratuit"
  },
  {
    name: "Professionnel",
    price: "79€",
    period: "/mois",
    description: "La solution complète pour restaurants établis",
    features: [
      "Tout du plan Starter",
      "Menus illimités",
      "Gestion avancée des commandes",
      "Statistiques détaillées",
      "Gestion des réservations",
      "Support prioritaire 24/7",
      "5 utilisateurs inclus",
      "Sauvegarde automatique"
    ],
    highlighted: true,
    trialText: "3 jours gratuits",
    cta: "Commencer l'essai gratuit",
    badge: "Le plus populaire"
  },
  {
    name: "Entreprise",
    price: "149€",
    period: "/mois",
    description: "Pour les chaînes et restaurants multi-sites",
    features: [
      "Tout du plan Professionnel",
      "Multi-restaurants",
      "API complète",
      "Intégrations personnalisées",
      "Formation personnalisée",
      "Gestionnaire de compte dédié",
      "Utilisateurs illimités",
      "SLA garanti 99.9%"
    ],
    highlighted: false,
    trialText: "3 jours gratuits + Demo personnalisée",
    cta: "Demander une démo"
  }
];

export const featureComparison = [
  {
    feature: "Menu numérique QR Code",
    starter: true,
    pro: true,
    enterprise: true
  },
  {
    feature: "Nombre de plats",
    starter: "50",
    pro: "Illimité",
    enterprise: "Illimité"
  },
  {
    feature: "Gestion des commandes",
    starter: "Basique",
    pro: "Avancée",
    enterprise: "Complète"
  },
  {
    feature: "Statistiques et rapports",
    starter: "Basiques",
    pro: "Détaillées",
    enterprise: "Avancées + Export"
  },
  {
    feature: "Gestion des réservations",
    starter: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Multi-restaurants",
    starter: false,
    pro: false,
    enterprise: true
  },
  {
    feature: "Support client",
    starter: "Email",
    pro: "24/7 Prioritaire",
    enterprise: "Gestionnaire dédié"
  },
  {
    feature: "Nombre d'utilisateurs",
    starter: "1",
    pro: "5",
    enterprise: "Illimité"
  },
  {
    feature: "API et intégrations",
    starter: false,
    pro: "API limitée",
    enterprise: "API complète"
  },
  {
    feature: "Essai gratuit",
    starter: "3 jours",
    pro: "3 jours",
    enterprise: "3 jours + Démo"
  }
];
