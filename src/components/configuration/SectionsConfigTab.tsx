
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SectionConfig {
  showMenu: boolean;
  showSpecialties: boolean;
  showReservations: boolean;
  showContact: boolean;
}

interface SectionsConfigTabProps {
  sectionConfig: SectionConfig;
  onSectionChange: (config: Partial<SectionConfig>) => void;
}

const SectionsConfigTab: React.FC<SectionsConfigTabProps> = ({ sectionConfig, onSectionChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="showMenu">Afficher le menu</Label>
        <Switch
          id="showMenu"
          checked={sectionConfig.showMenu}
          onCheckedChange={(checked) => onSectionChange({ showMenu: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showSpecialties">Afficher les spécialités</Label>
        <Switch
          id="showSpecialties"
          checked={sectionConfig.showSpecialties}
          onCheckedChange={(checked) => onSectionChange({ showSpecialties: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="showReservations">Afficher les réservations</Label>
        <Switch
          id="showReservations"
          checked={sectionConfig.showReservations}
          onCheckedChange={(checked) => onSectionChange({ showReservations: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="showContact">Afficher le contact</Label>
        <Switch
          id="showContact"
          checked={sectionConfig.showContact}
          onCheckedChange={(checked) => onSectionChange({ showContact: checked })}
        />
      </div>
    </div>
  );
};

export default SectionsConfigTab;
