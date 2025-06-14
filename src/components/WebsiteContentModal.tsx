
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import WebsiteContentManager from "./WebsiteContentManager";
import WebsiteGalleryManager from "./WebsiteGalleryManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface WebsiteContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websiteId: string;
}

const WebsiteContentModal: React.FC<WebsiteContentModalProps> = ({ open, onOpenChange, websiteId }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer le contenu du site</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="pages" className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="gallery">Galerie</TabsTrigger>
          </TabsList>
          <TabsContent value="pages">
            <WebsiteContentManager websiteId={websiteId} />
          </TabsContent>
          <TabsContent value="gallery">
            <WebsiteGalleryManager websiteId={websiteId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteContentModal;
