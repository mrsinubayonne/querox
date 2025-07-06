
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

const formSchema = z.object({
  restaurantName: z.string().min(2, 'Nom du restaurant requis'),
  contactName: z.string().min(2, 'Nom de contact requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  currentFollowers: z.string().min(1, 'Nombre d\'abonnés requis'),
  responseTime: z.string().min(1, 'Temps de réponse souhaité requis'),
  availabilityHours: z.string().min(1, 'Horaires de disponibilité requis'),
  toneOfVoice: z.string().min(10, 'Ton de communication requis'),
  message: z.string().min(10, 'Veuillez décrire votre projet'),
});

type CommunityManagementFormData = z.infer<typeof formSchema>;

interface CommunityManagementModalProps {
  onClose: () => void;
}

const CommunityManagementModal: React.FC<CommunityManagementModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<CommunityManagementFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: '',
      contactName: '',
      email: user?.email || '',
      phone: '',
      currentFollowers: '',
      responseTime: '',
      availabilityHours: '',
      toneOfVoice: '',
      message: '',
    },
  });

  const onSubmit = async (data: CommunityManagementFormData) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user?.id,
          service_type: 'community-management',
          service_data: data,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Nous avons reçu votre demande de community management. Notre équipe vous contactera rapidement.",
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span>Community Management</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du restaurant *</FormLabel>
                    <FormControl>
                      <Input placeholder="Le Bistrot du Coin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@restaurant.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentFollowers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d'abonnés actuel *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1500 abonnés" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responseTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temps de réponse souhaité *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Moins de 2h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availabilityHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horaires de disponibilité *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 9h-22h, 7j/7" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toneOfVoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ton de communication souhaité *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Amical, professionnel, décontracté, chaleureux..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informations complémentaires *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Types d'interactions attendues, gestion des avis, réponses aux questions..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-teal-500">
                Envoyer ma demande
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityManagementModal;
