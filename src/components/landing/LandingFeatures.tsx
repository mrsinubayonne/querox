
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Menu, 
  Calendar, 
  Package, 
  BarChart3, 
  Users, 
  CreditCard,
  QrCode,
  Share2 
} from "lucide-react";

const features = [
  {
    icon: Menu,
    title: "Gestion des Menus",
    description: "Créez et modifiez vos menus facilement avec notre interface intuitive."
  },
  {
    icon: Calendar,
    title: "Réservations",
    description: "Gérez toutes vos réservations en temps réel et optimisez votre planning."
  },
  {
    icon: Package,
    title: "Inventaire",
    description: "Suivez vos stocks et approvisionnements pour éviter les ruptures."
  },
  {
    icon: BarChart3,
    title: "Statistiques",
    description: "Analysez vos performances avec des rapports détaillés et insights."
  },
  {
    icon: Users,
    title: "Gestion Clients",
    description: "Centralisez vos données clients et fidélisez votre clientèle."
  },
  {
    icon: CreditCard,
    title: "Comptabilité",
    description: "Suivez vos finances et générez vos rapports comptables automatiquement."
  },
  {
    icon: QrCode,
    title: "QR Codes",
    description: "Créez des menus numériques avec des QR codes pour vos tables."
  },
  {
    icon: Share2,
    title: "Marketing & Social",
    description: "Développez votre présence en ligne et lancez des campagnes marketing."
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Une solution complète pour gérer tous les aspects de votre restaurant
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
