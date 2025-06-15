
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import SiteWebBenefits from "./SiteWebBenefits";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <Card className="w-full shadow-2xl border-0 overflow-hidden md:grid md:grid-cols-2 md:gap-0 animate-fade-in rounded-2xl">
          {/* --- Left Column: Content --- */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-4 animate-pulse">
              Nouveau
            </span>
            <CardTitle className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              Créez un <span className="text-purple-600">site web restaurant</span> qui fait la différence
            </CardTitle>
            <p className="mt-4 text-lg text-gray-600">
              🚀 Attirez de nouveaux clients avec un site sublime, livré en 48h clé en main.
            </p>
            
            <SiteWebBenefits />

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 w-full"
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
            <div className="text-gray-500 text-sm text-center mt-4">
              <span className="font-semibold text-purple-700">Aucun engagement</span>, 100% sans abonnement.
            </div>
          </div>

          {/* --- Right Column: Image --- */}
          <div className="hidden md:block relative">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop"
              alt="Création de site web pour restaurant"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SiteWebContainer;
