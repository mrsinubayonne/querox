import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Mail, Building, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const partnerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis')
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});
type PartnerFormData = z.infer<typeof partnerSchema>;
const companyTypes = ['Agence de marketing', 'Consultant indépendant', 'Développeur web', 'Agence digitale', 'Freelance', 'Société de services', 'Autre'];
const PartnerSignup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const {
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: ''
    }
  });
  const onSubmit = async (data: PartnerFormData) => {
    try {
      setLoading(true);

      // Create the user account
      const {
        error: signUpError
      } = await signUp(data.email, data.password, data.fullName);
      if (signUpError) {
        throw signUpError;
      }

      // Get the current user
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        // Create partner profile
        const {
          error: partnerError
        } = await supabase.from('partners' as any).insert({
          user_id: user.id,
          company_name: data.fullName,
          company_type: 'Partenaire',
          phone: data.phone,
          description: 'Nouveau partenaire',
          commission_rate: 0.35,
          status: 'pending'
        });
        if (partnerError) {
          console.error('Error creating partner profile:', partnerError);
        }
      }
      toast.success("Demande de partenariat envoyée !", { description: "Votre demande sera examinée et vous recevrez une réponse sous 48h." });
      navigate('/partner-dashboard');
    } catch (error: any) {
      toast.error("Erreur lors de l'inscription", { description: error.message || "Une erreur est survenue" });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto bg-card border-border shadow-xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Devenir Partenaire QUEROX
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Rejoignez notre programme d'affiliation et gagnez 35% de commission
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="fullName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom complet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="phone" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+241 XX XX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>

                <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="password" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="confirmPassword" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </div>

              {/* Commission info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Commission</h4>
                </div>
                <p className="text-orange-700 text-sm">
                  Gagnez 35% de commission sur chaque nouveau client que vous nous amenez. 
                  Paiement mensuel automatique.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 font-semibold" disabled={loading}>
                {loading ? <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </> : 'Devenir partenaire'}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-6 border-t border-border">
            <p className="text-muted-foreground">
              Déjà partenaire ?{' '}
              <button onClick={() => navigate('/auth')} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Se connecter
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default PartnerSignup;