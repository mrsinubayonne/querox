
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface WebsiteLivePreviewProps {
  website: any;
}

const WebsiteLivePreview: React.FC<WebsiteLivePreviewProps> = ({ website }) => {
  if (!website) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent>
          <div className="text-gray-400 text-center">Sélectionnez ou créez un site pour voir l’aperçu</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardContent className="p-0">
        <iframe
          title={`Aperçu de ${website.name}`}
          src={website.domain ? `https://${website.domain}` : undefined}
          className="w-full h-[70vh] border-0 bg-white rounded"
          style={{ minHeight: 480 }}
        />
        {!website.domain && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-400 font-medium">
            <div className="text-2xl mb-2">Pas de domaine configuré</div>
            <div>Assignez un domaine pour un aperçu en direct</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebsiteLivePreview;
