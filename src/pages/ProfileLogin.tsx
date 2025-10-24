import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOutletProfile } from '@/hooks/useOutletProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, LogIn } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ProfileLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useOutletProfile();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error('Veuillez entrer votre code d\'accès');
      return;
    }

    setLoading(true);

    try {
      const sessionId = uuidv4();

      // Verify access code and get profile info
      const { data, error } = await supabase.rpc('verify_outlet_access_code', {
        _access_code: accessCode.trim().toUpperCase(),
        _session_id: sessionId
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Code d\'accès invalide');
      }

      const profileData = data[0];

      // Store session
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
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Code d\'accès invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Connexion Profil</CardTitle>
          <CardDescription>
            Entrez votre code d'accès pour accéder à votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Code d'accès</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="QRX-XXX-XXXX"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-wider font-mono"
                maxLength={13}
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center">
                Format: QRX-XXX-XXXX
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || accessCode.length < 10}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Code perdu ? Contactez votre responsable
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileLogin;
