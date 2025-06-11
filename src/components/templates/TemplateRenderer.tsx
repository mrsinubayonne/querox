
import React from 'react';
import ElegantClassiqueTemplate from './ElegantClassiqueTemplate';
import ModerneMinimalisteTemplate from './ModerneMinimalisteTemplate';
import ChaleureuxRustiqueTemplate from './ChaleureuxRustiqueTemplate';
import VibrantModerneTemplate from './VibrantModerneTemplate';
import MediterrannenBleuTemplate from './MediterrannenBleuTemplate';

interface SiteConfig {
  restaurantName: string;
  description: string;
  subtitle: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

interface TemplateRendererProps {
  template: string;
  siteConfig: SiteConfig;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, siteConfig }) => {
  switch (template) {
    case 'elegant-classique':
      return <ElegantClassiqueTemplate siteConfig={siteConfig} />;
    case 'moderne-minimaliste':
      return <ModerneMinimalisteTemplate siteConfig={siteConfig} />;
    case 'chaleureux-rustique':
      return <ChaleureuxRustiqueTemplate siteConfig={siteConfig} />;
    case 'vibrant-moderne':
      return <VibrantModerneTemplate siteConfig={siteConfig} />;
    case 'mediterraneen-bleu':
      return <MediterrannenBleuTemplate siteConfig={siteConfig} />;
    default:
      return (
        <div className="h-96 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Aperçu du template non disponible</p>
        </div>
      );
  }
};

export default TemplateRenderer;
