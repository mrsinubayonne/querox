import React from "react";
import PageWithSidebar from "../components/PageWithSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const SiteWeb: React.FC = () => {
  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Web</h1>
          <p className="text-muted-foreground">Gérez votre site web et votre présence en ligne</p>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            La fonctionnalité de site web est en cours de développement. 
            Revenez bientôt pour créer votre site web personnalisé.
          </AlertDescription>
        </Alert>
      </div>
    </PageWithSidebar>
  );
};

export default SiteWeb;
