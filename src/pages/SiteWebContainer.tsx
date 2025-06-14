
import React from "react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col items-center bg-white gap-6 pt-10 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 text-center">
        Demande de création de site web
      </h1>
      <p className="text-gray-600 text-center max-w-lg">
        Pour commander la création de votre site web restaurateur, cliquez sur le bouton ci-dessous : vous serez redirigé vers WhatsApp pour envoyer votre demande. Nous vous répondrons rapidement avec un lien personnalisé !
      </p>
      <Button
        onClick={handleWhatsAppRequest}
        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg shadow"
        size="lg"
      >
        Demander mon site web via WhatsApp
      </Button>
    </div>
  );
};

export default SiteWebContainer;

