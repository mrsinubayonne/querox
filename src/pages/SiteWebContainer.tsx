
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
    (typeof data.color === "string" && data.color
      ? `Couleur souhaitée : ${data.color}\n`
      : "") +
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto text-center animate-fade-in">
        <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 mb-4">
          Nouveau
        </span>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          Faites créer un <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">site web restaurant</span> qui fait la différence
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          🚀 Attirez de nouveaux clients avec un site sublime, livré sous 1 à 3 jours clé en main.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 w-full sm:w-auto"
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
        </div>
        
        <SiteWebBenefits />
      </div>
    </div>
  );
};

export default SiteWebContainer;
