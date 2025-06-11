
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, Star, Clock } from 'lucide-react';

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

const ElegantClassiqueTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Navigation avec effet glassmorphism */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-amber-900">{siteConfig.restaurantName}</h1>
                <p className="text-xs text-amber-700 font-medium">Excellence Culinaire</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-amber-800 hover:text-amber-600 font-medium transition-all duration-300 relative group">
                Accueil
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="#" className="text-amber-800 hover:text-amber-600 font-medium transition-all duration-300 relative group">
                Menu
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="#" className="text-amber-800 hover:text-amber-600 font-medium transition-all duration-300 relative group">
                À propos
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="#" className="text-amber-800 hover:text-amber-600 font-medium transition-all duration-300 relative group">
                Contact
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></div>
              </a>
            </div>
            
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
              Réserver
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section avec parallax effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-6xl px-6">
          {/* Badge de qualité */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 border border-amber-200">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <span className="text-amber-800 font-semibold text-sm">Restaurant étoilé</span>
            <Star className="w-5 h-5 text-amber-500 fill-current" />
          </div>

          <h1 className="text-7xl md:text-8xl font-serif font-bold mb-8 text-amber-900 leading-tight">
            {siteConfig.restaurantName}
          </h1>
          
          <p className="text-2xl md:text-3xl mb-6 text-amber-800 font-light max-w-4xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          
          <p className="text-lg mb-12 text-amber-700 max-w-3xl mx-auto opacity-90">
            {siteConfig.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-12 py-4 rounded-full text-lg shadow-xl transform hover:scale-105 transition-all duration-300">
              Découvrir notre menu
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-12 py-4 rounded-full text-lg bg-white/80 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-all duration-300">
              Réserver une table
            </Button>
          </div>

          {/* Horaires d'ouverture */}
          <div className="mt-16 inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-amber-200">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 font-medium">Ouvert tous les jours • 12h - 23h</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-600 rounded-full mt-2"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ElegantClassiqueTemplate;
