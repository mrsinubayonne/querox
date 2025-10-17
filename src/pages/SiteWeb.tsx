import React from "react";
import PageWithSidebar from "../components/PageWithSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe } from "lucide-react";
import DomainTab from "@/components/DomainTab";

const SiteWeb: React.FC = () => {
  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Web</h1>
          <p className="text-muted-foreground">Gérez votre site web et votre présence en ligne</p>
        </div>

        <Tabs defaultValue="domain" className="space-y-4">
          <TabsList>
            <TabsTrigger value="domain" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Domaine & Publication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="domain" className="space-y-4">
            <DomainTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageWithSidebar>
  );
};

export default SiteWeb;
