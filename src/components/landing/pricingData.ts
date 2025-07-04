
export const plans = [
  {
    name: "Starter",
    price: "2,500 FCFA",
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
    price: "7,500 FCFA",
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
    price: "15,000 FCFA",
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
  },
  {
    name: "LICENCE QUEROX",
    price: "Sur devis",
    period: "",
    description: "Solution sur-mesure avec licence complète",
    features: [
      "Code source complet",
      "Installation sur vos serveurs",
      "Personnalisation illimitée",
      "Formation équipe technique",
      "Support technique premium",
      "Mises à jour incluses 1 an",
      "Nom de domaine personnalisé",
      "Marque blanche complète"
    ],
    highlighted: false,
    trialText: "Consultation gratuite",
    cta: "Nous contacter"
  }
];

export const featureComparison = [
  {
    feature: "Menu numérique QR Code",
    starter: true,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Nombre de plats",
    starter: "50",
    pro: "Illimité",
    enterprise: "Illimité",
    licence: "Illimité"
  },
  {
    feature: "Gestion des commandes",
    starter: "Basique",
    pro: "Avancée",
    enterprise: "Complète",
    licence: "Complète"
  },
  {
    feature: "Statistiques et rapports",
    starter: "Basiques",
    pro: "Détaillées",
    enterprise: "Avancées + Export",
    licence: "Personnalisées"
  },
  {
    feature: "Gestion des réservations",
    starter: false,
    pro: true,
    enterprise: true,
    licence: true
  },
  {
    feature: "Multi-restaurants",
    starter: false,
    pro: false,
    enterprise: true,
    licence: true
  },
  {
    feature: "Support client",
    starter: "Email",
    pro: "24/7 Prioritaire",
    enterprise: "Gestionnaire dédié",
    licence: "Premium technique"
  },
  {
    feature: "Nombre d'utilisateurs",
    starter: "1",
    pro: "5",
    enterprise: "Illimité",
    licence: "Illimité"
  },
  {
    feature: "API et intégrations",
    starter: false,
    pro: "API limitée",
    enterprise: "API complète",
    licence: "Code source"
  },
  {
    feature: "Essai gratuit",
    starter: "3 jours",
    pro: "3 jours",
    enterprise: "3 jours + Démo",
    licence: "Consultation"
  }
];
