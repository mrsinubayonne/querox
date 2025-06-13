
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Globe, Phone, Mail, MapPin } from "lucide-react";

interface Website {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  is_published: boolean;
  template_id: string;
  created_at: string;
}

interface WebsitePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website: Website | null;
}

const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({ open, onOpenChange, website }) => {
  if (!website) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Aperçu du site web - {website.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête du site */}
          <div 
            className="rounded-lg p-6 text-white"
            style={{ backgroundColor: website.primary_color }}
          >
            <div className="flex items-center gap-4 mb-4">
              {website.logo_url && (
                <img 
                  src={website.logo_url} 
                  alt={`Logo ${website.name}`}
                  className="w-16 h-16 object-cover rounded-lg bg-white p-2"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{website.name}</h1>
                {website.description && (
                  <p className="text-lg opacity-90">{website.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={website.is_published ? "default" : "secondary"}>
                {website.is_published ? 'Publié' : 'Brouillon'}
              </Badge>
              <Badge variant="outline" className="text-white border-white">
                Modèle: {website.template_id}
              </Badge>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {website.address && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">{website.address}</p>
                </div>
              </div>
            )}

            {website.phone && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Téléphone</p>
                  <p className="text-sm text-gray-600">{website.phone}</p>
                </div>
              </div>
            )}

            {website.email && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{website.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section de démonstration */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Aperçu du contenu</h2>
            <div className="space-y-4">
              <div className="p-4 border-l-4" style={{ borderLeftColor: website.secondary_color }}>
                <h3 className="font-semibold text-lg">Bienvenue dans notre restaurant</h3>
                <p className="text-gray-600">Une expérience culinaire exceptionnelle vous attend dans notre établissement.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Notre Menu</h4>
                  <p className="text-sm text-gray-600">Découvrez nos spécialités préparées avec des ingrédients frais et de qualité.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Réservations</h4>
                  <p className="text-sm text-gray-600">Réservez votre table en ligne ou par téléphone pour une expérience garantie.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>Site créé le {new Date(website.created_at).toLocaleDateString('fr-FR')}</p>
            <p>Couleurs: Principale {website.primary_color} • Secondaire {website.secondary_color}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsitePreviewModal;
