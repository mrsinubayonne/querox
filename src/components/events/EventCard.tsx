
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin, Edit, Trash2 } from 'lucide-react';

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

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  formatCurrency: (amount: number) => string;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete, formatCurrency }) => {
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'confirmé':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Confirmé</Badge>;
      case 'planifié':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Planifié</Badge>;
      case 'annulé':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inconnu</Badge>;
    }
  };

  return (
    <div className="p-6 border border-gray-100 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
      <div className="flex items-start gap-6 mb-4">
        <div className="flex-shrink-0">
          {event.image && event.image !== APP_CONFIG.images.defaultMenuItem ? (
            <SafeImage 
              src={event.image}
              alt={event.nom}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
              {event.nom.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{event.nom}</h3>
              <p className="text-sm text-gray-500">{event.description}</p>
            </div>
            {getStatutBadge(event.statut)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>{event.heure}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={16} />
              <span>{event.participants} participants</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>{event.lieu}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Prix:</span>
              <span>{formatCurrency(event.prix)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Organisateur:</span>
              <span>{event.organisateur}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(event)}
            >
              <Edit size={14} className="mr-1" />
              Modifier
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={14} className="mr-1" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
