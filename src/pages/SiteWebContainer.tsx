
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SiteWebBenefits from "./SiteWebBenefits";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import SiteWebRequestForm, {
  SiteWebRequestFields,
} from "./SiteWebRequestForm";

// Numéro WhatsApp à configurer (format international, sans le +)
const WHATSAPP_NUMBER = "33612345678"; // Remplace par ton numéro réel

const generateWhatsAppMessage = (data: SiteWebRequestFields) => {
  return encodeURIComponent(
    `Bonjour, je souhaite demander la création de mon site web restaurant depuis l’app Lovable.\n\n` +
      `🙋‍♂️ Prénom et nom: ${data.ownerName}\n` +
      `🏷️ Restaurant : ${data.restaurantName}\n` +
      `📱 Téléphone : ${data.phone}\n` +
      `✉️ Email : ${data.email}\n` +
      `🎨 Style : ${data.style}\n` +
      (data.notes ? `🔎 Infos complémentaires : ${data.notes}\n` : "")
  );
};

const SiteWebContainer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = (data: SiteWebRequestFields) => {
    setSubmitting(true);

    // Génére le message WhatsApp avec les réponses
    const message = generateWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    setTimeout(() => {
      window.open(url, "_blank");
      toast({
        title: "Demande envoyée 👌",
        description:
          "Vos infos ont bien été transmises. Envoyez le message WhatsApp à notre équipe Lovable pour recevoir votre offre personnalisée 😊.",
      });
      setSubmitting(false);
      setOpen(false);
    }, 750);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <Card className="w-full max-w-md shadow-2xl border-0 p-0 animate-fade-in">
        <CardHeader className="flex flex-col items-center bg-gradient-to-b from-blue-50 to-purple-50 rounded-t-lg pb-0 relative">
          <span className="absolute left-4 top-4 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow">
            Nouveau
          </span>
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center shadow-md -mt-8 border-4 border-white animate-scale-in">
            <Globe size={32} className="text-white" />
          </div>
          <CardTitle className="mt-5 text-2xl text-center font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Créer mon site web restaurant
          </CardTitle>
          <div className="mt-2 mb-1 text-center text-base font-medium text-purple-700 animate-fade-in">
            🚀 Augmentez votre visibilité avec un site élégant et rapide
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-8 pt-4">
          <p className="text-gray-700 text-center text-base leading-relaxed mb-1">
            Commandez votre site restaurant moderne en quelques clics.<br/>
            Remplissez le formulaire ci-dessous, notre équipe vous contacte rapidement avec une offre sur-mesure.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover-scale transition-all"
                size="lg"
              >
                Demander mon site web
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demande de création de site web</DialogTitle>
                <DialogDescription>
                  Quelques infos indispensables pour créer un site qui vous ressemble.
                </DialogDescription>
              </DialogHeader>
              <SiteWebRequestForm onSubmit={handleFormSubmit} loading={submitting} />
            </DialogContent>
          </Dialog>
          <div className="text-gray-500 text-sm text-center mt-2">
            <span className="font-semibold text-green-700">Livré sous 1 à 3 jours</span>
          </div>
          <SiteWebBenefits />
          <div className="text-center text-xs text-gray-400 mt-2">
            Un conseiller Lovable vous répondra rapidement avec un lien personnalisé.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteWebContainer;
