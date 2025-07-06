
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

  const onSubmit = async (data: ConceptionGraphiqueFormData) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user?.id,
          service_type: 'conception-graphique',
          service_data: data,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Nous avons reçu votre demande de conception graphique. Vous recevrez votre création sous 3 jours.",
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
            <span>Conception Graphique</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions souhaitées</FormLabel>
                    <FormControl>
                      <Input placeholder="A4, A3, 10x15cm..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleurs préférées</FormLabel>
                    <FormControl>
                      <Input placeholder="Rouge, or, noir..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style souhaité *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderne" id="moderne" />
                        <label htmlFor="moderne">Moderne</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="classique" id="classique" />
                        <label htmlFor="classique">Classique</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="elegante" id="elegante" />
                        <label htmlFor="elegante">Élégant</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fun" id="fun" />
                        <label htmlFor="fun">Fun</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minimaliste" id="minimaliste" />
                        <label htmlFor="minimaliste">Minimaliste</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget approximatif</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 50-100€" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgence"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Demande urgente (24h)
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Supplément de 50% appliqué
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Processus :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Vous recevrez un devis personnalisé sous 2h</li>
                <li>• Après validation, création de votre design</li>
                <li>• Livraison sous 3 jours (ou 24h si urgence)</li>
                <li>• 2 révisions gratuites incluses</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                Envoyer ma demande
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConceptionGraphiqueModal;
