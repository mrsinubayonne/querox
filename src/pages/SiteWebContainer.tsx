
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Numéro WhatsApp à configurer (format international, sans le +)
const WHATSAPP_NUMBER = "33612345678"; // Remplace par ton numéro réel

const SiteWebContainer: React.FC = () => {
  // Message WhatsApp pré-rempli
  const message = encodeURIComponent(
    "Bonjour, je souhaite demander la création de mon site web restaurant depuis l’app Lovable."
  );

  const handleWhatsAppRequest = () => {
    // Ouvre WhatsApp Web ou mobile avec le message pré-rempli
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank");

    toast({
      title: "Demande envoyée",
      description:
        "WhatsApp a été ouvert. Envoyez-nous le message pour lancer votre demande !",
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white">
      <Card className="w-full max-w-md shadow-lg border-0 p-0">
        <CardHeader className="flex flex-col items-center bg-gradient-to-b from-blue-50 to-purple-50 rounded-t-lg pb-0">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center shadow-md -mt-8 border-4 border-white">
            <Globe size={32} className="text-white" />
          </div>
          <CardTitle className="mt-5 text-2xl text-center font-bold text-gray-900">Créer mon site web</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-8 pt-4">
          <p className="text-gray-700 text-center text-base">
            Commandez facilement votre site web pour restaurant.<br />
            Cliquez sur le bouton ci-dessous&nbsp;: vous serez redirigé sur WhatsApp pour nous envoyer votre demande personnalisée.
          </p>
          <Button
            onClick={handleWhatsAppRequest}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg shadow"
            size="lg"
          >
            Demander mon site web
          </Button>
          <div className="text-gray-500 text-sm text-center mt-2">Votre site sera reçu sous 1 à 3 jours</div>
          <div className="text-center text-xs text-gray-400 mt-1">
            Un conseiller Lovable vous répondra rapidement avec un lien personnalisé.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteWebContainer;
