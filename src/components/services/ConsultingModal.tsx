import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '242064563021';

interface ConsultingModalProps {
  onClose: () => void;
}

const ConsultingModal: React.FC<ConsultingModalProps> = ({ onClose }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim() || !contact.trim()) {
      toast.error('Merci de renseigner le nom du restaurant et un contact.');
      return;
    }
    const message = encodeURIComponent(
      `Demande de consulting restaurant (QUEROX)\n\n` +
        `Restaurant : ${restaurantName}\n` +
        `Contact : ${contact}\n` +
        (notes ? `Besoin : ${notes}\n` : '')
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    toast.success('Demande envoyée', { description: 'Notre équipe vous recontacte rapidement.' });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demande de consulting</DialogTitle>
          <DialogDescription>
            Quelques informations pour préparer votre session de consulting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consulting-restaurant">Nom du restaurant</Label>
            <Input
              id="consulting-restaurant"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ex: Le Bistrot"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consulting-contact">Téléphone ou email</Label>
            <Input
              id="consulting-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Ex: +242 06 000 00 00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consulting-notes">Votre besoin</Label>
            <Textarea
              id="consulting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Décrivez brièvement votre besoin"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Envoyer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultingModal;
