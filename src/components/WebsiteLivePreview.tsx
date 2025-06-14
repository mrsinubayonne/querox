
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const WebsiteLivePreview: React.FC = () => {
  const { toast } = useToast();

  const handleRequest = () => {
    toast({
      title: "Demande envoyée",
      description: "Nous avons bien reçu votre demande ! Un membre de l'équipe vous contactera très vite.",
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg min-h-[480px]">
      <div className="flex flex-col items-center gap-5 max-w-md px-6 py-12">
        <Mail className="w-12 h-12 text-primary mb-2" />
        <h2 className="text-xl font-bold text-gray-800 mb-1">Créer votre site restaurant</h2>
        <p className="text-gray-500 text-center mb-3">
          Vous souhaitez un site internet professionnel à l’image de votre restaurant ? Cliquez ci-dessous pour faire une demande, notre équipe s’occupe du reste !
        </p>
        <Button size="lg" className="w-full" onClick={handleRequest}>
          Faire une demande
        </Button>
      </div>
    </div>
  );
};

export default WebsiteLivePreview;

