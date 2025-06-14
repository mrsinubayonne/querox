
import React, { useState, useEffect } from "react";
import { useWebsites } from "@/hooks/useWebsites";
import WebsiteConfigPanel from "@/components/WebsiteConfigPanel";
import WebsiteLivePreview from "@/components/WebsiteLivePreview";

const SiteWebContainer: React.FC = () => {
  const {
    websites,
    currentWebsite,
    setCurrentWebsite,
    fetchWebsites,
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
    alert("Fonction Sauvegarder à venir !");
  };

  // Page de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-xl text-gray-500 animate-pulse">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-2 flex flex-col items-center animate-fade-in">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">
        {/* Colonne de configuration (gauche) */}
        <div className="w-full md:w-[400px]">
          <WebsiteConfigPanel
            tab={activeTab}
            onTabChange={setActiveTab}
            onPreview={handlePreview}
            onSave={handleSave}
          />
        </div>
        {/* Colonne d'aperçu live (droite) */}
        <div className="hidden md:block w-full flex-1">
          <WebsiteLivePreview website={currentWebsite} />
        </div>
      </div>
    </div>
  );
};

export default SiteWebContainer;
