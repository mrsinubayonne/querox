
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

const ChaleureuxRustiqueTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <nav className="bg-white/95 shadow-md py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChefHat className="w-8 h-8 text-amber-700" />
            <div className="text-2xl font-bold text-amber-900">
              {siteConfig.restaurantName}
            </div>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Accueil</a>
            <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Menu</a>
            <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Notre histoire</a>
            <a href="#" className="text-amber-800 hover:text-amber-600 font-medium">Contact</a>
          </div>
          <Button className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg">
            Réserver
          </Button>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative text-center max-w-4xl px-4">
          <h1 className="text-6xl font-bold mb-6 text-amber-900">
            Bienvenue chez {siteConfig.restaurantName}
          </h1>
          <p className="text-xl mb-6 text-amber-800 font-medium">
            {siteConfig.description}
          </p>
          <p className="text-lg mb-10 text-amber-700">
            {siteConfig.subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg">
              <Utensils className="w-5 h-5 mr-2" />
              Notre Menu
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white px-8 py-3 rounded-lg">
              <Heart className="w-5 h-5 mr-2" />
              Notre Histoire
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChaleureuxRustiqueTemplate;
