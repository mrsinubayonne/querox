import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserCog, Lock, CheckCircle } from 'lucide-react';

const TeamMemberSetup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);
  const [accessCodeChoice, setAccessCodeChoice] = useState<'keep' | 'change' | null>(null);
  const [newAccessCode, setNewAccessCode] = useState('');
  const [confirmAccessCode, setConfirmAccessCode] = useState('');

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: "Lien invalide",
        description: "Le lien d'invitation est invalide",
        variant: "destructive"
      });
      navigate('/team-login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('access_code', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        throw new Error('Invitation introuvable ou déjà utilisée');
      }

      setMemberData(data);
    } catch (error: any) {
      console.error('Error verifying token:', error);
      toast({
        title: "Erreur",
        description: "Cette invitation n'est plus valide",
        variant: "destructive"
      });
      navigate('/team-login');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCodeChoice) {
      toast({
        title: "Choix requis",
        description: "Veuillez choisir si vous souhaitez garder ou changer votre code d'accès",
        variant: "destructive"
      });
      return;
    }

    // Si l'utilisateur veut changer son code
    if (accessCodeChoice === 'change') {
      if (newAccessCode.length !== 6) {
        toast({
          title: "Code invalide",
          description: "Le code d'accès doit contenir exactement 6 caractères",
          variant: "destructive"
        });
        return;
      }

      if (newAccessCode !== confirmAccessCode) {
        toast({
          title: "Erreur",
          description: "Les codes d'accès ne correspondent pas",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const finalAccessCode = accessCodeChoice === 'keep' 
        ? memberData.access_code 
        : newAccessCode.toUpperCase();

      // Mettre à jour le membre avec le code d'accès (nouveau ou existant)
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          access_code: finalAccessCode,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          needs_password_setup: false,
          is_active: true
        })
        .eq('id', memberData.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase
        .from('team_activity_logs')
        .insert({
          team_member_id: memberData.id,
          action_type: 'setup',
          action_description: accessCodeChoice === 'keep' 
            ? 'Configuration initiale - code conservé' 
            : 'Configuration initiale - nouveau code défini'
        });

      toast({
        title: "Configuration réussie ! 🎉",
        description: accessCodeChoice === 'keep' 
          ? "Votre compte est prêt. Utilisez votre code actuel pour vous connecter."
          : "Votre nouveau code d'accès a été défini avec succès",
      });

      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/team-login');
      }, 2000);
    } catch (error: any) {
      console.error('Error setting up access code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de configurer votre compte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Vérification de votre invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Bienvenue dans l'équipe !</CardTitle>
            <CardDescription>
              Définissez votre code d'accès personnel pour vous connecter
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {memberData && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900">
                Email: {memberData.member_email}
              </p>
              <p className="text-sm text-purple-700 mt-1">
                Rôle: {memberData.role}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Afficher le code actuel */}
            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-sm font-medium mb-2">Votre code d'accès actuel :</p>
              <p className="text-2xl font-mono tracking-widest text-center font-bold text-purple-600">
                {memberData?.access_code}
              </p>
            </div>

            {/* Choix : garder ou changer */}
            <div className="space-y-3">
              <Label>Que souhaitez-vous faire ?</Label>
              
              <div 
                onClick={() => setAccessCodeChoice('keep')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  accessCodeChoice === 'keep' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-border hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    accessCodeChoice === 'keep' ? 'border-purple-500' : 'border-muted-foreground'
                  }`}>
                    {accessCodeChoice === 'keep' && (
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Garder ce code</p>
                    <p className="text-sm text-muted-foreground">Continuer avec le code actuel</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setAccessCodeChoice('change')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  accessCodeChoice === 'change' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-border hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    accessCodeChoice === 'change' ? 'border-purple-500' : 'border-muted-foreground'
                  }`}>
                    {accessCodeChoice === 'change' && (
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Changer le code</p>
                    <p className="text-sm text-muted-foreground">Définir un nouveau code personnel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de nouveau code (visible seulement si "change" est sélectionné) */}
            {accessCodeChoice === 'change' && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="newAccessCode">Nouveau code d'accès *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="newAccessCode"
                      type="text"
                      value={newAccessCode}
                      onChange={(e) => setNewAccessCode(e.target.value.toUpperCase())}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="pl-10 uppercase font-mono tracking-wider"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choisissez un code à 6 caractères (lettres et chiffres)
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmAccessCode">Confirmer le code *</Label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmAccessCode"
                      type="text"
                      value={confirmAccessCode}
                      onChange={(e) => setConfirmAccessCode(e.target.value.toUpperCase())}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="pl-10 uppercase font-mono tracking-wider"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
              disabled={loading || !accessCodeChoice}
            >
              {loading ? 'Configuration...' : accessCodeChoice === 'keep' ? 'Confirmer et continuer' : 'Définir mon nouveau code'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Vous utiliserez ce code pour vous connecter ultérieurement</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMemberSetup;
