import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck, Phone, Mail, Clock, CheckCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ConsultingModalProps {
  onClose: () => void;
}

const ConsultingModal: React.FC<ConsultingModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    currentChallenges: '',
    goals: '',
    preferredDate: '',
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
          service_type: 'consulting',
          service_data: formData,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Votre demande de consulting a été envoyée avec succès. Nous vous contacterons sous 24h.",
      });

      onClose();
    } catch (error) {
      console.error('Error submitting consulting request:', error);
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
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            Consulting Restaurant Professionnel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description du service */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Ce que comprend notre service de consulting :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Audit complet</h4>
                  <p className="text-sm text-gray-600">Analyse approfondie de votre établissement</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Stratégie personnalisée</h4>
                  <p className="text-sm text-gray-600">Plan d'action adapté à vos objectifs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Optimisation des coûts</h4>
                  <p className="text-sm text-gray-600">Réduction des charges et amélioration rentabilité</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Formation équipe</h4>
                  <p className="text-sm text-gray-600">Montée en compétences de vos équipes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarifs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Nos formules de consulting :</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-600">Session découverte</h4>
                <p className="text-2xl font-bold mt-2">25 000 FCFA</p>
                <p className="text-sm text-gray-600">2 heures d'audit initial</p>
              </div>
              <div className="border-2 border-purple-600 rounded-lg p-4 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Populaire</span>
                </div>
                <h4 className="font-semibold text-purple-600">Audit complet</h4>
                <p className="text-2xl font-bold mt-2">75 000 FCFA</p>
                <p className="text-sm text-gray-600">Journée complète + rapport</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-600">Accompagnement mensuel</h4>
                <p className="text-2xl font-bold mt-2">150 000 FCFA</p>
                <p className="text-sm text-gray-600">Suivi personnalisé 1 mois</p>
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

            <div>
              <label className="block text-sm font-medium mb-2">Type d'établissement</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionnez votre type d'établissement</option>
                <option value="restaurant">Restaurant traditionnel</option>
                <option value="fast-food">Fast-food</option>
                <option value="cafe">Café/Bar</option>
                <option value="boulangerie">Boulangerie/Pâtisserie</option>
                <option value="traiteur">Traiteur</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Défis actuels *</label>
              <Textarea
                name="currentChallenges"
                value={formData.currentChallenges}
                onChange={handleInputChange}
                placeholder="Décrivez les principales difficultés que vous rencontrez..."
                required
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objectifs *</label>
              <Textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                placeholder="Quels sont vos objectifs ? (ex: augmenter le CA, optimiser les coûts, améliorer l'organisation...)"
                required
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date préférée pour la consultation</label>
              <Input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
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
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Demander un consulting'}
              </Button>
            </div>
          </form>

          {/* Contact direct */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Besoin d'informations rapidement ?</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm">+242 05 010 3710</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm">conseil@querox.com</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultingModal;