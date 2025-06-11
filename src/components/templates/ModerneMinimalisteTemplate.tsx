
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

const ModerneMinimalisteTemplate: React.FC<TemplateProps> = ({ siteConfig }) => {
  const { colors } = siteConfig;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>
            {siteConfig.restaurantName.toUpperCase()}
          </div>
          <div className="hidden md:flex space-x-12">
            <a href="#" className="text-gray-900 hover:text-orange-500 font-light tracking-wide">ACCUEIL</a>
            <a href="#" className="text-gray-900 hover:text-orange-500 font-light tracking-wide">MENU</a>
            <a href="#" className="text-gray-900 hover:text-orange-500 font-light tracking-wide">CONTACT</a>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2">
            RÉSERVER
          </Button>
        </div>
      </nav>

      <section className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-8xl font-thin mb-8 tracking-tight" style={{ color: colors.primary }}>
            {siteConfig.restaurantName}
          </h1>
          <div className="w-20 h-px bg-orange-500 mx-auto mb-8"></div>
          <p className="text-xl font-light mb-12 text-gray-600 leading-relaxed">
            {siteConfig.description}
          </p>
          <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-12 py-4 rounded-none text-sm tracking-widest">
            EXPLORER
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ModerneMinimalisteTemplate;
