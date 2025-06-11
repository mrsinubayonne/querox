import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';

export const ProfileTab: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      const [first, ...rest] = (profile.full_name || '').split(' ');
      setFirstName(first || '');
      setLastName(rest.join(' ') || '');
      setEmail(profile.email || '');
      // Note: phone, position, and bio would need to be added to the profiles table
      // For now, we'll keep them as local state
    }
  }, [profile]);

  const handleSave = async () => {
    setIsUpdating(true);
    
    const fullName = `${firstName} ${lastName}`.trim();
    const success = await updateProfile({
      full_name: fullName,
      email,
    });

    setIsUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Informations personnelles</h2>
          <p className="text-sm text-muted-foreground">Gérez vos informations de profil et de contact</p>
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          <Save className="h-4 w-4 mr-2" />
          {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
      
      <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border">
        <div className="relative">
          <Avatar className="h-16 w-16 bg-emerald-100">
            <AvatarFallback className="bg-emerald-500 text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{firstName} {lastName}</h3>
          <p className="text-sm text-emerald-600 font-medium">{position || 'Utilisateur'}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="first-name" className="text-sm font-medium">
            Prénom
          </label>
          <Input
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="last-name" className="text-sm font-medium">
            Nom
          </label>
          <Input
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Téléphone
          </label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Non disponible - fonctionnalité à venir"
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="position" className="text-sm font-medium">
          Poste
        </label>
        <Input
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Non disponible - fonctionnalité à venir"
          disabled
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Biographie
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Non disponible - fonctionnalité à venir"
          disabled
        />
      </div>
    </div>
  );
};
