
import React from "react";
import { Website } from "@/hooks/useWebsites";

interface WebsiteLivePreviewProps {
  website: Website | null;
}

const WebsiteLivePreview: React.FC<WebsiteLivePreviewProps> = ({ website }) => {
  if (!website) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg min-h-[480px]">
        <div className="text-gray-400 text-center">Sélectionnez ou créez un site pour voir l’aperçu</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <iframe
        title={`Aperçu de ${website.name}`}
        src={website.domain ? `https://${website.domain}` : undefined}
        className="w-full h-[70vh] border-0 bg-white"
        style={{ minHeight: 480 }}
      />
      {!website.domain && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-center text-gray-500 font-medium">
          <div className="text-2xl mb-2">Pas de domaine configuré</div>
          <div>Assignez un domaine pour un aperçu en direct</div>
        </div>
      )}
    </div>
  );
};

export default WebsiteLivePreview;
