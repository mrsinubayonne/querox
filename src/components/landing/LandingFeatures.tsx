
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
  UserCheck,
  ChefHat,
  Clock,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";

const mainFeatures = [
  {
    icon: Menu,
    title: "Gestion des Menus",
    description: "Créez et modifiez vos menus facilement avec notre interface intuitive et moderne.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Calendar,
    title: "Réservations",
    description: "Gérez toutes vos réservations en temps réel et optimisez votre planning.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Package,
    title: "Inventaire Intelligent",
    description: "Suivez vos stocks automatiquement et évitez les ruptures avec des alertes intelligentes.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Avancés",
    description: "Analysez vos performances avec des rapports détaillés et des insights précieux.",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    icon: Users,
    title: "CRM Client",
    description: "Centralisez vos données clients et développez un programme de fidélisation efficace.",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: CreditCard,
    title: "Comptabilité",
    description: "Automatisez votre comptabilité et générez vos rapports financiers en un clic.",
    gradient: "from-teal-500 to-green-500"
  }
];

const premiumServices = [
  {
    icon: Globe,
    title: "Site Web Restaurant",
    description: "Site web professionnel livré en 1-3 jours, optimisé mobile et référencement.",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: Palette,
    title: "Conception Graphique",
    description: "Créations visuelles professionnelles : affiches, flyers, supports marketing.",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    icon: Share2,
    title: "Réseaux Sociaux",
    description: "Gestion complète de votre présence sociale et campagnes marketing ciblées.",
    gradient: "from-pink-500 to-red-500"
  },
  {
    icon: UserCheck,
    title: "Consulting Expert",
    description: "Conseils stratégiques personnalisés par nos experts restaurant (15+ ans d'expérience).",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Phone,
    title: "Service d'Appel",
    description: "Prise de commandes téléphoniques professionnelle par notre équipe dédiée.",
    gradient: "from-orange-500 to-amber-500"
  },
  {
    icon: QrCode,
    title: "QR Codes Dynamiques",
    description: "Menus numériques interactifs avec QR codes pour une expérience client moderne.",
    gradient: "from-gray-700 to-gray-500"
  }
];

const highlights = [
  {
    icon: Zap,
    title: "Rapide",
    description: "Configuration en moins de 5 minutes",
    color: "text-yellow-500"
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Données protégées et sauvegardées",
    color: "text-green-500"
  },
  {
    icon: Clock,
    title: "24/7",
    description: "Support client disponible",
    color: "text-blue-500"
  },
  {
    icon: ChefHat,
    title: "Expert",
    description: "Conçu par des professionnels",
    color: "text-purple-500"
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <>
      {/* Section Principales Fonctionnalités */}
      <section id="features" className="py-12 sm:py-20 lg:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary))_0.03,transparent)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-sm sm:text-lg font-semibold mb-4">
              FONCTIONNALITÉS PRINCIPALES
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 sm:mb-6 leading-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Une plateforme complète et intuitive pour gérer tous les aspects de votre restaurant,
              de la cuisine au service client.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="group border-border bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-2 sm:mb-3 group-hover:text-muted-foreground transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section Highlights */}
          <div className="bg-gradient-to-r from-muted/50 via-primary/5 to-purple-50/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 ${highlight.color}`}>
                    <highlight.icon className="w-full h-full" />
                  </div>
                  <h4 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{highlight.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Services Premium */}
      <section className="py-12 sm:py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary))_0.03,transparent)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-sm sm:text-lg font-semibold mb-4">
              SERVICES PREMIUM
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 sm:mb-6 leading-tight">
              Allez plus loin avec nos experts
            </h2>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Nos services professionnels vous accompagnent pour développer votre restaurant
              et maximiser votre succès.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {premiumServices.map((service, index) => (
              <Card key={index} className="group border-border bg-card shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${service.gradient} opacity-10 rounded-bl-2xl`}></div>
                <CardContent className="p-6 sm:p-8 relative">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-2 sm:mb-3 group-hover:text-muted-foreground transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    {service.description}
                  </p>
                  <div className="mt-4 sm:mt-6">
                    <div className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80">
                      En savoir plus
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingFeatures;
