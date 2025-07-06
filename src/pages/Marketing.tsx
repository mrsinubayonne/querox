
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
  CheckCircle
} from 'lucide-react';
import MarketingServiceCard from '@/components/marketing/MarketingServiceCard';
import ConceptionGraphiqueModal from '@/components/marketing/ConceptionGraphiqueModal';
import EmailMarketingModal from '@/components/marketing/EmailMarketingModal';
import ProgrammeFideliteModal from '@/components/marketing/ProgrammeFideliteModal';
import CampagnePublicitaireModal from '@/components/marketing/CampagnePublicitaireModal';

const Marketing: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const marketingServices = [
    {
      id: 'conception-graphique',
      title: 'Conception Graphique',
      description: 'Création d\'affiches, flyers et supports visuels professionnels pour attirer vos clients',
      icon: Palette,
      color: 'from-purple-500 via-pink-500 to-rose-500',
      deliveryTime: '3 jours',
      price: 'À partir de 49€'
    },
    {
      id: 'email-marketing',
      title: 'Email Marketing',
      description: 'Campagnes d\'emails personnalisées et automatisées pour fidéliser et convertir',
      icon: Mail,
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      deliveryTime: '5 jours',
      price: 'À partir de 89€'
    },
    {
      id: 'programme-fidelite',
      title: 'Programme de Fidélité',
      description: 'Système complet de fidélisation avec récompenses et suivi client automatique',
      icon: Users,
      color: 'from-green-500 via-emerald-500 to-lime-500',
      deliveryTime: '7 jours',
      price: 'À partir de 149€'
    },
    {
      id: 'campagne-publicitaire',
      title: 'Campagne Publicitaire',
      description: 'Stratégie publicitaire complète sur Facebook, Instagram et Google Ads',
      icon: Target,
      color: 'from-orange-500 via-red-500 to-pink-500',
      deliveryTime: '10 jours',
      price: 'À partir de 199€'
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
          {/* Header avec animation */}
          <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 px-8 py-8 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                    <Megaphone className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                      Services Marketing
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                      Boostez votre restaurant avec nos services professionnels
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Services Actifs</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Section héro avec statistiques */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-2/3 mb-6 lg:mb-0">
                      <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                        Développez votre activité avec nos experts
                      </h2>
                      <p className="text-xl opacity-90 mb-6">
                        Plus de 1000 restaurants nous font confiance pour leur marketing digital
                      </p>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">98%</div>
                          <div className="text-sm opacity-80">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">+35%</div>
                          <div className="text-sm opacity-80">CA moyen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">24h</div>
                          <div className="text-sm opacity-80">Support</div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-1/3 flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Sparkles className="h-16 w-16 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment ça marche */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h3>
                    <p className="text-gray-600">Un processus simple en 3 étapes</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">1</span>
                      </div>
                      <h4 className="font-semibold mb-2">Choisissez votre service</h4>
                      <p className="text-sm text-gray-600">Sélectionnez le service qui correspond à vos besoins</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">2</span>
                      </div>
                      <h4 className="font-semibold mb-2">Remplissez le brief</h4>
                      <p className="text-sm text-gray-600">Décrivez vos attentes et objectifs en détail</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">3</span>
                      </div>
                      <h4 className="font-semibold mb-2">Recevez votre livrable</h4>
                      <p className="text-sm text-gray-600">Votre projet est livré dans les délais annoncés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services Grid */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Nos Services Marketing</h3>
                  <p className="text-gray-600">Choisissez parmi notre gamme de services professionnels</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {marketingServices.map((service, index) => (
                    <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <MarketingServiceCard
                        service={service}
                        onSelect={() => openModal(service.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Garanties avec design amélioré */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                  <h3 className="text-2xl font-bold text-white text-center">Nos Garanties</h3>
                  <p className="text-blue-100 text-center mt-2">Votre satisfaction est notre priorité</p>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center group">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <TrendingUp className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-green-800 mb-2">Qualité Premium</h4>
                      <p className="text-gray-600">Designs professionnels créés par nos experts graphistes</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Clock className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-blue-800 mb-2">Livraison Rapide</h4>
                      <p className="text-gray-600">Respect strict des délais avec suivi en temps réel</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-purple-800 mb-2">Support Dédié</h4>
                      <p className="text-gray-600">Accompagnement personnalisé et révisions illimitées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Témoignages */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-gray-100">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-center mb-8">Ce que disent nos clients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          JD
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold">Jean Dupont</h4>
                          <p className="text-sm text-gray-600">Restaurant Le Bistrot</p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Service exceptionnel ! Nos ventes ont augmenté de 40% grâce à leur campagne email."</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          MR
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold">Marie Rodriguez</h4>
                          <p className="text-sm text-gray-600">Pizzeria Bella Vista</p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"Design magnifique et livraison ultra rapide. Je recommande les yeux fermés !"</p>
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
