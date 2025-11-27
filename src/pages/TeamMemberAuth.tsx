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

      // Get full member details including outlet_id
      const { data: fullMemberData, error: fetchError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', member.member_id)
        .single();

      if (fetchError) throw fetchError;

      // Update last login
      await supabase
        .from('team_members')
        .update({ 
          last_login_at: new Date().toISOString()
        })
        .eq('id', member.member_id);

      // Store team member session info in localStorage with 8-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      localStorage.setItem('teamMember', JSON.stringify({
        memberId: member.member_id,
        ownerId: member.owner_id,
        memberEmail: formData.email,
        role: member.role,
        outletId: fullMemberData.outlet_id,
        expiresAt: expiresAt.toISOString()
      }));

      // CRITICAL: Ensure outlet is properly set before navigation
      if (fullMemberData.outlet_id) {
        // 1. Store in localStorage FIRST (highest priority)
        localStorage.setItem('selectedOutletId', fullMemberData.outlet_id);
        console.log('✅ Outlet set in localStorage:', fullMemberData.outlet_id);
        
        // 2. Update profile in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ selected_outlet_id: fullMemberData.outlet_id })
            .eq('id', user.id);
          
          if (profileError) {
            console.error('Error updating profile outlet:', profileError);
          } else {
            console.log('✅ Profile outlet updated in database');
          }
        }
      } else {
        console.warn('⚠️ No outlet_id assigned to this team member');
      }

      // Log activity
      await supabase
        .from('team_activity_logs')
        .insert({
          team_member_id: member.member_id,
          action_type: 'login',
          action_description: 'Connexion réussie'
        });

      toast({
        title: "Connexion réussie ✅",
        description: `Bienvenue ! Vous êtes connecté en tant que ${member.role}`
      });

      console.log('🔄 Redirecting to dashboard...');
      
      // Force navigation with page reload to ensure outlet context is loaded
      navigate('/dashboard', { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 300);
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
