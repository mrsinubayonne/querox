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
          {/* Header moderne */}
          <header className="relative bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 sticky top-0 z-20 shadow-lg shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="animate-fade-in">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="relative p-3 sm:p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-500/30">
                    <Megaphone className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                      Marketing Pro
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 font-semibold mt-2 max-w-md">
                      Propulsez votre restaurant vers le succès avec nos solutions expertes
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-xl px-4 py-3 shadow-lg shadow-green-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-green-500 rounded-full">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-green-800">Services Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              {/* Section héro premium */}
              <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-blue-600 via-purple-600 via-indigo-600 to-violet-700 p-8 sm:p-12 text-white shadow-2xl shadow-blue-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="w-full lg:w-2/3 text-center lg:text-left">
                      <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="text-sm font-semibold">Solution #1 en France</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6 leading-tight">
                        Révolutionnez votre marketing
                      </h2>
                      <p className="text-xl sm:text-2xl opacity-95 mb-8 leading-relaxed">
                        Rejoignez plus de 2000 restaurants qui ont choisi l'excellence
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-2xl sm:text-3xl font-black text-yellow-300">98%</div>
                          <div className="text-sm opacity-90 font-medium">Satisfaction</div>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-2xl sm:text-3xl font-black text-green-300">+45%</div>
                          <div className="text-sm opacity-90 font-medium">CA moyen</div>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-2xl sm:text-3xl font-black text-blue-300">24h</div>
                          <div className="text-sm opacity-90 font-medium">Support</div>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-2xl sm:text-3xl font-black text-purple-300">5★</div>
                          <div className="text-sm opacity-90 font-medium">Note client</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/3 flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                          <Zap className="h-16 w-16 sm:h-20 sm:w-20 text-yellow-300" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-bounce shadow-lg"></div>
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processus amélioré */}
              <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                <CardContent className="relative p-8 sm:p-12">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-4">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">Processus Simplifié</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Comment ça marche ?</h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Un parcours optimisé en 3 étapes pour des résultats garantis</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                    <div className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-blue-500/30">
                          <span className="text-3xl sm:text-4xl font-black text-white">1</span>
                        </div>
                        <h4 className="text-xl font-black mb-3">Sélectionnez</h4>
                        <p className="text-gray-600 leading-relaxed">Choisissez le service parfait pour vos objectifs business</p>
                      </div>
                    </div>
                    <div className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-3xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-green-500/30">
                          <span className="text-3xl sm:text-4xl font-black text-white">2</span>
                        </div>
                        <h4 className="text-xl font-black mb-3">Personnalisez</h4>
                        <p className="text-gray-600 leading-relaxed">Définissez précisément vos besoins et votre vision</p>
                      </div>
                    </div>
                    <div className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-orange-500/30">
                          <span className="text-3xl sm:text-4xl font-black text-white">3</span>
                        </div>
                        <h4 className="text-xl font-black mb-3">Réussissez</h4>
                        <p className="text-gray-600 leading-relaxed">Recevez votre solution clé en main dans les délais</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services avec design premium */}
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-2 mb-6">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-800">Services Premium</span>
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Nos Solutions Expertes</h3>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">Découvrez notre gamme complète de services marketing conçus spécialement pour les restaurants</p>
                </div>

                <Tabs defaultValue="conception" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-12 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-2xl border-2 border-gray-200/60 shadow-xl shadow-gray-500/10">
                    <TabsTrigger value="conception" className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-300 font-bold">
                      <Palette className="h-5 w-5" />
                      <span className="hidden sm:inline">Design Créatif</span>
                      <span className="sm:hidden">Design</span>
                    </TabsTrigger>
                    <TabsTrigger value="community" className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 font-bold">
                      <MessageCircle className="h-5 w-5" />
                      <span className="hidden sm:inline">Community Pro</span>
                      <span className="sm:hidden">Community</span>
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 transition-all duration-300 font-bold">
                      <Facebook className="h-5 w-5" />
                      <span className="hidden sm:inline">Pub Facebook</span>
                      <span className="sm:hidden">Facebook</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="conception" className="space-y-8">
                    <div className="text-center mb-8">
                      <h4 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Design & Création Visuelle</h4>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">Transformez votre identité visuelle avec des créations qui marquent les esprits</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

                  <TabsContent value="community" className="space-y-8">
                    <div className="text-center mb-8">
                      <h4 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Community Management Expert</h4>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">Développez une communauté engagée et fidèle autour de votre restaurant</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

                  <TabsContent value="facebook" className="space-y-8">
                    <div className="text-center mb-8">
                      <h4 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Publicité Facebook & Instagram</h4>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">Maximisez votre ROI avec des campagnes publicitaires ultra-performantes</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

              {/* Garanties premium */}
              <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative">
                    <h3 className="text-2xl sm:text-3xl font-black text-white text-center mb-2">Nos Garanties Premium</h3>
                    <p className="text-blue-100 text-center text-lg">Votre succès est notre obsession</p>
                  </div>
                </div>
                <CardContent className="p-8 sm:p-12">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                    <div className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-green-500/30">
                          <TrendingUp className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
                        </div>
                        <h4 className="font-black text-xl text-green-800 mb-3">Excellence Garantie</h4>
                        <p className="text-gray-600 leading-relaxed">Créations premium réalisées par nos experts certifiés</p>
                      </div>
                    </div>
                    <div className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-blue-500/30">
                          <Clock className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
                        </div>
                        <h4 className="font-black text-xl text-blue-800 mb-3">Livraison Express</h4>
                        <p className="text-gray-600 leading-relaxed">Respect absolu des délais avec suivi temps réel</p>
                      </div>
                    </div>
                    <div className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-purple-500/30">
                          <Users className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
                        </div>
                        <h4 className="font-black text-xl text-purple-800 mb-3">Support VIP</h4>
                        <p className="text-gray-600 leading-relaxed">Accompagnement personnalisé et révisions illimitées</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Témoignages premium */}
              <Card className="border-0 shadow-2xl shadow-gray-500/10 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <CardContent className="p-8 sm:p-12">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-bold text-yellow-800">Témoignages Clients</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black mb-4">Ils nous font confiance</h3>
                    <p className="text-lg text-gray-600">Découvrez pourquoi nos clients recommandent nos services</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-gray-500/10 border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                          JD
                        </div>
                        <div className="ml-4 sm:ml-6">
                          <h4 className="font-black text-lg">Jean Dupont</h4>
                          <p className="text-gray-600 font-semibold">Restaurant Le Bistrot</p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic text-lg leading-relaxed">"Service exceptionnel ! Nos ventes ont explosé de 55% grâce à leur stratégie email marketing. Une équipe de vrais professionnels !"</p>
                    </div>
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-gray-500/10 border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                          MR
                        </div>
                        <div className="ml-4 sm:ml-6">
                          <h4 className="font-black text-lg">Marie Rodriguez</h4>
                          <p className="text-gray-600 font-semibold">Pizzeria Bella Vista</p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic text-lg leading-relaxed">"Designs magnifiques et livraison ultra rapide ! Nos clients adorent nos nouvelles créations. Je recommande les yeux fermés !"</p>
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
