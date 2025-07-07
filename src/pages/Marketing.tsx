
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Megaphone, 
  Palette, 
  Mail, 
  Users, 
  Target,
  TrendingUp,
  Gift,
  Camera,
  Sparkles,
  Clock,
  CheckCircle,
  Facebook,
  Share2,
  MessageCircle
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

  const conceptionGraphiqueServices = [
    {
      id: 'conception-graphique',
      title: 'Conception Graphique',
      description: 'Création d\'affiches, flyers et supports visuels professionnels pour attirer vos clients',
      icon: Palette,
      color: 'from-purple-500 via-pink-500 to-rose-500',
      deliveryTime: '3 jours',
      price: 'Sur devis'
    }
  ];

  const communityManagementServices = [
    {
      id: 'email-marketing',
      title: 'Email Marketing',
      description: 'Campagnes d\'emails personnalisées et automatisées pour fidéliser et convertir',
      icon: Mail,
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      deliveryTime: '5 jours',
      price: 'Sur devis'
    },
    {
      id: 'programme-fidelite',
      title: 'Programme de Fidélité',
      description: 'Système complet de fidélisation avec récompenses et suivi client automatique',
      icon: Users,
      color: 'from-green-500 via-emerald-500 to-lime-500',
      deliveryTime: '7 jours',
      price: 'Sur devis'
    }
  ];

  const facebookAdvertisingServices = [
    {
      id: 'campagne-publicitaire',
      title: 'Campagne Publicitaire Facebook',
      description: 'Stratégie publicitaire complète sur Facebook et Instagram pour maximiser votre visibilité',
      icon: Facebook,
      color: 'from-blue-600 via-blue-500 to-blue-400',
      deliveryTime: '10 jours',
      price: 'Sur devis'
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
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header responsive */}
          <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 sticky top-0 z-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="animate-fade-in">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-2">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg">
                    <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                      Services Marketing
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                      Boostez votre restaurant avec nos services professionnels
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 sm:px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Services Actifs</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              {/* Section héro responsive */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 sm:p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="w-full lg:w-2/3 text-center lg:text-left">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                        Développez votre activité avec nos experts
                      </h2>
                      <p className="text-lg sm:text-xl opacity-90 mb-6">
                        Plus de 1000 restaurants nous font confiance pour leur marketing digital
                      </p>
                      <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto lg:mx-0">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold">98%</div>
                          <div className="text-xs sm:text-sm opacity-80">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold">+35%</div>
                          <div className="text-xs sm:text-sm opacity-80">CA moyen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold">24h</div>
                          <div className="text-xs sm:text-sm opacity-80">Support</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/3 flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                        </div>
                        <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment ça marche - responsive */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h3>
                    <p className="text-gray-600">Un processus simple en 3 étapes</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    <div className="text-center group">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl sm:text-2xl font-bold text-white">1</span>
                      </div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Choisissez votre service</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Sélectionnez le service qui correspond à vos besoins</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl sm:text-2xl font-bold text-white">2</span>
                      </div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Remplissez le brief</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Décrivez vos attentes et objectifs en détail</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl sm:text-2xl font-bold text-white">3</span>
                      </div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Recevez votre livrable</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Votre projet est livré dans les délais annoncés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services organisés par sections - responsive */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Nos Services Marketing</h3>
                  <p className="text-gray-600">Choisissez parmi notre gamme de services professionnels organisés par catégorie</p>
                </div>

                <Tabs defaultValue="conception" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="conception" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span className="hidden sm:inline">Conception Graphique</span>
                      <span className="sm:hidden">Design</span>
                    </TabsTrigger>
                    <TabsTrigger value="community" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Community Management</span>
                      <span className="sm:hidden">Community</span>
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      <span className="hidden sm:inline">Publicité Facebook</span>
                      <span className="sm:hidden">Facebook</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="conception" className="space-y-6">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Conception Graphique</h4>
                      <p className="text-gray-600">Créez des visuels impactants pour votre restaurant</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                      {conceptionGraphiqueServices.map((service, index) => (
                        <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <MarketingServiceCard
                            service={service}
                            onSelect={() => openModal(service.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="community" className="space-y-6">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Community Management</h4>
                      <p className="text-gray-600">Gérez et développez votre communauté en ligne</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                      {communityManagementServices.map((service, index) => (
                        <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <MarketingServiceCard
                            service={service}
                            onSelect={() => openModal(service.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="facebook" className="space-y-6">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Publicité Facebook</h4>
                      <p className="text-gray-600">Maximisez votre visibilité sur les réseaux sociaux</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                      {facebookAdvertisingServices.map((service, index) => (
                        <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <MarketingServiceCard
                            service={service}
                            onSelect={() => openModal(service.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Garanties responsive */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white text-center">Nos Garanties</h3>
                  <p className="text-blue-100 text-center mt-2">Votre satisfaction est notre priorité</p>
                </div>
                <CardContent className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    <div className="text-center group">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-green-800 mb-2">Qualité Premium</h4>
                      <p className="text-sm sm:text-base text-gray-600">Designs professionnels créés par nos experts graphistes</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-blue-800 mb-2">Livraison Rapide</h4>
                      <p className="text-sm sm:text-base text-gray-600">Respect strict des délais avec suivi en temps réel</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-purple-800 mb-2">Support Dédié</h4>
                      <p className="text-sm sm:text-base text-gray-600">Accompagnement personnalisé et révisions illimitées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Témoignages responsive */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-gray-100">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Ce que disent nos clients</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          JD
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <h4 className="font-semibold text-sm sm:text-base">Jean Dupont</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Restaurant Le Bistrot</p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 italic">"Service exceptionnel ! Nos ventes ont augmenté de 40% grâce à leur campagne email."</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          MR
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <h4 className="font-semibold text-sm sm:text-base">Marie Rodriguez</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Pizzeria Bella Vista</p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 italic">"Design magnifique et livraison ultra rapide. Je recommande les yeux fermés !"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
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
