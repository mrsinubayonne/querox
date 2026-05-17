import { toast } from 'sonner';

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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail } from 'lucide-react';

const formSchema = z.object({
  restaurantName: z.string().min(2, 'Nom du restaurant requis'),
  contactName: z.string().min(2, 'Nom de contact requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  campaignType: z.string().min(1, 'Type de campagne requis'),
  targetAudience: z.string().min(10, 'Veuillez décrire votre audience cible'),
  message: z.string().min(10, 'Veuillez décrire votre projet'),
});

type EmailMarketingFormData = z.infer<typeof formSchema>;

interface EmailMarketingModalProps {
  onClose: () => void;
}

const EmailMarketingModal: React.FC<EmailMarketingModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  
  const form = useForm<EmailMarketingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: '',
      contactName: '',
      email: user?.email || '',
      phone: '',
      campaignType: '',
      targetAudience: '',
      message: '',
    },
  });

  const onSubmit = async (data: EmailMarketingFormData) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user?.id,
          service_type: 'email-marketing',
          service_data: data,
          status: 'pending',
        });

      if (error) throw error;

      toast.success("Demande envoyée !", { description: "Nous avons reçu votre demande d'email marketing. Vous recevrez votre campagne sous 5 jours." });

      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error("Erreur", { description: "Impossible d'envoyer votre demande. Veuillez réessayer." });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>Email Marketing</span>
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

            <FormField
              control={form.control}
              name="campaignType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de campagne *</FormLabel>
                  <FormControl>
                    <Input placeholder="Newsletter, promotion, événement..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audience cible *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre audience cible : âge, habitudes, préférences..." 
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
                  <FormLabel>Message et objectifs *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez le message à transmettre et vos objectifs..." 
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
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500">
                Envoyer ma demande
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailMarketingModal;
