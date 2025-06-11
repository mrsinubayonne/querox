
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "20 000",
    period: "FCFA/mois",
    description: "Parfait pour les petits restaurants",
    badge: null,
    availablePlaces: 83,
    closingSoon: false,
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
    badge: "Plus populaire",
    availablePlaces: 28,
    closingSoon: false,
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
    badge: null,
    availablePlaces: 4,
    closingSoon: true,
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

const LandingPricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choisissez votre plan
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Des tarifs transparents qui s'adaptent à la taille de votre restaurant
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.badge ? 'border-primary shadow-lg scale-105' : 'border-gray-200'} hover:shadow-xl transition-all duration-300`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-lg text-gray-600 ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">
                  {plan.description}
                </p>
                
                {/* Places disponibles */}
                <div className="mt-3">
                  <Badge 
                    variant="outline" 
                    className={`${plan.availablePlaces <= 10 ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}`}
                  >
                    {plan.availablePlaces} places disponibles
                  </Badge>
                  {plan.closingSoon && (
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-xs">
                        Bientôt clôturé
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.badge ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.badge ? 'default' : 'outline'}
                  size="lg"
                >
                  Commencer maintenant
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Tous nos plans incluent un essai gratuit de 14 jours
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Aucune carte bancaire requise • Annulation à tout moment
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
