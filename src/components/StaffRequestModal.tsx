import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StaffRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StaffRequestModal: React.FC<StaffRequestModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    contactName: '',
    email: '',
    phone: '',
    position: '',
    startDate: '',
    contractType: '',
    salary: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare WhatsApp message
      const message = `🔍 *NOUVELLE DEMANDE DE PERSONNEL*

📍 Restaurant: ${formData.restaurantName}
👤 Contact: ${formData.contactName}
📧 Email: ${formData.email}
📞 Téléphone: ${formData.phone}

💼 Poste recherché: ${formData.position}
📅 Date de début: ${formData.startDate}
📝 Type de contrat: ${formData.contractType}
💰 Salaire proposé: ${formData.salary}

📋 Description:
${formData.description}`;

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/33768168430?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast.success("Demande envoyée !", { description: "Nous allons vous recontacter très prochainement." });

      onClose();
      setFormData({
        restaurantName: '',
        contactName: '',
        email: '',
        phone: '',
        position: '',
        startDate: '',
        contractType: '',
        salary: '',
        description: ''
      });
    } catch (error) {
      toast.error("Erreur", { description: "Une erreur est survenue lors de l'envoi de la demande." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recherche de Personnel</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour nous faire part de vos besoins en personnel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nom du restaurant *</Label>
              <Input
                id="restaurantName"
                required
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact *</Label>
              <Input
                id="contactName"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Poste recherché *</Label>
              <Input
                id="position"
                required
                placeholder="Ex: Serveur, Cuisinier, Chef..."
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début souhaitée *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractType">Type de contrat *</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Intérim">Intérim</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Alternance">Alternance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salaire proposé *</Label>
              <Input
                id="salary"
                required
                placeholder="Ex: 2000€/mois"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description du poste et compétences recherchées *</Label>
            <Textarea
              id="description"
              required
              rows={4}
              placeholder="Décrivez le poste, les compétences requises, l'expérience souhaitée..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StaffRequestModal;
