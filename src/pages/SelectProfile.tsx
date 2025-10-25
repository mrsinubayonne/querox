import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletProfile } from '@/hooks/useOutletProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface OutletProfile {
  id: string;
  profile_name: string;
  role: string;
}

const SelectProfile: React.FC = () => {
  const navigate = useNavigate();
  const { selectedOutletId } = useOutlets();
  const { login } = useOutletProfile();

  const [profiles, setProfiles] = useState<OutletProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<OutletProfile | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedOutletId) {
      navigate('/select-outlet', { replace: true });
      return;
    }

    const loadProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('outlet_profiles')
          .select('id, profile_name, role')
          .eq('outlet_id', selectedOutletId)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setProfiles(data || []);
      } catch (err: any) {
        console.error('Error loading profiles:', err);
        toast.error("Impossible de charger les profils");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [selectedOutletId, navigate]);

  const openCodeDialog = (profile: OutletProfile) => {
    setSelectedProfile(profile);
    setAccessCode('');
    setCodeDialogOpen(true);
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("Veuillez entrer le code d'accès");
      return;
    }

    setSubmitting(true);
    try {
      const sessionId = uuidv4();
      const { data, error } = await supabase.rpc('verify_outlet_access_code', {
        _access_code: accessCode.trim().toUpperCase(),
        _session_id: sessionId
      });
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Code d'accès invalide");

      const profileData = data[0];
      login({
        profileId: profileData.profile_id,
        outletId: profileData.outlet_id,
        role: profileData.role,
        profileName: profileData.profile_name,
        outletName: profileData.outlet_name,
        ownerId: profileData.owner_id
      });

      toast.success(`Bienvenue ${profileData.profile_name} !`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Code verification error:', err);
      toast.error(err.message || "Code d'accès invalide");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sélectionnez votre profil</h1>
          <p className="text-xl text-gray-600">Choisissez un profil puis saisissez le code d'accès</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p) => (
            <Card key={p.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openCodeDialog(p)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {p.profile_name}
                </CardTitle>
                <CardDescription className="capitalize">{p.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mt-2">
                  Se connecter à ce profil
                </Button>
              </CardContent>
            </Card>
          ))}

          {profiles.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
              Aucun profil actif trouvé pour ce point de vente.
            </div>
          )}
        </div>
      </div>

      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2"><Lock className="h-5 w-5" /> Code d'accès</div>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmCode} className="space-y-4">
            <div>
              <Label htmlFor="accessCode">Entrez le code d'accès pour {selectedProfile?.profile_name}</Label>
              <Input
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="QRX-XXX-XXXX"
                className="text-center text-lg tracking-wider font-mono"
                maxLength={13}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCodeDialogOpen(false)}>Annuler</Button>
              <Button type="submit" className="flex-1" disabled={submitting || accessCode.length < 10}>
                {submitting ? 'Vérification...' : 'Confirmer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectProfile;
