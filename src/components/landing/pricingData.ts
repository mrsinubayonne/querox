
export const plans = [
  {
    name: "Starter",
    price: "35 000",
    period: "FCFA/mois",
    annualPrice: "350 000",
    annualPeriod: "FCFA/an",
    description: "Parfait pour débuter avec les fonctionnalités essentielles",
    features: [
      "Menu numérique interactif",
      "QR Code personnalisé",
      "Gestion des commandes",
      "5 catégories de plats",
      "Support email"
    ],
    popular: false,
    cta: "Commencer maintenant",
    tier: "starter"
  },
  {
    name: "Professionnel",
    price: "60 000",
    period: "FCFA/mois",
    annualPrice: "600 000",
    annualPeriod: "FCFA/an",
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
    cta: "Commencer maintenant",
    tier: "premium"
  },
  {
    name: "Entreprise",
    price: "75 000",
    period: "FCFA/mois",
    annualPrice: "750 000",
    annualPeriod: "FCFA/an",
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
    cta: "Commencer maintenant",
    tier: "pro"
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
    starter: true,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Catégories de plats",
    starter: "5 max",
    pro: "Illimitées",
    enterprise: "Illimitées",
    licence: "Illimitées"
  },
  {
    feature: "Gestion des stocks",
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
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Multi-établissements",
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
