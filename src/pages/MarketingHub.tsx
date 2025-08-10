
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Palette, Share2, Facebook, Star, CheckCircle, TrendingUp, Clock, Users, ArrowRight } from 'lucide-react';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const MarketingHub: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const marketingServices = [
    {
      id: 'conception-graphique',
      title: 'Conception Graphique',
      description: 'Création d\'affiches, flyers et supports visuels professionnels',
      icon: Palette,
      color: 'from-violet-600 via-purple-600 to-fuchsia-600',
      path: '/conception-graphique'
    },
    {
      id: 'reseaux-sociaux',
      title: 'Réseaux Sociaux',
      description: 'Gestion complète de vos comptes Facebook, Instagram et TikTok',
      icon: Share2,
      color: 'from-blue-500 to-purple-500',
      path: '/reseaux-sociaux'
    },
    {
      id: 'publicite-facebook',
      title: 'Publicité Facebook',
      description: 'Campagnes publicitaires ciblées sur Facebook et Instagram',
      icon: Facebook,
      color: 'from-blue-600 via-indigo-600 to-purple-600',
      path: '/publicite-facebook'
    }
  ];

  return (
    <SubscriptionGuard feature="les outils marketing">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <Megaphone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Marketing & Communication
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Solutions complètes pour développer votre activité
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Services Premium</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Section héro */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span className="text-lg font-semibold">Solution #1 en France</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">Révolutionnez votre marketing</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Rejoignez plus de 2000 restaurants qui ont choisi l'excellence
                    </p>
                  </div>
                  <div className="hidden lg:flex space-x-8">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-yellow-300">98%</div>
                      <div className="text-sm opacity-90">Satisfaction</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-green-300">+45%</div>
                      <div className="text-sm opacity-90">CA moyen</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="text-3xl font-black text-blue-300">24h</div>
                      <div className="text-sm opacity-90">Support</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 mb-8">
                {marketingServices.map(service => {
                  const IconComponent = service.icon;
                  return (
                    <Card key={service.id} className="border-0 shadow-2xl shadow-gray-500/10 bg-white/95 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] group overflow-hidden cursor-pointer"
                          onClick={() => navigate(service.path)}>
                      <div className={`h-1 bg-gradient-to-r ${service.color}`}></div>
                      <CardContent className="p-8 relative">
                        <div className="flex items-start space-x-6">
                          <div className="relative">
                            <div className={`p-5 bg-gradient-to-br ${service.color} rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                              <IconComponent className="h-10 w-10 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                              {service.title}
                            </h3>
                            <p className="text-gray-600 text-base mb-6 leading-relaxed">
                              {service.description}
                            </p>
                            
                            <Button className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 hover:scale-105 transition-all duration-300 font-black py-4 rounded-2xl shadow-2xl text-lg border-0 relative overflow-hidden group/button`}>
                              <span className="relative z-10 flex items-center justify-center">
                                Découvrir
                                <ArrowRight className="h-5 w-5 ml-2" />
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Processus */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-8">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Comment ça marche ?</h3>
                    <p className="text-lg text-gray-600">Un processus simplifié en 3 étapes</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl font-black text-white">1</span>
                      </div>
                      <h4 className="text-xl font-black mb-3">Sélectionnez</h4>
                      <p className="text-gray-600">Choisissez le service adapté à vos besoins</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl font-black text-white">2</span>
                      </div>
                      <h4 className="text-xl font-black mb-3">Personnalisez</h4>
                      <p className="text-gray-600">Définissez vos besoins et votre vision</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-3xl font-black text-white">3</span>
                      </div>
                      <h4 className="text-xl font-black mb-3">Réussissez</h4>
                      <p className="text-gray-600">Recevez votre solution dans les délais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default MarketingHub;
