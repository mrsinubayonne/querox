
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // Check if password looks like an access code (6 alphanumeric characters)
      const isAccessCode = /^[A-Z0-9]{6}$/i.test(data.password.trim());
      
      if (isAccessCode) {
        // Team member login with access code
        const { data: memberData, error: verifyError } = await supabase
          .rpc('verify_team_access', {
            _email: data.email,
            _access_code: data.password.toUpperCase()
          });

        if (verifyError) {
          toast({
            title: "Erreur de connexion",
            description: "Une erreur est survenue lors de la vérification",
            variant: "destructive"
          });
          return;
        }

        if (!memberData || memberData.length === 0) {
          toast({
            title: "Accès refusé",
            description: "Email ou code d'accès incorrect",
            variant: "destructive"
          });
          return;
        }

        const member = memberData[0];

        // Store team member session (normalized key)
        localStorage.setItem('teamMember', JSON.stringify({
          memberId: member.member_id,
          ownerId: member.owner_id,
          role: member.role,
          email: data.email
        }));
        // Clean up legacy key if it exists
        try { localStorage.removeItem('team_member_session'); } catch { /* ignore */ }

        toast({
          title: "Connexion réussie",
          description: `Bienvenue ! Vous êtes connecté en tant que ${member.role}`
        });

        // Redirect to dashboard after successful team member login
        setTimeout(() => {
          navigate('/select-outlet');
        }, 100);
      } else {
        // Normal owner login with password
        const { error } = await signIn(data.email, data.password);

        if (error) {
          const isInvalidCreds = (error as any)?.code === 'invalid_credentials' ||
            (typeof error.message === 'string' && error.message.toLowerCase().includes('invalid login credentials'));

          if (isInvalidCreds) {
            toast({
              title: "Pas de compte trouvé",
              description: "Nous ne reconnaissons pas ces identifiants. Inscrivez-vous pour continuer.",
              action: (
                <ToastAction altText="S'inscrire" onClick={onSwitchToSignUp}>
                  S'inscrire
                </ToastAction>
              ),
            });
          } else {
            toast({
              title: "Erreur de connexion",
              description: error.message || "Une erreur est survenue",
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur QUEROX",
        });
        
        // Redirect to outlet selection
        setTimeout(() => {
          navigate('/select-outlet');
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-8">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Connexion
        </CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Accédez à votre tableau de bord QUEROX
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="votre@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mot de passe ou Code d'accès
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Mot de passe ou code 6 caractères" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-muted-foreground">
            Vous n'avez pas de compte ?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
