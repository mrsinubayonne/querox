
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Colors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

interface DesignConfigTabProps {
  colors: Colors;
  onColorsChange: (colors: Partial<Colors>) => void;
}

const DesignConfigTab: React.FC<DesignConfigTabProps> = ({ colors, onColorsChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="primaryColor">Couleur principale</Label>
        <Input
          id="primaryColor"
          type="color"
          value={colors.primary}
          onChange={(e) => onColorsChange({ primary: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="secondaryColor">Couleur secondaire</Label>
        <Input
          id="secondaryColor"
          type="color"
          value={colors.secondary}
          onChange={(e) => onColorsChange({ secondary: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="backgroundColor">Couleur de fond</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={colors.background}
          onChange={(e) => onColorsChange({ background: e.target.value })}
        />
      </div>
    </div>
  );
};

export default DesignConfigTab;
