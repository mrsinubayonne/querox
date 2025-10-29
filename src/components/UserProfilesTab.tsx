import React, { useState } from 'react';
import { Trash2, User, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProfiles, ProfileTitle } from '@/hooks/useUserProfiles';
import { toast } from 'sonner';

const PROFILE_TITLES: ProfileTitle[] = ['Admin', 'Caissier(e)', 'Comptable', 'Serveur'];

export const UserProfilesTab: React.FC = () => {
  const { 
    profiles, 
    createProfile,
    updateProfile,
    deleteProfile,
    canAddMoreProfiles,
    getProfileLimit 
  } = useUserProfiles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '' as ProfileTitle | '',
    name: ''
  });

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

  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) {
      await deleteProfile(profileId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mes Profils</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos profils d'accès ({profiles.length}/{getProfileLimit()})
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild disabled={!canAddMoreProfiles()}>
            <Button disabled={!canAddMoreProfiles()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un profil
            </Button>
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

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le profil</DialogTitle>
              <DialogDescription>
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
      </div>

      {!canAddMoreProfiles() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">
              Vous avez atteint la limite de profils pour votre plan. 
              Passez à un plan supérieur pour créer plus de profils.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {profile.name || profile.title}
                    </CardTitle>
                    <CardDescription>
                      {profile.title}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.is_default && (
                    <Badge variant="secondary">Par défaut</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditProfile(profile.id, profile.name || profile.title)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!profile.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun profil pour le moment. Créez-en un pour commencer.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
