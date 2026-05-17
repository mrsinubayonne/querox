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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp } from 'lucide-react';

const formSchema = z.object({
  restaurantName: z.string().min(2, 'Nom du restaurant requis'),
  contactName: z.string().min(2, 'Nom de contact requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone requis'),
  platforms: z.array(z.string()).min(1, 'Sélectionnez au moins une plateforme'),
  currentAccounts: z.string().min(1, 'Comptes actuels requis'),
  reportingFrequency: z.string().min(1, 'Fréquence de rapport requise'),
  kpis: z.array(z.string()).min(1, 'Sélectionnez au moins un KPI'),
  message: z.string().min(10, 'Veuillez décrire votre projet'),
});

type AnalysePerformanceFormData = z.infer<typeof formSchema>;

interface AnalysePerformanceModalProps {
  onClose: () => void;
}

const AnalysePerformanceModal: React.FC<AnalysePerformanceModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  
  const form = useForm<AnalysePerformanceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: '',
      contactName: '',
      email: user?.email || '',
      phone: '',
      platforms: [],
      currentAccounts: '',
      reportingFrequency: '',
      kpis: [],
      message: '',
    },
  });

  const onSubmit = async (data: AnalysePerformanceFormData) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user?.id,
          service_type: 'analyse-performance',
          service_data: data,
          status: 'pending',
        });

      if (error) throw error;

      toast.success("Demande envoyée !", { description: "Nous avons reçu votre demande d'analyse de performance. Vous recevrez vos rapports mensuellement." });

      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error("Erreur", { description: "Impossible d'envoyer votre demande. Veuillez réessayer." });
    }
  };

  const platforms = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'google', label: 'Google My Business' },
  ];

  const kpis = [
    { id: 'reach', label: 'Portée et impressions' },
    { id: 'engagement', label: 'Taux d\'engagement' },
    { id: 'followers', label: 'Croissance des abonnés' },
    { id: 'clicks', label: 'Clics et trafic' },
    { id: 'conversions', label: 'Conversions' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>Analyse de Performance</span>
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
              name="platforms"
              render={() => (
                <FormItem>
                  <FormLabel>Plateformes à analyser *</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <FormField
                        key={platform.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, platform.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== platform.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {platform.label}
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

            <FormField
              control={form.control}
              name="currentAccounts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comptes à analyser *</FormLabel>
                  <FormControl>
                    <Input placeholder="@monrestaurant, liens vers vos comptes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence des rapports *</FormLabel>
                  <FormControl>
                    <Input placeholder="Mensuel, hebdomadaire..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kpis"
              render={() => (
                <FormItem>
                  <FormLabel>KPIs à suivre *</FormLabel>
                  <div className="grid grid-cols-1 gap-4">
                    {kpis.map((kpi) => (
                      <FormField
                        key={kpi.id}
                        control={form.control}
                        name="kpis"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={kpi.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(kpi.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, kpi.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== kpi.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {kpi.label}
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

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectifs et attentes *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Objectifs spécifiques, points d'attention, questions particulières..." 
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
              <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500">
                Envoyer ma demande
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysePerformanceModal;
