import React from "react";
import { Website } from "@/hooks/useWebsites";
import { useMenuForWebsite } from "@/hooks/useMenuForWebsite";
import { generateWebsitePreviewHtml } from "@/utils/generateWebsitePreviewHtml";

interface WebsiteLivePreviewProps {
  website: Website | null;
}

const WebsiteLivePreview: React.FC<WebsiteLivePreviewProps> = ({ website }) => {
  const { menuItems } = useMenuForWebsite();

  if (!website) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg min-h-[480px]">
        <div className="text-gray-400 text-center">Sélectionnez ou créez un site pour voir l'aperçu</div>
      </div>
    );
  }

  const src = website.domain ? `https://${website.domain}` : undefined;
  const srcDoc = !website.domain ? generateWebsitePreviewHtml(website, menuItems) : undefined;

  return (
    <div className="relative w-full h-full">
      <iframe
        title={`Aperçu de ${website.name}`}
        src={src}
        srcDoc={srcDoc}
        className="w-full h-[70vh] border-0 bg-white rounded-lg"
        style={{ minHeight: 480 }}
      />
    </div>
  );
};

export default WebsiteLivePreview;

// ⚠️ Ce fichier devient très long. Pensez à demander un refactoring plus approfondi pour améliorer sa maintenabilité.
