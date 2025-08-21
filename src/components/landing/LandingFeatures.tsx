
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
  Globe,
  Phone,
  Palette,
  ShoppingCart,
  Settings,
  Shield,
  Zap,
  Headphones
} from "lucide-react";

const features = [
  {
    icon: Menu,
    title: "Gestion Complète des Menus",
    description: "Créez et modifiez vos menus facilement. Gérez les catégories, prix et disponibilités en temps réel.",
    color: "from-emerald-500 to-emerald-600"
  },
  {
    icon: QrCode,
    title: "Menus Numériques QR Code",
    description: "Générez des QR codes personnalisés pour vos tables. Vos clients accèdent au menu instantanément.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Globe,
    title: "Site Web Restaurant",
    description: "Créez votre site web professionnel en 1-3 jours. Design moderne, responsive et optimisé SEO.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: ShoppingCart,
    title: "Commandes en Ligne",
    description: "Permettez à vos clients de commander directement depuis votre menu numérique ou site web.",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Calendar,
    title: "Réservations Intelligentes",
    description: "Système de réservation intégré avec notifications automatiques et gestion des créneaux.",
    color: "from-rose-500 to-rose-600"
  },
  {
    icon: Package,
    title: "Gestion des Stocks",
    description: "Suivez vos inventaires, alertes de rupture et optimisez vos approvisionnements automatiquement.",
    color: "from-teal-500 to-teal-600"
  },
  {
    icon: BarChart3,
    title: "Analytics Avancées",
    description: "Tableaux de bord détaillés, rapports de ventes et insights pour optimiser votre business.",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: CreditCard,
    title: "Comptabilité Intégrée",
    description: "Suivi financier automatique, rapports comptables et gestion des transactions en temps réel.",
    color: "from-amber-500 to-amber-600"
  },
  {
    icon: Users,
    title: "Gestion Clientèle",
    description: "Base de données clients, programmes de fidélité et campagnes marketing personnalisées.",
    color: "from-cyan-500 to-cyan-600"
  },
  {
    icon: Share2,
    title: "Marketing Digital",
    description: "Outils de promotion, réseaux sociaux, campagnes publicitaires et conception graphique.",
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: Phone,
    title: "Service d'Appel",
    description: "Service de prise de commandes par téléphone géré par notre équipe professionnelle.",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Palette,
    title: "Conception Graphique",
    description: "Création de logos, menus imprimés, flyers et supports visuels personnalisés.",
    color: "from-violet-500 to-violet-600"
  },
  {
    icon: Settings,
    title: "Multi-établissements",
    description: "Gérez plusieurs restaurants depuis une seule interface avec des rôles personnalisés.",
    color: "from-slate-500 to-slate-600"
  },
  {
    icon: Shield,
    title: "Sécurité Avancée",
    description: "Protection des données, sauvegarde automatique et accès sécurisé avec authentification.",
    color: "from-red-500 to-red-600"
  },
  {
    icon: Zap,
    title: "Intégrations",
    description: "Connectez vos outils existants via notre API et automatisez vos processus métier.",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    icon: Headphones,
    title: "Support Dédié",
    description: "Équipe support francophone 24/7, formation personnalisée et accompagnement technique.",
    color: "from-emerald-500 to-teal-500"
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
            ✨ Plateforme Tout-en-Un
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
            Tout ce dont votre restaurant a besoin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Une solution complète qui révolutionne la gestion de votre restaurant. 
            De la création de menus à la comptabilité, tout est centralisé dans une interface moderne et intuitive.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white hover:-translate-y-2">
              <CardContent className="p-6">
                <div className={`w-14 h-14 mx-auto bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Prêt à transformer votre restaurant ?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Rejoignez plus de 1000+ restaurants qui font confiance à QUEROX pour optimiser leur gestion quotidienne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold">
                    +1k
                  </div>
                </div>
                <span>Restaurants satisfaits</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex text-yellow-400 mr-2">
                  {'★'.repeat(5)}
                </div>
                <span>4.9/5 - Satisfaction client</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
