import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Loader2, CheckCircle } from 'lucide-react';

const TeamJoin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: "Lien invalide",
        description: "Ce lien d'invitation n'est pas valide",
        variant: "destructive"
      });
      navigate('/team-login');
      return;
    }

    // Verify invitation token
    const verifyToken = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('access_code', token)
          .single();

        if (error || !data) {
          toast({
            title: "Invitation invalide",
            description: "Cette invitation n'existe pas ou a expiré",
            variant: "destructive"
          });
          navigate('/team-login');
          return;
        }

        setMemberData(data);
        if (data.member_email) {
          setEmail(data.member_email);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier l'invitation",
          variant: "destructive"
        });
        navigate('/team-login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate, toast]);

  const handleContinue = async () => {
    if (!email || !memberData) return;

    try {
      setLoading(true);

      // Update member email if needed
      if (email !== memberData.member_email) {
        await supabase
          .from('team_members')
          .update({ member_email: email })
          .eq('id', memberData.id);
      }

      // Update last login
      await supabase
        .from('team_members')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', memberData.id);

      // Store team member session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      localStorage.setItem('teamMember', JSON.stringify({
        memberId: memberData.id,
        ownerId: memberData.owner_id,
        memberEmail: email,
        role: memberData.role,
        outletId: memberData.outlet_id,
        expiresAt: expiresAt.toISOString()
      }));

      // Set outlet if assigned
      if (memberData.outlet_id) {
        localStorage.setItem('selectedOutletId', memberData.outlet_id);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ selected_outlet_id: memberData.outlet_id })
            .eq('id', user.id);
        }
      }

      // Log activity
      await supabase
        .from('team_activity_logs')
        .insert({
          team_member_id: memberData.id,
          action_type: 'login',
          action_description: 'Connexion via lien d\'invitation'
        });

      toast({
        title: "Bienvenue ! 🎉",
        description: `Vous êtes connecté en tant que ${memberData.role}`
      });

      // Force navigation to dashboard with outlet
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        window.location.reload(); // Force refresh to ensure outlet is loaded
      }, 500);

    } catch (error: any) {
      console.error('Error joining team:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre l'équipe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Vérification de l'invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Invitation Confirmée</CardTitle>
            <CardDescription>
              Bienvenue dans l'équipe ! Confirmez votre email pour continuer
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {memberData?.full_name && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <p className="text-sm text-purple-900">
                👋 Bonjour <strong>{memberData.full_name}</strong>
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Rôle: <strong>{memberData.role}</strong>
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="email">Confirmez votre email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Cet email sera utilisé pour vos futures connexions
            </p>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!email || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Rejoindre l'équipe
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            <a href="/team-login" className="text-primary hover:underline">
              Connexion avec code d'accès →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamJoin;
