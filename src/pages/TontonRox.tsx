
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import TontonRoxChat from '../components/TontonRoxChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Lightbulb, Target, TrendingUp } from 'lucide-react';

const TontonRox: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const expertiseAreas = [
    {
      icon: Target,
      title: "Fidélisation Clients",
      description: "Stratégies adaptées au contexte culturel africain",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: TrendingUp,
      title: "Acquisition",
      description: "Techniques pour attirer de nouveaux clients",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Lightbulb,
      title: "Conseils Pratiques",
      description: "Solutions concrètes pour votre restaurant",
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Tonton Rox
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Votre expert conseiller IA en restaurant
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Zone de chat */}
              <div className="lg:col-span-2">
                <TontonRoxChat />
              </div>
              
              {/* Sidebar d'informations */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Domaines d'expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {expertiseAreas.map((area, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${area.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <area.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{area.title}</h4>
                          <p className="text-xs text-gray-600">{area.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Conseils du jour
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>💡 <strong>Fidélisation:</strong> Créez un programme de points adapté aux habitudes locales</p>
                      <p>🎯 <strong>Acquisition:</strong> Utilisez les réseaux sociaux populaires dans votre région</p>
                      <p>📱 <strong>Marketing:</strong> Pensez aux codes QR pour les menus digitaux</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TontonRox;
