
export const plans = [
  {
    name: "Starter",
    price: "35 000",
    period: "FCFA/mois",
    originalPrice: "49 000",
    annualPrice: "370 000",
    annualPeriod: "FCFA/an",
    originalAnnualPrice: "600 000",
    description: "Parfait pour débuter avec les fonctionnalités essentielles",
    spotsLeft: 12,
    maxOutlets: 1,
    features: [
      "1 point de vente",
      "Site web basique (vitrine + menu)",
      "Menu digital QR code (commandes sur place)",
      "Gestion des réservations simple",
      "Statistiques basiques (commandes + plats les plus vendus)",
      "Comptabilité automatisée (entrées/sorties simples)",
      "1 compte administrateur + 2 employés"
    ],
    popular: false,
    cta: "Commencer maintenant",
    tier: "starter"
  },
  {
    name: "Professionnel",
    price: "65 000",
    period: "FCFA/mois",
    originalPrice: "89 000",
    annualPrice: "680 000",
    annualPeriod: "FCFA/an",
    originalAnnualPrice: "1 080 000",
    description: "Idéal pour les restaurants en croissance",
    spotsLeft: 4,
    maxOutlets: 2,
    features: [
      "2 points de vente inclus",
      "Site web avancé (design pro + SEO basique)",
      "Menu digital QR code (commandes en salle ET en ligne, livraison & click&collect)",
      "Fidélisation clients (CRM + base de données clients)",
      "Statistiques avancées (ventes par période, plats rentables, suivi tendances)",
      "Gestion avancée des stocks (historique, pertes, marges)",
      "Contrôle multi-utilisateurs (gérants, managers, employés)",
      "Programme de fidélité clients (points, coupons)",
      "Support prioritaire",
      "3 affiches & flyers promotionnels gratuits par mois",
      "Accès aux services marketing avec 30% de réduction"
    ],
    popular: true,
    cta: "Commencer maintenant",
    tier: "premium"
  },
  {
    name: "Entreprise",
    price: "91 000",
    period: "FCFA/mois",
    originalPrice: "127 000",
    annualPrice: "955 000",
    annualPeriod: "FCFA/an",
    originalAnnualPrice: "1 560 000",
    description: "Pour les chaînes et grandes structures",
    spotsLeft: 7,
    maxOutlets: 3,
    features: [
      "3 points de vente inclus",
      "Tout le Plan Pro",
      "Notifications temps réel sur mobile (vols, pertes, ruptures, pics de commandes)",
      "Reporting financier complet (profit net, marges, comparatifs mensuels)",
      "Gestion RH (pointages, performances du personnel)",
      "Système de réservation en ligne intégré",
      "Tableau de bord analytique (plats rentables, pics horaires, etc.)",
      "Accès aux experts avec 60% de réduction",
      "Consulting personnalisé mensuel avec nos experts SaaS",
      "Accès VIP à la communauté Querox (workshops, événements privés)",
      "Sécurité renforcée + sauvegarde cloud illimitée"
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
