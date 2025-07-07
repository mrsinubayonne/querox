
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Palette, 
  Mail, 
  Users, 
  Facebook,
  Star,
  CheckCircle,
  Rocket,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import ConceptionGraphiqueModal from '@/components/marketing/ConceptionGraphiqueModal';
import EmailMarketingModal from '@/components/marketing/EmailMarketingModal';
import ProgrammeFideliteModal from '@/components/marketing/ProgrammeFideliteModal';
import CampagnePublicitaireModal from '@/components/marketing/CampagnePublicitaireModal';
import { useIsMobile } from '@/hooks/use-mobile';

const Marketing: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const allServices = [
    {
      id: 'conception-graphique',
      title: 'Conception Graphique',
      description: 'Création d\'affiches, flyers et supports visuels professionnels pour attirer vos clients',
      icon: Palette,
      color: 'from-violet-600 via-purple-600 to-fuchsia-600',
      deliveryTime: '3 jours',
      price: 'Sur devis'
    },
    {
      id: 'email-marketing',
      title: 'Email Marketing',
      description: 'Campagnes d\'emails personnalisées et automatisées pour fidéliser et convertir',
      icon: Mail,
      color: 'from-cyan-500 via-blue-500 to-indigo-600',
      deliveryTime: '5 jours',
      price: 'Sur devis'
    },
    {
      id: 'programme-fidelite',
      title: 'Programme de Fidélité',
      description: 'Système complet de fidélisation avec récompenses et suivi client automatique',
      icon: Users,
      color: 'from-emerald-500 via-green-500 to-teal-600',
      deliveryTime: '7 jours',
      price: 'Sur devis'
    },
    {
      id: 'campagne-publicitaire',
      title: 'Campagne Publicitaire Facebook',
      description: 'Stratégie publicitaire complète sur Facebook et Instagram pour maximiser votre visibilité',
      icon: Facebook,
      color: 'from-blue-600 via-indigo-600 to-purple-600',
      deliveryTime: '10 jours',
      price: 'Sur devis'
    }
  ];

  const benefits = [
    {
      icon: Rocket,
      title: "Résultats Express",
      desc: "Solutions livrées sous 3 à 10 jours selon le service choisi.",
      color: "text-purple-600",
    },
    {
      icon: TrendingUp,
      title: "ROI Garanti",
      desc: "Augmentation moyenne de 45% du chiffre d'affaires client.",
      color: "text-blue-600",
    },
    {
      icon: Award,
      title: "Expertise Premium",
      desc: "Équipe de spécialistes marketing dédiée aux restaurants.",
      color: "text-green-600",
    }
  ];

  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <SubscriptionGuard feature="les outils marketing">
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl mx-auto text-center animate-fade-in">
              <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 mb-4">
                Services Premium
              </span>
              
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Megaphone className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Solutions <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">Marketing Pro</span>
                </h1>
              </div>
              
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                🚀 Boostez votre restaurant avec nos services marketing professionnels, conçus spécialement pour la restauration.
              </p>

              {/* Services Grid */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {allServices.map((service) => (
                  <MarketingServiceCard
                    key={service.id}
                    service={service}
                    onSelect={() => openModal(service.id)}
                  />
                ))}
              </div>

              {/* Benefits Section */}
              <div className="mt-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Pourquoi choisir nos services ?</h3>
                <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                  {benefits.map((benefit, idx) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                          <Icon size={24} className={benefit.color} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{benefit.title}</h4>
                          <p className="mt-1 text-gray-600">{benefit.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust Section */}
              <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg font-semibold">Approuvé par +2000 restaurants</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-black text-yellow-300">98%</div>
                    <div className="text-sm opacity-90">Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-green-300">+45%</div>
                    <div className="text-sm opacity-90">CA moyen</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-blue-300">24h</div>
                    <div className="text-sm opacity-90">Support</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-purple-300">5★</div>
                    <div className="text-sm opacity-90">Note moyenne</div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Ce que disent nos clients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg bg-white/95">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                          JD
                        </div>
                        <div className="ml-4">
                          <h4 className="font-bold">Jean Dupont</h4>
                          <p className="text-gray-600 text-sm">Restaurant Le Bistrot</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Nos ventes ont explosé de 55% grâce à leur stratégie email marketing !"</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-white/95">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black">
                          MR
                        </div>
                        <div className="ml-4">
                          <h4 className="font-bold">Marie Rodriguez</h4>
                          <p className="text-gray-600 text-sm">Pizzeria Bella Vista</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Designs magnifiques et livraison ultra rapide ! Je recommande !"</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {activeModal === 'conception-graphique' && (
          <ConceptionGraphiqueModal onClose={closeModal} />
        )}
        {activeModal === 'email-marketing' && (
          <EmailMarketingModal onClose={closeModal} />
        )}
        {activeModal === 'programme-fidelite' && (
          <ProgrammeFideliteModal onClose={closeModal} />
        )}
        {activeModal === 'campagne-publicitaire' && (
          <CampagnePublicitaireModal onClose={closeModal} />
        )}
      </div>
    </SubscriptionGuard>
  );
};

export default Marketing;
