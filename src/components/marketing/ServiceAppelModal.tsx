import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Clock, Users, CheckCircle, Star, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceAppelModalProps {
  onClose: () => void;
}

const ServiceAppelModal: React.FC<ServiceAppelModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    contactPerson: '',
    email: '',
    phone: '',
    currentVolume: '',
    serviceHours: '',
    specificNeeds: '',
    startDate: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          service_type: 'service-appel',
          service_data: formData,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Votre demande de service d'appel a été envoyée avec succès. Nous vous contacterons sous 24h.",
      });

      onClose();
    } catch (error) {
      console.error('Error submitting call service request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            Service d'Appel Professionnel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description du service */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Notre service d'appel comprend :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Prise de commandes</h4>
                  <p className="text-sm text-gray-600">Gestion professionnelle de vos commandes téléphoniques</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Réservations</h4>
                  <p className="text-sm text-gray-600">Gestion de votre planning de réservations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Information clients</h4>
                  <p className="text-sm text-gray-600">Renseignements sur vos services et menu</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Service 7j/7</h4>
                  <p className="text-sm text-gray-600">Disponibilité selon vos horaires</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarifs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Nos formules de service d'appel :</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-600">Basique</h4>
                <p className="text-2xl font-bold mt-2">50 000 FCFA</p>
                <p className="text-sm text-gray-600">Jusqu'à 100 appels/mois</p>
                <p className="text-xs text-gray-500 mt-1">Horaires de bureau</p>
              </div>
              <div className="border-2 border-green-600 rounded-lg p-4 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Populaire</span>
                </div>
                <h4 className="font-semibold text-green-600">Standard</h4>
                <p className="text-2xl font-bold mt-2">100 000 FCFA</p>
                <p className="text-sm text-gray-600">Jusqu'à 300 appels/mois</p>
                <p className="text-xs text-gray-500 mt-1">7j/7 - 12h/jour</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-600">Premium</h4>
                <p className="text-2xl font-bold mt-2">180 000 FCFA</p>
                <p className="text-sm text-gray-600">Appels illimités</p>
                <p className="text-xs text-gray-500 mt-1">7j/7 - 16h/jour</p>
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Pourquoi choisir notre service d'appel ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Headphones className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Opérateurs formés</h4>
                  <p className="text-sm text-gray-600">Personnel spécialement formé pour votre secteur d'activité</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Disponibilité étendue</h4>
                  <p className="text-sm text-gray-600">Service disponible selon vos besoins et horaires</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Relation client</h4>
                  <p className="text-sm text-gray-600">Accueil chaleureux et professionnel de vos clients</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Reporting détaillé</h4>
                  <p className="text-sm text-gray-600">Statistiques et rapports d'activité réguliers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du restaurant *</label>
                <Input
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Ex: Le Petit Bistrot"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Personne de contact *</label>
                <Input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Téléphone *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+242 XX XX XX XX"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Volume d'appels actuel</label>
                <select
                  name="currentVolume"
                  value={formData.currentVolume}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez le volume</option>
                  <option value="0-50">0-50 appels/mois</option>
                  <option value="50-100">50-100 appels/mois</option>
                  <option value="100-300">100-300 appels/mois</option>
                  <option value="300+">Plus de 300 appels/mois</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Horaires souhaités</label>
                <select
                  name="serviceHours"
                  value={formData.serviceHours}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez les horaires</option>
                  <option value="bureau">Horaires de bureau (9h-17h)</option>
                  <option value="etendu">Horaires étendus (8h-20h)</option>
                  <option value="weekend">Avec weekend (7j/7)</option>
                  <option value="personalise">Horaires personnalisés</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Besoins spécifiques</label>
              <Textarea
                name="specificNeeds"
                value={formData.specificNeeds}
                onChange={handleInputChange}
                placeholder="Décrivez vos besoins spécifiques (langues, scripts particuliers, intégrations...)"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date de début souhaitée</label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Informations complémentaires</label>
              <Textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Autres informations utiles..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Demander un devis'}
              </Button>
            </div>
          </form>

          {/* Contact direct */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Besoin d'informations rapidement ?</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm">+242 06 456 30 21</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Réponse sous 2h</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceAppelModal;