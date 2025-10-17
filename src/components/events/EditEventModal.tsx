
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EventForm from './EventForm';
import { APP_CONFIG } from '@/config/app.config';

interface EventFormData {
  nom: string;
  description: string;
  date: string;
  heure: string;
  participants: number;
  lieu: string;
  statut: string;
  prix: number;
  organisateur: string;
  image: string;
}

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
  const [formData, setFormData] = useState<{
    nom: string;
    description: string;
    date: string;
    heure: string;
    participants: number;
    lieu: string;
    statut: string;
    prix: number;
    organisateur: string;
    image: string;
  }>({
    nom: '',
    description: '',
    date: '',
    heure: '',
    participants: 0,
    lieu: '',
    statut: 'planifié',
    prix: 0,
    organisateur: '',
    image: APP_CONFIG.images.defaultMenuItem
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
        image: event.image || APP_CONFIG.images.defaultMenuItem
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

  const handleFormDataChange = (data: EventFormData) => {
    setFormData(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'événement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EventForm formData={formData} setFormData={handleFormDataChange} />
          
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
