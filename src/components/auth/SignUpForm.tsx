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
import { Loader2, User, Mail, Lock, Phone, Utensils } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Le nom complet est requis'),
  restaurantName: z.string().min(2, 'Le nom du restaurant est requis'),
  restaurantType: z.string().min(1, 'Le type de restaurant est requis'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis'),
  promoCode: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});
type SignUpFormData = z.infer<typeof signUpSchema>;
const restaurantTypes = ['Restaurant traditionnel', 'Fast-food', 'Bistrot', 'Brasserie', 'Pizzeria', 'Restaurant gastronomique', 'Café-restaurant', 'Bar à tapas', 'Restaurant ethnique', 'Autre'];
interface SignUpFormProps {
  onSwitchToLogin: () => void;
}
const SignUpForm: React.FC<SignUpFormProps> = ({
  onSwitchToLogin
}) => {
  const [loading, setLoading] = useState(false);
  const {
    signUp
  } = useAuth();
  const {
    toast
  } = useToast();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      restaurantName: '',
      restaurantType: '',
      phone: '',
      promoCode: ''
    }
  });
  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true);
      
      // Préparer toutes les métadonnées
      const metadata = {
        phone: data.phone,
        restaurant_name: data.restaurantName,
        restaurant_type: data.restaurantType,
        promo_code: data.promoCode
      };
      
      const { error } = await signUp(data.email, data.password, data.fullName, metadata);
      
      if (error) {
        // Si l'utilisateur existe déjà
        if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
          toast({
            title: "Compte existant",
            description: "Un compte avec cet email existe déjà. Veuillez vous connecter.",
            action: (
              <ToastAction altText="Se connecter" onClick={onSwitchToLogin}>
                Se connecter
              </ToastAction>
            ),
          });
          return;
        }
        throw error;
      }
      
      toast({
        title: "Inscription réussie !",
        description: "Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte mail."
      });
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Card className="w-full max-w-2xl mx-auto bg-card border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-8">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Créer votre compte QUEROX
        </CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Rejoignez des milliers de restaurateurs qui font confiance à QUEROX
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

            {/* Informations du restaurant */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Informations du restaurant
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="restaurantName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Nom du restaurant</FormLabel>
                      <FormControl>
                        <Input placeholder="Le nom de votre restaurant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="restaurantType" render={({
                field
              }) => <FormItem>
                      <FormLabel>Type de restaurant</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurantTypes.map(type => <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>

            </div>

            {/* Code promo */}
            <div className="space-y-4 pt-6 border-t border-border">
              <FormField control={form.control} name="promoCode" render={({
              field
            }) => <FormItem>
                    <FormLabel>Code promo (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez votre code promo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <Button type="submit" className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 font-semibold" disabled={loading}>
              {loading ? <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Création en cours...
                </> : 'Créer mon compte'}
            </Button>
          </form>
        </Form>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <button onClick={onSwitchToLogin} className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Se connecter
            </button>
          </p>
        </div>
      </CardContent>
    </Card>;
};
export default SignUpForm;