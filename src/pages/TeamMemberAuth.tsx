import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Users, Lock, Loader2, KeyRound, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOutletContext } from '@/contexts/OutletContext';

const TEAM_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const TeamMemberAuth: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedOutletId } = useOutletContext();
  const [loading, setLoading] = useState(false);

  // Email / Code form
  const [emailForm, setEmailForm] = useState({ email: '', accessCode: '' });
  // Restaurant code / PIN form
  const [pinForm, setPinForm] = useState({ restaurantCode: '', pseudo: '', pin: '' });

  const persistMemberSession = (member: any, emailUsed: string) => {
    const expiresAt = new Date(Date.now() + TEAM_TTL_MS).toISOString();
    const payload = {
      memberId: member.member_id,
      ownerId: member.owner_id,
      memberEmail: emailUsed,
      role: member.member_role,
      outletId: member.outlet_id,
      outletIds: member.outlet_ids || (member.outlet_id ? [member.outlet_id] : []),
      expiresAt,
    };
    localStorage.setItem('teamMember', JSON.stringify(payload));

    const assignedOutletId = member.outlet_id || member.outlet_ids?.[0] || null;
    if (assignedOutletId) setSelectedOutletId(assignedOutletId);
    else toast.warning('Aucun point de vente assigné', { description: 'Contactez votre responsable.' });

    window.dispatchEvent(new CustomEvent('team-member-session-updated'));
  };

  const submitEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = emailForm.email.trim().toLowerCase();
      const normalizedCode = emailForm.accessCode.trim().toUpperCase();

      const { data: authData, error: authError } = await supabase.functions.invoke('team-member-auth', {
        body: { email: normalizedEmail, accessCode: normalizedCode },
      });
      if (authError) throw authError;
      if (!authData?.success || !authData?.member) {
        toast.error('Accès refusé', { description: "Email ou code d'accès incorrect" });
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedCode,
      });
      if (signInError) throw signInError;

      persistMemberSession(authData.member, normalizedEmail);
      await supabase.rpc('log_team_activity', {
        _member_id: authData.member.member_id,
        _action_type: 'login',
        _action_description: 'Connexion email/code',
      });
      toast.success('Connexion réussie ✅');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur de connexion', { description: err?.message || 'Réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const restaurantCode = pinForm.restaurantCode.trim().toUpperCase();
      const pseudo = pinForm.pseudo.trim().toLowerCase();
      const pin = pinForm.pin.trim();

      const { data: authData, error: authError } = await supabase.functions.invoke('team-member-pin-auth', {
        body: { restaurantCode, pseudo, pin },
      });
      if (authError) throw authError;
      if (!authData?.success || !authData?.member) {
        toast.error('Accès refusé', { description: authData?.error || 'Identifiants incorrects' });
        return;
      }
      const m = authData.member;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: m.synthetic_email,
        password: m.synthetic_password,
      });
      if (signInError) throw signInError;

      persistMemberSession(m, m.synthetic_email);
      await supabase.rpc('log_team_activity', {
        _member_id: m.member_id,
        _action_type: 'login',
        _action_description: 'Connexion code resto + PIN',
      });
      toast.success('Connexion réussie ✅', { description: `Bienvenue ${m.full_name || ''}` });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur de connexion', { description: err?.message || 'Réessayez.' });
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
            <CardDescription>Deux façons de vous connecter</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pin" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="pin">
                <KeyRound className="w-4 h-4 mr-1" /> Code resto + PIN
              </TabsTrigger>
              <TabsTrigger value="email">
                <Lock className="w-4 h-4 mr-1" /> Email + Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pin">
              <form onSubmit={submitPin} className="space-y-4">
                <div>
                  <Label htmlFor="restaurantCode">Code restaurant</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="restaurantCode"
                      required
                      value={pinForm.restaurantCode}
                      onChange={(e) => setPinForm({ ...pinForm, restaurantCode: e.target.value.toUpperCase() })}
                      placeholder="QX-XXXXX"
                      maxLength={10}
                      className="pl-10 uppercase font-mono tracking-wider"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Fourni par votre patron</p>
                </div>

                <div>
                  <Label htmlFor="pseudo">Pseudo</Label>
                  <Input
                    id="pseudo"
                    required
                    value={pinForm.pseudo}
                    onChange={(e) => setPinForm({ ...pinForm, pseudo: e.target.value })}
                    placeholder="votre pseudo"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    required
                    value={pinForm.pin}
                    onChange={(e) => setPinForm({ ...pinForm, pin: e.target.value })}
                    placeholder="••••"
                    inputMode="numeric"
                    maxLength={8}
                    className="font-mono tracking-widest text-center"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connexion...</> : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={submitEmailCode} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="accessCode">Code d'accès</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="accessCode"
                      required
                      value={emailForm.accessCode}
                      onChange={(e) => setEmailForm({ ...emailForm, accessCode: e.target.value.toUpperCase() })}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="pl-10 uppercase font-mono tracking-wider"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connexion...</> : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm mt-4">
            <a href="/auth" className="text-primary hover:underline">Connexion propriétaire →</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMemberAuth;
