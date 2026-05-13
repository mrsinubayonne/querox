import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Lock, Loader2 } from 'lucide-react';

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
      const normalizedEmail = formData.email.trim().toLowerCase();
      const normalizedCode = formData.accessCode.trim().toUpperCase();

      const { data: authData, error: authError } = await supabase.functions.invoke('team-member-auth', {
        body: { email: normalizedEmail, accessCode: normalizedCode }
      });

      if (authError) throw authError;

      if (!authData?.success || !authData?.member) {
        toast({
          title: "Accès refusé",
          description: "Email ou code d'accès incorrect",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const member = authData.member;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedCode,
      });

      if (signInError) throw signInError;

      // Store team member session info in localStorage with 8-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      localStorage.setItem('teamMember', JSON.stringify({
        memberId: member.member_id,
        ownerId: member.owner_id,
        memberEmail: normalizedEmail,
        role: member.member_role,
        outletId: member.outlet_id,
        outletIds: member.outlet_ids || (member.outlet_id ? [member.outlet_id] : []),
        expiresAt: expiresAt.toISOString()
      }));

      // Set outlet if assigned
      if (member.outlet_id) {
        localStorage.setItem('selectedOutletId', member.outlet_id);
        console.log('✅ Outlet set in localStorage:', member.outlet_id);
      } else {
        console.warn('⚠️ No outlet_id assigned to this team member');
      }

      window.dispatchEvent(new CustomEvent('team-member-session-updated'));

      // Log activity using RPC function
      await supabase.rpc('log_team_activity', {
        _member_id: member.member_id,
        _action_type: 'login',
        _action_description: 'Connexion réussie'
      });

      toast({
        title: "Connexion réussie ✅",
        description: `Bienvenue ! Vous êtes connecté en tant que ${member.member_role}`
      });

      console.log('🔄 Redirecting to dashboard...');
      
      navigate('/dashboard', { replace: true });
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
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
