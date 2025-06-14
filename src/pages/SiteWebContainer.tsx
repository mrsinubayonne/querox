
import React, { useState, useEffect } from "react";
import { useWebsites } from "@/hooks/useWebsites";
import WebsiteConfigPanel from "@/components/WebsiteConfigPanel";
import WebsiteLivePreview from "@/components/WebsiteLivePreview";
import { Button } from "@/components/ui/button";
import { Eye, Save } from "lucide-react";

const SiteWebContainer: React.FC = () => {
  const {
    websites,
    currentWebsite,
    setCurrentWebsite,
    loading,
    updateWebsite,
  } = useWebsites();

  const [activeTab, setActiveTab] = useState("general");

  // Par défaut : sélectionne le premier site au chargement
  useEffect(() => {
    if (websites.length > 0 && !currentWebsite) {
      setCurrentWebsite(websites[0]);
    }
  }, [websites, currentWebsite, setCurrentWebsite]);

  // Simulation des boutons Aperçu/Sauvegarder
  const handlePreview = () => {
    alert("Fonction Aperçu à venir !");
  };
  const handleSave = () => {
    alert("Les modifications sont sauvegardées au fur et à mesure !");
  };

  // Page de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-xl text-gray-500 animate-pulse">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white py-8 px-6 lg:px-8 animate-fade-in">
       <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Web</h1>
          <p className="text-gray-500 mt-1">Créez et personnalisez votre site web de restaurant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Aperçu
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Colonne de configuration (gauche) */}
        <div>
           <div className="mb-6">
            <h2 className="text-2xl font-bold">Personnalisation</h2>
            <p className="text-gray-500">Configurez l'apparence et le contenu de votre site web</p>
          </div>
          <WebsiteConfigPanel
            tab={activeTab}
            onTabChange={setActiveTab}
            website={currentWebsite}
            onUpdate={updateWebsite}
          />
        </div>
        {/* Colonne d'aperçu live (droite) */}
        <div className="sticky top-8">
           <div className="mb-6">
            <h2 className="text-2xl font-bold">Aperçu en temps réel</h2>
            <p className="text-gray-500">Voir comment votre site web apparaîtra aux visiteurs</p>
          </div>
          <div className="w-full h-full rounded-lg border overflow-hidden bg-gray-50">
            <WebsiteLivePreview website={currentWebsite} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteWebContainer;
