
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWebsites } from "@/hooks/useWebsites";
import LogoUpload from "./LogoUpload";
import { useToast } from "@/hooks/use-toast";

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
}

interface EditWebsiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website: Website | null;
}

const EditWebsiteModal: React.FC<EditWebsiteModalProps> = ({ open, onOpenChange, website }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#EF4444'
  });
  const [loading, setLoading] = useState(false);
  const { updateWebsite } = useWebsites();
  const { toast } = useToast();

  useEffect(() => {
    if (website) {
      setFormData({
        name: website.name || '',
        description: website.description || '',
        address: website.address || '',
        phone: website.phone || '',
        email: website.email || '',
        logo_url: website.logo_url || '',
        primary_color: website.primary_color || '#3B82F6',
        secondary_color: website.secondary_color || '#EF4444'
      });
    }
  }, [website]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website) return;

    setLoading(true);
    try {
      const success = await updateWebsite(website.id, formData);
      if (success) {
        onOpenChange(false);
        toast({
          title: "Succès",
          description: "Site web mis à jour avec succès",
        });
      }
    } catch (error) {
      console.error('Error updating website:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le site web",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (logoUrl: string | undefined) => {
    setFormData(prev => ({ ...prev, logo_url: logoUrl || '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le site web</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mon Restaurant"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@monrestaurant.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre restaurant..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="01 23 45 67 89"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Rue de la République, Paris"
              />
            </div>
          </div>

          <LogoUpload
            currentLogo={formData.logo_url}
            onLogoChange={handleLogoChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Couleur principale</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Couleur secondaire</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#EF4444"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWebsiteModal;
