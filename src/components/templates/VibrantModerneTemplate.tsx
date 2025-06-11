
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, TrendingUp, Star } from 'lucide-react';

interface TemplateProps {
  siteConfig: {
    restaurantName: string;
    description: string;
    subtitle: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
  };
}

const VibrantModerneTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navigation futuriste */}
      <nav className="fixed w-full top-0 z-50 bg-white/10 backdrop-blur-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {siteConfig.restaurantName}
                </h1>
                <p className="text-purple-600 text-xs font-semibold">Expérience culinaire innovante</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-pink-500 font-bold transition-all duration-300 relative group">
                Accueil
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
              <a href="#" className="text-gray-700 hover:text-pink-500 font-bold transition-all duration-300 relative group">
                Menu
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
              <a href="#" className="text-gray-700 hover:text-pink-500 font-bold transition-all duration-300 relative group">
                Événements
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
              <a href="#" className="text-gray-700 hover:text-pink-500 font-bold transition-all duration-300 relative group">
                Contact
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
            </div>
            
            <Button className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white px-8 py-3 rounded-full shadow-2xl font-bold transform hover:scale-110 transition-all duration-300">
              Réserver
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section avec animations dynamiques */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Éléments de fond animés */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full opacity-25 animate-pulse delay-500"></div>
          
          {/* Particules flottantes */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-700"></div>
        </div>

        <div className="relative z-10 text-center max-w-6xl px-6">
          {/* Badge tendance */}
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-lg px-8 py-4 rounded-full shadow-2xl mb-12 border border-white/30">
            <TrendingUp className="w-6 h-6 text-pink-600" />
            <span className="text-gray-800 font-bold text-lg">Restaurant tendance #1</span>
            <Zap className="w-6 h-6 text-orange-500" />
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent leading-tight">
            {siteConfig.restaurantName}
          </h1>
          
          <p className="text-2xl md:text-3xl mb-8 text-gray-700 font-semibold max-w-5xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          
          <p className="text-lg mb-16 text-gray-600 max-w-4xl mx-auto">
            {siteConfig.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white px-16 py-5 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 text-xl font-bold">
              <Sparkles className="w-6 h-6 mr-3" />
              Découvrir l'expérience
            </Button>
            <Button size="lg" variant="outline" className="border-3 border-pink-500 text-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white px-16 py-5 rounded-full bg-white/80 backdrop-blur-sm shadow-xl transform hover:scale-110 transition-all duration-300 text-xl font-bold">
              Menu innovant
            </Button>
          </div>

          {/* Statistiques dynamiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4 fill-current" />
              <div className="text-3xl font-bold text-gray-800 mb-2">4.9/5</div>
              <div className="text-gray-600 font-semibold">Avis clients</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <Zap className="w-10 h-10 text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-800 mb-2">50+</div>
              <div className="text-gray-600 font-semibold">Plats signature</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <TrendingUp className="w-10 h-10 text-pink-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-800 mb-2">10K+</div>
              <div className="text-gray-600 font-semibold">Clients satisfaits</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30 transform hover:scale-105 transition-all duration-300">
              <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-800 mb-2">3</div>
              <div className="text-gray-600 font-semibold">Prix culinaires</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VibrantModerneTemplate;
