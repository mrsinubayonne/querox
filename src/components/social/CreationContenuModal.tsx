
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Camera } from 'lucide-react';

const formSchema = z.object({
  restaurantName: z.string().min(2, 'Nom du restaurant requis'),
  contactName: z.string().min(2, 'Nom de contact requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  contentTypes: z.array(z.string()).min(1, 'Sélectionnez au moins un type de contenu'),
  shootingLocation: z.string().min(1, 'Lieu de tournage requis'),
  deliveryQuantity: z.string().min(1, 'Quantité requise'),
  style: z.string().min(1, 'Style requis'),
  message: z.string().min(10, 'Veuillez décrire votre projet'),
});

type CreationContenuFormData = z.infer<typeof formSchema>;

interface CreationContenuModalProps {
  onClose: () => void;
}

const CreationContenuModal: React.FC<CreationContenuModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<CreationContenuFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: '',
      contactName: '',
      email: user?.email || '',
      phone: '',
      contentTypes: [],
      shootingLocation: '',
      deliveryQuantity: '',
      style: '',
      message: '',
    },
  });

  const onSubmit = async (data: CreationContenuFormData) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user?.id,
          service_type: 'creation-contenu',
          service_data: data,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Nous avons reçu votre demande de création de contenu. Vous recevrez vos visuels sous 5 jours.",
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

  const contentTypes = [
    { id: 'photos', label: 'Photos de plats' },
    { id: 'videos', label: 'Vidéos courtes' },
    { id: 'stories', label: 'Stories Instagram' },
    { id: 'reels', label: 'Reels/TikToks' },
    { id: 'ambiance', label: 'Photos d\'ambiance' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-pink-600" />
            <span>Création de Contenu</span>
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
              name="contentTypes"
              render={() => (
                <FormItem>
                  <FormLabel>Types de contenu souhaités *</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {contentTypes.map((type) => (
                      <FormField
                        key={type.id}
                        control={form.control}
                        name="contentTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={type.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== type.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shootingLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de tournage *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sur place, en studio..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité souhaitée *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 20 photos + 5 vidéos" {...field} />
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
                  <FormLabel>Style visuel souhaité *</FormLabel>
                  <FormControl>
                    <Input placeholder="Moderne, rustique, élégant, fun..." {...field} />
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
                  <FormLabel>Détails du projet *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Plats à mettre en avant, ambiance souhaitée, références..." 
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
              <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500">
                Envoyer ma demande
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreationContenuModal;
