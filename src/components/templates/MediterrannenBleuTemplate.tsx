
import React from 'react';
import { Button } from '@/components/ui/button';
import { Anchor, Waves, Sun, MapPin, Phone } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Navigation maritime */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl">
                <Anchor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">{siteConfig.restaurantName}</h1>
                <p className="text-blue-600 text-sm font-semibold">Saveurs méditerranéennes</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-10">
              <a href="#" className="text-blue-800 hover:text-blue-600 font-semibold transition-all duration-300 relative group flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Accueil
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
              <a href="#" className="text-blue-800 hover:text-blue-600 font-semibold transition-all duration-300 relative group">
                Menu
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
              <a href="#" className="text-blue-800 hover:text-blue-600 font-semibold transition-all duration-300 relative group">
                Terrasse
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
              <a href="#" className="text-blue-800 hover:text-blue-600 font-semibold transition-all duration-300 relative group">
                Contact
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
              </a>
            </div>
            
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-3 rounded-full shadow-xl font-semibold transform hover:scale-105 transition-all duration-300">
              Réserver
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section avec thème marin */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Effet de vagues en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231976D2' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Bulles d'air */}
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-300/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-cyan-300/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-2/3 w-12 h-12 bg-blue-400/25 rounded-full animate-pulse delay-500"></div>
          
          {/* Éléments de vagues animées */}
          <div className="absolute bottom-0 left-0 w-full">
            <Waves className="w-full h-16 text-blue-200/50 animate-pulse" />
          </div>
        </div>

        <div className="relative z-10 text-center max-w-6xl px-6">
          {/* Badge côtier */}
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl mb-12 border-2 border-blue-300">
            <Waves className="w-6 h-6 text-blue-600" />
            <span className="text-blue-800 font-bold text-lg">Vue mer panoramique</span>
            <Sun className="w-6 h-6 text-yellow-500" />
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-8 text-blue-900 leading-tight">
            {siteConfig.restaurantName}
          </h1>
          
          <p className="text-2xl md:text-3xl mb-8 text-blue-800 font-semibold max-w-5xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          
          <p className="text-lg mb-16 text-blue-700 max-w-4xl mx-auto">
            {siteConfig.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-14 py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold">
              <MapPin className="w-6 h-6 mr-3" />
              Découvrir notre terrasse
            </Button>
            <Button size="lg" variant="outline" className="border-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-14 py-5 rounded-full bg-white/90 backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold">
              <Phone className="w-6 h-6 mr-3" />
              Nous contacter
            </Button>
          </div>

          {/* Avantages méditerranéens */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-300">
              <Sun className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Terrasse ensoleillée</h3>
              <p className="text-blue-700">Vue imprenable sur la méditerranée</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-300">
              <Waves className="w-10 h-10 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Poissons frais</h3>
              <p className="text-blue-700">Pêche locale quotidienne</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-300">
              <Anchor className="w-10 h-10 text-cyan-600 mx-auto mb-4" />
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Tradition maritime</h3>
              <p className="text-blue-700">Recettes ancestrales du littoral</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediterrannenBleuTemplate;
