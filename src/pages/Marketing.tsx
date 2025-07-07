
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
  MessageCircle,
  Star,
  Award,
  Zap
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
      color: 'from-violet-600 via-purple-600 to-fuchsia-600',
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
    }
  ];

  const facebookAdvertisingServices = [
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

  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <SubscriptionGuard feature="les outils marketing">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header compact pour PC */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-6 py-4 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Marketing Pro
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Solutions marketing professionnelles pour restaurants
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Services Premium</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            <div className="max-w-7xl mx-auto">
              {/* Section héro compacte */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl mb-4 lg:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
                      <Star className="h-4 w-4 text-yellow-300" />
                      <span className="text-sm font-semibold">Solution #1 en France</span>
                    </div>
                    <h2 className="text-3xl font-black mb-3">Révolutionnez votre marketing</h2>
                    <p className="text-lg opacity-90 mb-4">
                      Rejoignez plus de 2000 restaurants qui ont choisi l'excellence
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl font-black text-yellow-300">98%</div>
                      <div className="text-xs opacity-90">Satisfaction</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl font-black text-green-300">+45%</div>
                      <div className="text-xs opacity-90">CA moyen</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl font-black text-blue-300">24h</div>
                      <div className="text-xs opacity-90">Support</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl font-black text-purple-300">5★</div>
                      <div className="text-xs opacity-90">Note</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processus en ligne pour PC */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-4 lg:mb-6">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center mb-4 lg:mb-6">
                    <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-2">Comment ça marche ?</h3>
                    <p className="text-gray-600">Un processus simplifié en 3 étapes</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-black text-white">1</span>
                      </div>
                      <h4 className="text-lg font-black mb-2">Sélectionnez</h4>
                      <p className="text-gray-600 text-sm">Choisissez le service adapté à vos besoins</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-black text-white">2</span>
                      </div>
                      <h4 className="text-lg font-black mb-2">Personnalisez</h4>
                      <p className="text-gray-600 text-sm">Définissez vos besoins et votre vision</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl font-black text-white">3</span>
                      </div>
                      <h4 className="text-lg font-black mb-2">Réussissez</h4>
                      <p className="text-gray-600 text-sm">Recevez votre solution dans les délais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services avec tabs optimisés PC */}
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-black text-gray-900 mb-2">Nos Solutions Expertes</h3>
                  <p className="text-lg text-gray-600">Services marketing conçus spécialement pour les restaurants</p>
                </div>

                <Tabs defaultValue="conception" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-8">
                    <TabsTrigger value="conception" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Design Créatif
                    </TabsTrigger>
                    <TabsTrigger value="community" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Community Pro
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Pub Facebook
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="conception">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                      {conceptionGraphiqueServices.map((service, index) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="community">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                      {communityManagementServices.map((service, index) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="facebook">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                      {facebookAdvertisingServices.map((service, index) => (
                        <MarketingServiceCard
                          key={service.id}
                          service={service}
                          onSelect={() => openModal(service.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Garanties et témoignages en grille PC */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Garanties */}
                <Card className="border-0 shadow-lg bg-white/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-black text-center">Nos Garanties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-green-800">Excellence Garantie</h4>
                        <p className="text-gray-600 text-sm">Créations premium par nos experts</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-blue-800">Livraison Express</h4>
                        <p className="text-gray-600 text-sm">Respect des délais avec suivi temps réel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-purple-800">Support VIP</h4>
                        <p className="text-gray-600 text-sm">Accompagnement personnalisé</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Témoignages */}
                <Card className="border-0 shadow-lg bg-white/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-black text-center">Témoignages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                          JD
                        </div>
                        <div className="ml-3">
                          <h4 className="font-black text-sm">Jean Dupont</h4>
                          <p className="text-gray-600 text-xs">Restaurant Le Bistrot</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm italic">"Nos ventes ont explosé de 55% grâce à leur stratégie email marketing !"</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                          MR
                        </div>
                        <div className="ml-3">
                          <h4 className="font-black text-sm">Marie Rodriguez</h4>
                          <p className="text-gray-600 text-xs">Pizzeria Bella Vista</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm italic">"Designs magnifiques et livraison ultra rapide ! Je recommande !"</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
