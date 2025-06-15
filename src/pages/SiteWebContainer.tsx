
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
const WHATSAPP_NUMBER = "242064563021"; // Remplace par ton numéro réel

const generateWhatsAppMessage = (data: SiteWebRequestFields) => {
  return encodeURIComponent(
    `📝 Nouvelle demande de site restaurant depuis QUEROX\n\n` +
    `Nom du restaurant : ${data.restaurantName}\n` +
    `Adresse : ${data.address}\n` +
    (typeof data.maintenanceManagement === "string"
      ? `Maintenance + gestion : ${
          data.maintenanceManagement === "yes"
            ? "Oui"
            : "Non"
        }\n`
      : "") +
    (data.notes ? `Infos complémentaires : ${data.notes}\n` : "")
  );
};

const SiteWebContainer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = (data: SiteWebRequestFields) => {
    setSubmitting(true);

    // Génère le message WhatsApp avec les réponses
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-100/80 via-purple-100/60 to-white py-12 px-2">
      <div className="relative w-full max-w-2xl">
        {/* Background illustration */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-purple-300/60 via-purple-200/30 to-blue-200/10 rounded-full blur-2xl z-0 pointer-events-none" />
        {/* Card */}
        <Card className="relative w-full shadow-2xl border-0 p-0 z-10 animate-fade-in">
          <CardHeader className="flex flex-col items-center bg-gradient-to-br from-blue-50 via-purple-50 to-white rounded-t-lg pb-0 pt-10 relative min-h-[100px] gap-2">
            {/* Nouveau badge */}
            <span className="absolute left-4 top-4 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow pulse animate-pulse">
              Nouveau
            </span>
            {/* Main illustration + Icon */}
            <div className="relative flex flex-col items-center -mt-20">
              <div className="bg-white/80 p-3 rounded-full shadow-lg border-4 border-white animate-scale-in flex items-center justify-center">
                <Globe size={46} className="text-purple-600 drop-shadow-md" />
              </div>
              {/* Illustration bubble */}
              <div className="absolute -z-10 top-2 left-1/2 -translate-x-1/2 w-32 h-20 bg-purple-200/30 rounded-b-full blur-sm" />
            </div>

            <CardTitle className="mt-3 text-[2.1rem] text-center font-extrabold bg-gradient-to-r from-purple-700 via-blue-700 to-sky-500 bg-clip-text text-transparent leading-tight">
              Créez un <span className="text-green-600">site web restaurant</span> qui fait la différence
            </CardTitle>
            <div className="mt-1 mb-1 text-center text-base font-medium text-purple-700 animate-fade-in">
              🚀 Augmentez votre visibilité&nbsp;: attirez de nouveaux clients avec un site sublime
            </div>
            <div className="text-center mb-1 mt-1 font-semibold text-green-700 text-sm">
              Votre site livré en 48h, clé en main
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 py-7 pt-2">
            <p className="text-gray-700 text-center text-base leading-relaxed mb-1">
              Commandez votre site restaurant moderne en quelques clics.<br/>
              Remplissez le formulaire ci-dessous, notre équipe vous contacte rapidement avec une offre personnalisée.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-green-500 via-lime-400 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-8 py-4 text-lg rounded-xl font-bold shadow-xl hover-scale transition-all animate-scale-in"
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
            <div className="text-center text-xs text-gray-400 mt-3">
              Un conseiller Lovable vous répondra rapidement avec un lien personnalisé.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteWebContainer;
