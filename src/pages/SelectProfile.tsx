import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Lock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProfiles, ProfileTitle } from '@/hooks/useUserProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

const SelectProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    profiles, 
    loading, 
    createProfile, 
    updateProfile,
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
    name: '',
    accessCode: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{ id: string; name: string } | null>(null);
  const [isForgotCodeDialogOpen, setIsForgotCodeDialogOpen] = useState(false);
  const [forgotCodeProfile, setForgotCodeProfile] = useState<{ name: string; code: string } | null>(null);

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

    // Validate access code for all profiles
    if (!formData.accessCode.trim()) {
      toast.error('Vous devez définir un code d\'accès pour ce profil');
      return;
    }

    const nextNumber = getNextNumber(formData.title);
    const defaultName = `${formData.title} ${nextNumber}`;
    const finalName = formData.name.trim() || defaultName;

    const newProfile = await createProfile(formData.title, finalName, formData.accessCode.trim().toUpperCase());

    if (newProfile) {
      setIsDialogOpen(false);
      setFormData({ title: '', name: '', accessCode: '' });
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    
    // Tous les profils nécessitent un code d'accès
    if (profile) {
      setSelectedProfileForAccess(profileId);
      setIsAccessCodeDialogOpen(true);
    }
  };

  const handleAccessCodeSubmit = async () => {
    const profile = profiles.find(p => p.id === selectedProfileForAccess);
    
    if (!profile) {
      toast.error('Profil introuvable');
      return;
    }

    const enteredCode = accessCode.trim().toUpperCase();
    const storedCode = (profile.access_code || '').toUpperCase();

    console.log('🔍 Vérification du code:', {
      profileName: profile.name || profile.title,
      enteredCode,
      storedCode,
      rawStoredCode: profile.access_code,
    });

    // First check against the stored access code in user_profiles (case-insensitive)
    let isValid = profile.access_code && storedCode === enteredCode;

    // If not valid, check against universal codes in profile_access_codes table
    if (!isValid) {
      try {
        const { data: universalCodes } = await supabase
          .from('profile_access_codes')
          .select('access_code')
          .eq('profile_title', profile.title)
          .eq('is_active', true);
        
        if (universalCodes && universalCodes.length > 0) {
          isValid = universalCodes.some(uc => uc.access_code.toUpperCase() === enteredCode);
          if (isValid) {
            console.log('✅ Code universel accepté pour', profile.title);
          }
        }
      } catch (error) {
        console.error('Error checking universal codes:', error);
      }
    }

    if (isValid) {
      console.log('✅ Code correct! Redirection...');
      if (selectedProfileForAccess) {
        selectProfile(selectedProfileForAccess);
        // Rediriger vers les rapports pour Serveur et Caissier, sinon dashboard
        if (profile.title === 'Serveur' || profile.title === 'Caissier(e)') {
          navigate('/rapports');
        } else {
          navigate('/dashboard');
        }
      }
      setIsAccessCodeDialogOpen(false);
      setAccessCode('');
      setSelectedProfileForAccess(null);
    } else {
      console.log('❌ Code incorrect');
      toast.error('Code d\'accès incorrect');
    }
  };

  const handleEditProfile = (profileId: string, currentName: string) => {
    setEditingProfile({ id: profileId, name: currentName });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    if (!editingProfile.name.trim()) {
      toast.error('Le nom du profil ne peut pas être vide');
      return;
    }
    const success = await updateProfile(editingProfile.id, editingProfile.name);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingProfile(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 md:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 md:mb-6">
              <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Sélectionnez votre profil
            </h1>
            <p className="text-base md:text-xl text-gray-600">
              Choisissez le profil que vous souhaitez utiliser
            </p>
            {profiles.length > 0 && (
              <Button
                variant="link"
                onClick={() => {
                  if (profiles.length > 0) {
                    setForgotCodeProfile({ 
                      name: profiles[0].name || profiles[0].title, 
                      code: profiles[0].access_code || 'Non défini' 
                    });
                    setIsForgotCodeDialogOpen(true);
                  }
                }}
                className="mt-2 text-sm md:text-base"
              >
                Code oublié ?
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {profiles.map((profile) => (
              <Card 
                key={profile.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectProfile(profile.id)}
              >
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{profile.name || profile.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {profile.title}
                    {profile.is_default && ' • Par défaut'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full text-sm md:text-base">
                    Utiliser ce profil
                  </Button>
                  <Button type="button" variant="outline" className="w-full text-sm md:text-base" onClick={(e) => { e.stopPropagation(); handleEditProfile(profile.id, profile.name || profile.title); }}>
                    <Pencil className="h-3 w-3 md:h-4 md:w-4 mr-2" /> Renommer
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Card pour créer un nouveau profil */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild disabled={!canAddMoreProfiles()}>
                <Card className={`transition-shadow cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[180px] md:min-h-[220px] ${
                  canAddMoreProfiles() 
                    ? 'hover:shadow-lg' 
                    : 'opacity-50 cursor-not-allowed'
                }`}>
                  <CardContent className="text-center py-6 md:py-8">
                    <Plus className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                    <p className="text-base md:text-lg font-semibold text-foreground">
                      {canAddMoreProfiles() 
                        ? 'Créer un nouveau profil'
                        : `Limite atteinte (${getProfileLimit()} max)`
                      }
                    </p>
                    {!canAddMoreProfiles() && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-2">
                        <Button 
                          variant="link" 
                          className="text-xs md:text-sm"
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
              <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">Nouveau profil</DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
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
                  {formData.title && (
                    <div>
                      <Label htmlFor="accessCode">Code d'accès * (personnalisable)</Label>
                      <Input
                        id="accessCode"
                        type="text"
                        value={formData.accessCode}
                        onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                        placeholder="Ex: MON123CODE"
                        maxLength={20}
                        className="font-mono"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Définissez votre propre code d'accès pour ce profil
                      </p>
                    </div>
                  )}
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
          <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Lock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Code d'accès requis
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm md:text-base">
                Ce profil nécessite un code d'accès pour garantir la sécurité. Veuillez entrer le code d'accès.
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

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Modifier le profil</DialogTitle>
              <DialogDescription className="text-sm md:text-base">
                Changez le nom de ce profil
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom du profil *</Label>
                <Input
                  id="edit-name"
                  value={editingProfile?.name || ''}
                  onChange={(e) => setEditingProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Ex: Caissier Principal"
                />
              </div>
              <Button type="submit" className="w-full">
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Forgot Code Dialog */}
        <AlertDialog open={isForgotCodeDialogOpen} onOpenChange={setIsForgotCodeDialogOpen}>
          <AlertDialogContent className="max-w-[95vw] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg md:text-xl">Codes d'accès des profils</AlertDialogTitle>
              <AlertDialogDescription className="text-sm md:text-base">
                Voici les codes d'accès de vos profils :
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] md:max-h-96 overflow-y-auto">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-3 bg-muted rounded-md">
                  <div className="min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">{profile.name || profile.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{profile.title}</p>
                  </div>
                  <code className="text-base md:text-lg font-mono bg-background px-3 py-2 rounded border self-start md:self-center">
                    {profile.access_code || 'Non défini'}
                  </code>
                </div>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsForgotCodeDialogOpen(false)} className="w-full md:w-auto">
                Fermer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SubscriptionGuard>
  );
};

export default SelectProfile;
