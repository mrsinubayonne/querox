
import React from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-pink-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            {siteConfig.restaurantName}
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Accueil</a>
            <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Menu</a>
            <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Événements</a>
            <a href="#" className="text-gray-700 hover:text-pink-500 font-semibold transition-colors">Contact</a>
          </div>
          <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg">
            Réserver
          </Button>
        </div>
      </nav>

      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-orange-400/20"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="relative text-center max-w-5xl px-4">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            {siteConfig.restaurantName}
          </h1>
          <p className="text-2xl mb-6 text-gray-700 font-medium">
            {siteConfig.description}
          </p>
          <p className="text-lg mb-12 text-gray-600">
            {siteConfig.subtitle}
          </p>
          <div className="flex gap-6 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all">
              Découvrir
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-10 py-4 rounded-full">
              Réserver
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VibrantModerneTemplate;
