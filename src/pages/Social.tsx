
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Heart, MessageCircle, Camera } from 'lucide-react';

const Social: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Réseaux Sociaux
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Gérez votre présence sur les réseaux sociaux
              </p>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Share2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Réseaux Sociaux
                </CardTitle>
                <p className="text-gray-600">
                  Cette section sera bientôt disponible
                </p>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Publications</h3>
                    <p className="text-sm text-gray-600">Planifiez et publiez vos contenus</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <Heart className="h-8 w-8 text-pink-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Engagement</h3>
                    <p className="text-sm text-gray-600">Suivez l'engagement de votre audience</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <Camera className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Contenu</h3>
                    <p className="text-sm text-gray-600">Bibliothèque de médias et templates</p>
                  </div>
                </div>
                <div className="text-gray-500">
                  <h4 className="text-lg font-semibold mb-4">Bientôt disponible</h4>
                  <p className="text-sm max-w-2xl mx-auto">
                    Nous développons actuellement des outils complets pour vous aider 
                    à gérer votre présence sur les réseaux sociaux et interagir 
                    avec votre communauté. Restez connecté !
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Social;
