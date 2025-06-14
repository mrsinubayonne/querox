
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

  const getPreviewSrcDoc = () => {
    if (!website) return "";
    // Un modèle simple pour prévisualiser les informations de base du site web
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aperçu de ${website.name}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0; 
            color: #333;
            background-color: #f9fafb;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header { 
            background-color: ${website.primary_color || '#3B82F6'}; 
            color: white; 
            padding: 40px 20px;
            text-align: center;
          }
          .header img {
            max-width: 120px;
            max-height: 80px;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            background-color: white;
            padding: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header h1 {
            margin: 0;
            font-size: 2.5rem;
          }
          .content {
            padding: 40px 20px;
            text-align: center;
          }
          .content p {
            font-size: 1.2rem;
            line-height: 1.6;
            color: #555;
            max-width: 600px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            ${website.logo_url ? `<img src="${website.logo_url}" alt="Logo du restaurant">` : ''}
            <h1>${website.name}</h1>
          </header>
          <main class="content">
            <p>${website.description || "Une brève description de votre restaurant et de ses spécialités."}</p>
          </main>
        </div>
      </body>
      </html>
    `;
  };

  const src = website.domain ? `https://${website.domain}` : undefined;
  const srcDoc = !website.domain ? getPreviewSrcDoc() : undefined;

  return (
    <div className="relative w-full h-full">
      <iframe
        title={`Aperçu de ${website.name}`}
        src={src}
        srcDoc={srcDoc}
        className="w-full h-[70vh] border-0 bg-white"
        style={{ minHeight: 480 }}
      />
    </div>
  );
};

export default WebsiteLivePreview;
