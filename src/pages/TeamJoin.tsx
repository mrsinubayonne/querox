import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Loader2, CheckCircle } from 'lucide-react';

interface MemberData {
  id: string;
  full_name: string | null;
  member_email: string;
  role: string;
  status: string;
  owner_id: string;
  outlet_id: string | null;
}

const TeamJoin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const inviteToken = searchParams.get('token');
    if (!inviteToken) {
      toast({
        title: "Lien invalide",
        description: "Ce lien d'invitation n'est pas valide",
        variant: "destructive"
      });
      navigate('/team-login');
      return;
    }

    setToken(inviteToken);

    // Verify invitation token using RPC function
    const verifyToken = async () => {
      try {
        const { data, error } = await supabase
          .rpc('verify_team_invitation', { _token: inviteToken });

        if (error) {
          console.error('RPC error:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          toast({
            title: "Invitation invalide",
            description: "Cette invitation n'existe pas ou a expiré",
            variant: "destructive"
          });
          navigate('/team-login');
          return;
        }

        const member = data[0] as MemberData;
        setMemberData(member);
        if (member.member_email && !member.member_email.includes('@querox.local')) {
          setEmail(member.member_email);
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
    if (!email || !memberData || !token) return;

    try {
      setLoading(true);

      // Accept invitation using RPC function
      const { data: acceptData, error: acceptError } = await supabase
        .rpc('accept_team_invitation', {
          _token: token,
          _email: email
        });

      if (acceptError) {
        console.error('Accept error:', acceptError);
        throw acceptError;
      }

      if (!acceptData || acceptData.length === 0) {
        throw new Error('Échec de l\'acceptation de l\'invitation');
      }

      const acceptedMember = acceptData[0];

      // Store team member session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      localStorage.setItem('teamMember', JSON.stringify({
        memberId: acceptedMember.member_id,
        ownerId: acceptedMember.owner_id,
        memberEmail: email,
        role: acceptedMember.member_role,
        outletId: acceptedMember.outlet_id,
        expiresAt: expiresAt.toISOString()
      }));

      // Set outlet if assigned
      if (acceptedMember.outlet_id) {
        localStorage.setItem('selectedOutletId', acceptedMember.outlet_id);
      }

      // Log activity using RPC function
      await supabase.rpc('log_team_activity', {
        _member_id: acceptedMember.member_id,
        _action_type: 'login',
        _action_description: 'Connexion via lien d\'invitation'
      });

      toast({
        title: "Bienvenue ! 🎉",
        description: `Vous êtes connecté en tant que ${acceptedMember.member_role}`
      });

      // Force navigation to dashboard with outlet
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        window.location.reload();
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
