
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Palette } from 'lucide-react';

const formSchema = z.object({
  restaurantName: z.string().min(2, 'Nom du restaurant requis'),
  contactName: z.string().min(2, 'Nom de contact requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  serviceType: z.enum(['affiche', 'flyer', 'menu', 'logo', 'carte-visite', 'autre']),
  dimensions: z.string().optional(),
  message: z.string().min(10, 'Veuillez décrire votre projet'),
  colors: z.string().optional(),
  style: z.enum(['moderne', 'classique', 'elegante', 'fun', 'minimaliste']),
  urgence: z.boolean().default(false),
  budget: z.string().optional(),
});

type ConceptionGraphiqueFormData = z.infer<typeof formSchema>;

interface ConceptionGraphiqueModalProps {
  onClose: () => void;
}

const ConceptionGraphiqueModal: React.FC<ConceptionGraphiqueModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const form = useForm<ConceptionGraphiqueFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: '',
      contactName: '',
      email: user?.email || '',
      phone: '',
      serviceType: 'affiche',
      dimensions: '',
      message: '',
      colors: '',
      style: 'moderne',
      urgence: false,
      budget: '',
    },
  });

  // Fonction pour obtenir le nombre de designs autorisés selon le plan
  const getDesignLimit = () => {
    const tier = subscription?.subscription_tier;
    switch (tier) {
      case 'pro': // Entreprise dans pricingData
        return 5;
      case 'premium': // Professionnel dans pricingData  
        return 1;
      case 'starter':
      case 'trial':
        return 0;
      case 'licence':
        return 999; // Illimité pour licence
      default:
        return 0;
    }
  };

  const designLimit = getDesignLimit();
  const canUseService = designLimit > 0;

  const onSubmit = async (data: ConceptionGraphiqueFormData) => {
    if (!canUseService) {
      toast({
        title: "Plan insuffisant",
        description: "Vous devez avoir un plan Professionnel ou supérieur pour accéder à ce service.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user?.id,
          service_type: 'conception-graphique',
          service_data: { ...data, price: 7000 },
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: `Votre demande a été envoyée. Prix: 7 000 FCFA. Livraison sous 3 jours.`,
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
            <Palette className="h-5 w-5 text-purple-600" />
            <span>Conception Graphique - 7 000 FCFA</span>
          </DialogTitle>
        </DialogHeader>

        {/* Affichage des limites selon le plan */}
        <div className="mb-4 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Votre plan : {subscription?.subscription_tier === 'premium' ? 'Professionnel' : subscription?.subscription_tier === 'pro' ? 'Entreprise' : subscription?.subscription_tier === 'licence' ? 'Licence' : subscription?.subscription_tier}</h3>
          {canUseService ? (
            <div className="flex items-center space-x-2 text-green-600">
              <span>✅ Designs autorisés : {designLimit === 999 ? 'Illimité' : designLimit}</span>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 font-medium">⚠️ Plan insuffisant</p>
              <p className="text-orange-700 text-sm">Vous devez avoir un plan Professionnel (1 design) ou Entreprise (5 designs) pour accéder à ce service.</p>
              <p className="text-sm font-semibold mt-2">Prix : 7 000 FCFA par design</p>
            </div>
          )}
        </div>

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
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de création *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="affiche" id="affiche" />
                        <label htmlFor="affiche">Affiche</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="flyer" id="flyer" />
                        <label htmlFor="flyer">Flyer</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="menu" id="menu" />
                        <label htmlFor="menu">Menu</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="logo" id="logo" />
                        <label htmlFor="logo">Logo</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="carte-visite" id="carte-visite" />
                        <label htmlFor="carte-visite">Carte de visite</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="autre" id="autre" />
                        <label htmlFor="autre">Autre</label>
                      </div>
                    </RadioGroup>
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
                  <FormLabel>Décrivez votre projet *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez en détail ce que vous souhaitez : message à faire passer, éléments à inclure, inspiration..." 
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
              <Button 
                type="submit" 
                disabled={!canUseService}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {canUseService ? 'Commander (7 000 FCFA)' : 'Plan insuffisant'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConceptionGraphiqueModal;
