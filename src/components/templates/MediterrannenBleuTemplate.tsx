
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coffee, MapPin, Phone } from 'lucide-react';

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

const MediterrannenBleuTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <nav className="bg-white shadow-sm py-5">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {siteConfig.restaurantName}
            </div>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Accueil</a>
            <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Menu</a>
            <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Terrasse</a>
            <a href="#" className="text-blue-800 hover:text-blue-600 font-medium">Contact</a>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Réserver
          </Button>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%231976D2\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')]"></div>
        <div className="relative text-center max-w-4xl px-4">
          <h1 className="text-6xl font-bold mb-6 text-blue-900">
            {siteConfig.restaurantName}
          </h1>
          <p className="text-xl mb-6 text-blue-800 font-medium">
            {siteConfig.description}
          </p>
          <p className="text-lg mb-10 text-blue-700">
            {siteConfig.subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg">
              <MapPin className="w-5 h-5 mr-2" />
              Notre Adresse
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg">
              <Phone className="w-5 h-5 mr-2" />
              Nous Appeler
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediterrannenBleuTemplate;
