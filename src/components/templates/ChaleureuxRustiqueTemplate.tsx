
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Utensils, Home, Flame } from 'lucide-react';

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

const ChaleureuxRustiqueTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Navigation avec texture bois */}
      <nav className="bg-gradient-to-r from-amber-900 to-amber-800 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-100">{siteConfig.restaurantName}</h1>
                <p className="text-amber-300 text-sm font-medium">Cuisine traditionnelle</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-amber-200 hover:text-amber-100 font-medium transition-colors duration-300 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Accueil
              </a>
              <a href="#" className="text-amber-200 hover:text-amber-100 font-medium transition-colors duration-300 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Menu
              </a>
              <a href="#" className="text-amber-200 hover:text-amber-100 font-medium transition-colors duration-300 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Notre histoire
              </a>
              <a href="#" className="text-amber-200 hover:text-amber-100 font-medium transition-colors duration-300">Contact</a>
            </div>
            
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-lg shadow-lg font-semibold transform hover:scale-105 transition-all duration-300">
              Réserver
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section avec ambiance chaleureuse */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Pattern de fond rustique */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Éléments décoratifs flottants */}
          <div className="absolute top-20 left-20 w-20 h-20 bg-amber-400/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-amber-500/25 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl px-6">
          {/* Badge famille */}
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl mb-12 border-2 border-amber-300">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <span className="text-amber-800 font-bold text-lg">Restaurant familial depuis 1985</span>
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-8 text-amber-900 leading-tight">
            Bienvenue chez<br />
            <span className="text-orange-700">{siteConfig.restaurantName}</span>
          </h1>
          
          <p className="text-2xl mb-8 text-amber-800 font-semibold max-w-4xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          
          <p className="text-lg mb-16 text-amber-700 max-w-3xl mx-auto">
            {siteConfig.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white px-12 py-4 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold">
              <Utensils className="w-6 h-6 mr-3" />
              Découvrir notre menu
            </Button>
            <Button size="lg" variant="outline" className="border-3 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white px-12 py-4 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-all duration-300 text-lg font-semibold">
              <Heart className="w-6 h-6 mr-3" />
              Notre histoire
            </Button>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-200">
              <Utensils className="w-8 h-8 text-amber-600 mx-auto mb-4" />
              <h3 className="font-bold text-amber-900 mb-2">Cuisine artisanale</h3>
              <p className="text-amber-700 text-sm">Produits frais du terroir</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-200">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-amber-900 mb-2">Ambiance familiale</h3>
              <p className="text-amber-700 text-sm">Accueil chaleureux garanti</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-200">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-amber-900 mb-2">Spécialités maison</h3>
              <p className="text-amber-700 text-sm">Recettes transmises de génération en génération</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChaleureuxRustiqueTemplate;
