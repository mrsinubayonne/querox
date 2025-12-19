
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
import { Switch } from "@/components/ui/switch";
import { ResetPasswordModal } from './ResetPasswordModal';

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
  const [useAccessCode, setUseAccessCode] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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

      const email = data.email.trim().toLowerCase();

      if (useAccessCode) {
        const code = data.password.trim().toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(code)) {
          toast({
            title: "Code invalide",
            description: "Le code d'accès doit contenir 6 caractères alphanumériques",
            variant: "destructive",
          });
          return;
        }
        // Team member login with access code
        const { data: memberData, error: verifyError } = await supabase
          .rpc('verify_team_access', {
            _email: email,
            _access_code: code
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
          email
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
        const { error } = await signIn(email, data.password);

        if (error) {
          const message = String((error as any)?.message ?? '');
          const code = String((error as any)?.code ?? '');

          const isInvalidCreds =
            code === 'invalid_credentials' ||
            message.toLowerCase().includes('invalid login credentials');

          const isEmailNotConfirmed =
            code === 'email_not_confirmed' ||
            message.toLowerCase().includes('email not confirmed');

          const isRateLimited =
            code === 'too_many_requests' ||
            message.toLowerCase().includes('too many requests');

          if (isEmailNotConfirmed) {
            toast({
              title: "Email non confirmé",
              description: "Confirmez votre email (vérifiez vos spams), puis réessayez.",
              variant: "destructive",
            });
            return;
          }

          if (isRateLimited) {
            toast({
              title: "Trop de tentatives",
              description: "Patientez quelques minutes puis réessayez.",
              variant: "destructive",
            });
            return;
          }

          if (isInvalidCreds) {
            toast({
              title: "Identifiants incorrects",
              description: "Email ou mot de passe incorrect. Vous pouvez réinitialiser votre mot de passe.",
              variant: "destructive",
              action: (
                <ToastAction altText="Mot de passe oublié" onClick={() => setShowResetModal(true)}>
                  Mot de passe oublié
                </ToastAction>
              ),
            });
            return;
          }

          toast({
            title: "Erreur de connexion",
            description: message || "Une erreur est survenue",
            variant: "destructive",
          });
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

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Je suis membre d'équipe (code d'accès)</span>
              <Switch checked={useAccessCode} onCheckedChange={setUseAccessCode} />
            </div>

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
            onClick={() => setShowResetModal(true)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <ResetPasswordModal 
          open={showResetModal} 
          onOpenChange={setShowResetModal}
        />

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
