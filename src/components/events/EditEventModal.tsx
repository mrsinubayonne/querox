
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';

interface Event {
  id: number;
  nom: string;
  description: string;
  date: string;
  heure: string;
  participants: number;
  lieu: string;
  statut: string;
  prix: number;
  organisateur: string;
  image?: string;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Event) => void;
  event: Event | null;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  event 
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    date: '',
    heure: '',
    participants: 0,
    lieu: '',
    statut: 'planifié',
    prix: 0,
    organisateur: '',
    image: '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png'
  });

  useEffect(() => {
    if (event) {
      setFormData({
        nom: event.nom,
        description: event.description,
        date: event.date,
        heure: event.heure,
        participants: event.participants,
        lieu: event.lieu,
        statut: event.statut,
        prix: event.prix,
        organisateur: event.organisateur,
        image: event.image || '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png'
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (event) {
      const updatedEvent = {
        ...event,
        ...formData
      };
      onSubmit(updatedEvent);
    }
    onClose();
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'événement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            currentImage={formData.image}
            onImageChange={handleImageChange}
          />

          <div className="space-y-2">
            <Label htmlFor="nom">Nom de l'événement</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heure">Heure</Label>
              <Input
                id="heure"
                type="time"
                value={formData.heure}
                onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                type="number"
                min="0"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu</Label>
              <Input
                id="lieu"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifié">Planifié</SelectItem>
                  <SelectItem value="confirmé">Confirmé</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prix">Prix (CFA)</Label>
              <Input
                id="prix"
                type="number"
                min="0"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organisateur">Organisateur</Label>
              <Input
                id="organisateur"
                value={formData.organisateur}
                onChange={(e) => setFormData({ ...formData, organisateur: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventModal;
