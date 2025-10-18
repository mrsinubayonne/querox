import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Lock } from 'lucide-react';

const TeamMemberAuth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    accessCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify access code
      const { data: memberData, error: verifyError } = await supabase
        .rpc('verify_team_access', {
          _email: formData.email,
          _access_code: formData.accessCode.toUpperCase()
        });

      if (verifyError) throw verifyError;

      if (!memberData || memberData.length === 0) {
        toast({
          title: "Accès refusé",
          description: "Email ou code d'accès incorrect",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const member = memberData[0];

      // Store team member session info in localStorage
      localStorage.setItem('team_member_session', JSON.stringify({
        memberId: member.member_id,
        ownerId: member.owner_id,
        role: member.role,
        email: formData.email,
        loginTime: new Date().toISOString()
      }));

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ! Vous êtes connecté en tant que ${member.role}`
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error during team member login:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Connexion Équipe</CardTitle>
            <CardDescription>
              Connectez-vous avec votre email et votre code d'accès
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <Label htmlFor="accessCode">Code d'accès</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="accessCode"
                  type="text"
                  required
                  value={formData.accessCode}
                  onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="pl-10 uppercase font-mono tracking-wider"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Entrez le code à 6 caractères fourni par votre responsable
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm">
              <a href="/auth" className="text-primary hover:underline">
                Connexion propriétaire →
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMemberAuth;
