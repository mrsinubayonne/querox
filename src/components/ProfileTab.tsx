
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Building, MapPin, Phone, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    company: user?.user_metadata?.restaurant_name || user?.user_metadata?.company || 'Mon Restaurant',
    restaurant_type: user?.user_metadata?.restaurant_type || '',
    address: user?.user_metadata?.address || '',
    city: user?.user_metadata?.city || '',
    postal_code: user?.user_metadata?.postal_code || '',
    number_of_seats: user?.user_metadata?.number_of_seats || '',
    bio: user?.user_metadata?.description || user?.user_metadata?.bio || ''
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: formData
      });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.user_metadata?.full_name || '',
      phone: user?.user_metadata?.phone || '',
      company: user?.user_metadata?.restaurant_name || user?.user_metadata?.company || 'Mon Restaurant',
      restaurant_type: user?.user_metadata?.restaurant_type || '',
      address: user?.user_metadata?.address || '',
      city: user?.user_metadata?.city || '',
      postal_code: user?.user_metadata?.postal_code || '',
      number_of_seats: user?.user_metadata?.number_of_seats || '',
      bio: user?.user_metadata?.description || user?.user_metadata?.bio || ''
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                {getInitials(formData.full_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formData.full_name || 'Utilisateur'}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="shrink-0"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {formData.company}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Membre depuis {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Votre nom complet"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {formData.full_name || 'Non renseigné'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {formData.phone || 'Non renseigné'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Restaurant / Entreprise</Label>
              {isEditing ? (
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nom de votre établissement"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  {formData.company}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurant_type">Type de restaurant</Label>
              {isEditing ? (
                <Input
                  id="restaurant_type"
                  value={formData.restaurant_type}
                  onChange={(e) => setFormData({ ...formData, restaurant_type: e.target.value })}
                  placeholder="Type de restaurant"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {formData.restaurant_type || 'Non renseigné'}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse de votre établissement"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {formData.address || 'Non renseigné'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ville"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {formData.city || 'Non renseigné'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              {isEditing ? (
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="Code postal"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {formData.postal_code || 'Non renseigné'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number_of_seats">Nombre de places</Label>
            {isEditing ? (
              <Input
                id="number_of_seats"
                value={formData.number_of_seats}
                onChange={(e) => setFormData({ ...formData, number_of_seats: e.target.value })}
                placeholder="Nombre de places"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                {formData.number_of_seats || 'Non renseigné'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Description</Label>
            {isEditing ? (
              <textarea
                id="bio"
                className="w-full p-3 border rounded-md resize-none h-24"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Décrivez votre établissement ou votre activité..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border min-h-[60px]">
                {formData.bio || 'Aucune description'}
              </div>
            )}
          </div>

          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {user?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">ID Utilisateur</Label>
              <div className="p-3 bg-gray-50 rounded-md border font-mono text-sm">
                {user?.id?.slice(0, 8)}...
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Dernière connexion</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Statut du compte</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Actif
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
