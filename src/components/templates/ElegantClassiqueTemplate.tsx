
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, Utensils, Heart } from 'lucide-react';

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
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <nav className="bg-white/90 backdrop-blur-sm shadow-lg py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="text-3xl font-serif font-bold" style={{ color: colors.primary }}>
            {siteConfig.restaurantName}
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">Accueil</a>
            <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">Menu</a>
            <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">À propos</a>
            <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">Contact</a>
          </div>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full">
            Réserver
          </Button>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100"></div>
        <div className="relative text-center max-w-4xl px-4">
          <h1 className="text-7xl font-serif font-bold mb-6" style={{ color: colors.primary }}>
            {siteConfig.restaurantName}
          </h1>
          <p className="text-2xl mb-4 font-light" style={{ color: colors.text }}>
            {siteConfig.description}
          </p>
          <p className="text-lg mb-12 opacity-80" style={{ color: colors.text }}>
            {siteConfig.subtitle}
          </p>
          <div className="flex gap-6 justify-center">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-full text-lg">
              Découvrir notre menu
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-10 py-4 rounded-full text-lg">
              Réserver une table
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-amber-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-amber-600 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ElegantClassiqueTemplate;
