import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "20 000",
    period: "FCFA/mois",
    description: "Parfait pour les petits restaurants",
    badge: null,
    availablePlaces: 46,
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
    availablePlaces: 27,
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

const featureComparison = [
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

const LandingPricing: React.FC = () => {
  const getPlacesBadgeColor = (places: number) => {
    if (places <= 10) return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0";
    if (places <= 30) return "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0";
    return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0";
  };

  const renderFeatureValue = (value: any) => {
    if (value === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-red-500 mx-auto" />;
    return <span className="text-sm text-gray-700">{value}</span>;
  };

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
                
                {/* Places disponibles avec couleurs attractives */}
                <div className="mt-3">
                  <Badge 
                    className={getPlacesBadgeColor(plan.availablePlaces)}
                  >
                    {plan.availablePlaces} places disponibles
                  </Badge>
                  {plan.closingSoon && (
                    <div className="mt-2">
                      <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs animate-pulse">
                        URGENT
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

        {/* Tableau comparatif */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Comparaison détaillée des fonctionnalités
          </h3>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Fonctionnalités
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-primary/10">
                      Professionnel
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Enterprise VIP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {featureComparison.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderFeatureValue(item.starter)}
                      </td>
                      <td className="px-6 py-4 text-center bg-primary/5">
                        {renderFeatureValue(item.pro)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderFeatureValue(item.enterprise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
