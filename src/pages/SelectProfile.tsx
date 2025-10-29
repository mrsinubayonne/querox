import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProfiles, ProfileTitle } from '@/hooks/useUserProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PROFILE_TITLES: ProfileTitle[] = ['Admin', 'Caissier(e)', 'Comptable', 'Serveur'];
const ADMIN_ACCESS_CODE = 'QRX-27A79';

const SelectProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    profiles, 
    loading, 
    createProfile, 
    selectProfile,
    canAddMoreProfiles, 
    getProfileLimit 
  } = useUserProfiles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccessCodeDialogOpen, setIsAccessCodeDialogOpen] = useState(false);
  const [selectedProfileForAccess, setSelectedProfileForAccess] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [formData, setFormData] = useState({
    title: '' as ProfileTitle | '',
    name: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  const getNextNumber = (title: ProfileTitle): number => {
    const existingProfiles = profiles.filter(p => p.title === title);
    return existingProfiles.length + 1;
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Le titre du profil est requis');
      return;
    }

    const nextNumber = getNextNumber(formData.title);
    const defaultName = `${formData.title} ${nextNumber}`;
    const finalName = formData.name.trim() || defaultName;

    const newProfile = await createProfile(formData.title, finalName);

    if (newProfile) {
      setIsDialogOpen(false);
      setFormData({ title: '', name: '' });
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    
    // Si c'est un profil Admin, demander le code d'accès
    if (profile?.title === 'Admin') {
      setSelectedProfileForAccess(profileId);
      setIsAccessCodeDialogOpen(true);
      return;
    }
    
    // Pour les autres profils (Caissier, Comptable, Serveur), accès libre
    selectProfile(profileId);
    navigate('/select-outlet');
  };

  const handleAccessCodeSubmit = () => {
    if (accessCode.trim().toUpperCase() === ADMIN_ACCESS_CODE) {
      if (selectedProfileForAccess) {
        selectProfile(selectedProfileForAccess);
        navigate('/select-outlet');
      }
      setIsAccessCodeDialogOpen(false);
      setAccessCode('');
      setSelectedProfileForAccess(null);
    } else {
      toast.error('Code d\'accès incorrect');
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
    <SubscriptionGuard feature="créer ou sélectionner un profil">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sélectionnez votre profil
            </h1>
            <p className="text-xl text-gray-600">
              Choisissez le profil que vous souhaitez utiliser
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card 
                key={profile.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectProfile(profile.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {profile.name || profile.title}
                  </CardTitle>
                  <CardDescription>
                    {profile.title}
                    {profile.is_default && ' • Par défaut'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Utiliser ce profil
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Card pour créer un nouveau profil */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild disabled={!canAddMoreProfiles()}>
                <Card className={`transition-shadow cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[220px] ${
                  canAddMoreProfiles() 
                    ? 'hover:shadow-lg' 
                    : 'opacity-50 cursor-not-allowed'
                }`}>
                  <CardContent className="text-center py-8">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground">
                      {canAddMoreProfiles() 
                        ? 'Créer un nouveau profil'
                        : `Limite atteinte (${getProfileLimit()} max)`
                      }
                    </p>
                    {!canAddMoreProfiles() && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <Button 
                          variant="link" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/abonnement');
                          }}
                        >
                          Passer à un plan supérieur
                        </Button>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau profil</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau profil avec un titre et un nom personnalisé
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre du profil *</Label>
                    <Select 
                      value={formData.title} 
                      onValueChange={(value) => setFormData({ ...formData, title: value as ProfileTitle })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un titre" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_TITLES.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name">Nom du profil (facultatif)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={formData.title ? `Ex: ${formData.title} ${getNextNumber(formData.title)}` : "Ex: Caissier 1"}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Si vide, sera nommé automatiquement "{formData.title ? `${formData.title} ${getNextNumber(formData.title)}` : ''}"
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Créer le profil
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {profiles.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore de profil. Un profil par défaut sera créé automatiquement.
              </p>
            </div>
          )}
        </div>

        {/* Access Code Dialog for Admin Profile */}
        <AlertDialog open={isAccessCodeDialogOpen} onOpenChange={setIsAccessCodeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Code d'accès requis
              </AlertDialogTitle>
              <AlertDialogDescription>
                Le profil Admin nécessite un code d'accès pour garantir la sécurité. Veuillez entrer le code d'accès.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="access-code">Code d'accès</Label>
              <Input
                id="access-code"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Entrez le code d'accès"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAccessCodeSubmit();
                  }
                }}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setAccessCode('');
                setSelectedProfileForAccess(null);
              }}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleAccessCodeSubmit}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SubscriptionGuard>
  );
};

export default SelectProfile;
