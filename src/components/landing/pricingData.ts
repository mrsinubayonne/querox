
export const plans = [
  {
    name: "Starter",
    price: "20 000",
    period: "FCFA/mois",
    description: "Parfait pour débuter avec les fonctionnalités essentielles",
    features: [
      "Menu numérique interactif",
      "QR Code personnalisé",
      "Gestion des commandes",
      "5 catégories de plats",
      "Support email"
    ],
    popular: false,
    cta: "Choisir Starter",
    tier: "starter"
  },
  {
    name: "Professionnel",
    price: "35 000",
    period: "FCFA/mois",
    description: "Idéal pour les restaurants en croissance",
    features: [
      "Toutes les fonctionnalités Starter",
      "Catégories illimitées",
      "Gestion des stocks",
      "Statistiques avancées",
      "Site web personnalisé",
      "Support prioritaire"
    ],
    popular: true,
    cta: "Choisir Pro",
    tier: "premium"
  },
  {
    name: "Entreprise",
    price: "40 000",
    period: "FCFA/mois",
    description: "Pour les chaînes et grandes structures",
    features: [
      "Toutes les fonctionnalités Pro",
      "Multi-établissements",
      "API personnalisée",
      "Intégrations avancées",
      "Formations personnalisées",
      "Support dédié 24/7"
    ],
    popular: false,
    cta: "Choisir Entreprise",
    tier: "pro"
  }
];

export const featureComparison = [
  {
    feature: "Menu numérique interactif",
    starter: true,
    pro: true,
    enterprise: true
  },
  {
    feature: "QR Code personnalisé",
    starter: true,
    pro: true,
    enterprise: true
  },
  {
    feature: "Gestion des commandes",
    starter: true,
    pro: true,
    enterprise: true
  },
  {
    feature: "Catégories de plats",
    starter: "5 max",
    pro: "Illimitées",
    enterprise: "Illimitées"
  },
  {
    feature: "Gestion des stocks",
    starter: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Statistiques avancées",
    starter: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Site web personnalisé",
    starter: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Multi-établissements",
    starter: false,
    pro: false,
    enterprise: true
  },
  {
    feature: "API personnalisée",
    starter: false,
    pro: false,
    enterprise: true
  },
  {
    feature: "Support",
    starter: "Email",
    pro: "Prioritaire",
    enterprise: "Dédié 24/7"
  }
];
