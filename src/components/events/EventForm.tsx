
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ImageUpload';

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

interface EventFormProps {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
}

const EventForm: React.FC<EventFormProps> = ({ formData, setFormData }) => {
  const handleImageChange = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default EventForm;
