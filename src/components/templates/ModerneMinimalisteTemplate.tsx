
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Users } from 'lucide-react';

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

const ModerneMinimalisteTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation ultra-minimaliste */}
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-thin tracking-tight text-gray-900">
              {siteConfig.restaurantName.toUpperCase()}
            </div>
            
            <div className="hidden md:flex items-center space-x-12">
              <a href="#" className="text-gray-700 hover:text-orange-500 font-light tracking-wide transition-colors duration-300 text-sm uppercase">Accueil</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-light tracking-wide transition-colors duration-300 text-sm uppercase">Menu</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-light tracking-wide transition-colors duration-300 text-sm uppercase">Contact</a>
            </div>
            
            <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-none text-sm tracking-widest uppercase font-light transition-all duration-300">
              Réserver
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section avec design épuré */}
      <section className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="max-w-6xl mx-auto px-8 text-center">
          {/* Indicateur de qualité minimaliste */}
          <div className="inline-flex items-center gap-4 mb-12">
            <div className="w-12 h-px bg-orange-500"></div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span className="text-xs uppercase tracking-widest text-gray-600 font-light">Excellence culinaire</span>
            </div>
            <div className="w-12 h-px bg-orange-500"></div>
          </div>

          <h1 className="text-8xl md:text-9xl font-thin mb-16 tracking-tighter text-gray-900 leading-none">
            {siteConfig.restaurantName}
          </h1>
          
          <div className="w-32 h-px bg-orange-500 mx-auto mb-16"></div>
          
          <p className="text-2xl font-light mb-16 text-gray-600 leading-relaxed max-w-4xl mx-auto">
            {siteConfig.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-16 py-4 rounded-none text-sm tracking-widest uppercase font-light group">
              Explorer
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-16 py-4 rounded-none text-sm tracking-widest uppercase font-light">
              Menu
            </Button>
          </div>

          {/* Stats minimalistes */}
          <div className="grid grid-cols-3 gap-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-thin text-gray-900 mb-2">15+</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Années d'expérience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-thin text-gray-900 mb-2">2</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Étoiles Michelin</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-thin text-gray-900 mb-2">50+</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Couverts par service</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModerneMinimalisteTemplate;
