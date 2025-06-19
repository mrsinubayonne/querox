
export const plans = [
  {
    name: "Starter",
    price: "10 000",
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
    cta: "Commencer",
    tier: "starter"
  },
  {
    name: "Professionnel",
    price: "20 000",
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
    price: "35 000",
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
    cta: "Contactez-nous",
    tier: "pro"
  }
];
