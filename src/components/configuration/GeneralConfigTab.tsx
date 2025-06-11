
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SiteConfig {
  restaurantName: string;
  description: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
}

interface GeneralConfigTabProps {
  siteConfig: SiteConfig;
  onConfigChange: (config: Partial<SiteConfig>) => void;
}

const GeneralConfigTab: React.FC<GeneralConfigTabProps> = ({ siteConfig, onConfigChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="restaurantName">Nom du restaurant</Label>
        <Input
          id="restaurantName"
          value={siteConfig.restaurantName}
          onChange={(e) => onConfigChange({ restaurantName: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={siteConfig.description}
          onChange={(e) => onConfigChange({ description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Sous-titre</Label>
        <Textarea
          id="subtitle"
          value={siteConfig.subtitle}
          onChange={(e) => onConfigChange({ subtitle: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={siteConfig.phone}
          onChange={(e) => onConfigChange({ phone: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={siteConfig.email}
          onChange={(e) => onConfigChange({ email: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={siteConfig.address}
          onChange={(e) => onConfigChange({ address: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="hours">Horaires</Label>
        <Input
          id="hours"
          value={siteConfig.hours}
          onChange={(e) => onConfigChange({ hours: e.target.value })}
        />
      </div>
    </div>
  );
};

export default GeneralConfigTab;
