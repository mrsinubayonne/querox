
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface ProfileTabProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  position: string;
  setPosition: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  position,
  setPosition,
  bio,
  setBio
}) => {
  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-medium">Informations personnelles</h2>
      <p className="text-sm text-muted-foreground">Gérez vos informations de profil et de contact</p>
      
      <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border">
        <div className="relative">
          <Avatar className="h-16 w-16 bg-emerald-100">
            <AvatarFallback className="bg-emerald-500 text-white text-lg font-semibold">
              MS
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
          <p className="text-sm text-emerald-600 font-medium">{position}</p>
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
          placeholder="Décrivez-vous en quelques mots..."
        />
      </div>
    </div>
  );
};
