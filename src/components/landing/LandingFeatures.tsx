
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
  Share2,
  Clock,
  TrendingUp,
  Shield,
  Smartphone
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Menus QR Instantanés",
    description: "Créez des menus numériques avec QR codes en 2 minutes. Vos clients scannent et commandent directement.",
    highlight: "+40% de commandes"
  },
  {
    icon: Smartphone,
    title: "Commandes Mobiles",
    description: "Interface optimisée mobile pour que vos clients commandent facilement depuis leur téléphone.",
    highlight: "Sans app à télécharger"
  },
  {
    icon: BarChart3,
    title: "Analytics Puissants",
    description: "Suivez vos ventes, plats populaires et heures de pointe avec des rapports détaillés en temps réel.",
    highlight: "Données en temps réel"
  },
  {
    icon: TrendingUp,
    title: "Boost du Chiffre d'Affaires",
    description: "Nos clients augmentent leur CA de 35% en moyenne grâce à une gestion optimisée.",
    highlight: "+35% de CA moyen"
  },
  {
    icon: Calendar,
    title: "Réservations Intelligentes",
    description: "Gérez toutes vos réservations automatiquement avec confirmations par SMS et email.",
    highlight: "Automatisation complète"
  },
  {
    icon: Users,
    title: "Fidélisation Client",
    description: "Base de données clients intégrée avec historique des commandes et campagnes marketing ciblées.",
    highlight: "Rétention +60%"
  },
  {
    icon: Clock,
    title: "Gain de Temps",
    description: "Automatisez votre gestion quotidienne et économisez 3h par jour sur les tâches administratives.",
    highlight: "3h économisées/jour"
  },
  {
    icon: Shield,
    title: "Sécurité Garantie",
    description: "Données sécurisées, paiements protégés et sauvegarde automatique pour une tranquillité totale.",
    highlight: "Sécurité bancaire"
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Une solution qui transforme vraiment votre business
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Découvrez pourquoi <strong>1,500+ restaurateurs</strong> ont choisi QUEROX pour révolutionner leur restaurant
          </p>
          <div className="mt-6 flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Configuration en 5 min</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Support 24/7</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>ROI garanti</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-white">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Badge de highlight */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {feature.highlight}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section témoignage */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div className="text-center">
            <blockquote className="text-2xl font-medium text-gray-900 mb-6">
              "QUEROX a complètement transformé notre restaurant. En 2 mois, nous avons augmenté notre chiffre d'affaires de 40% et nos clients adorent commander via QR code. L'équipe support est fantastique !"
            </blockquote>
            <div className="flex items-center justify-center">
              <img 
                className="w-12 h-12 rounded-full mr-4"
                src="https://images.unsplash.com/photo-1494790108755-2616b612b641?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                alt="Marie Laurent"
              />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Marie Laurent</div>
                <div className="text-gray-600 text-sm">Propriétaire - Restaurant Le Bistrot Moderne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
