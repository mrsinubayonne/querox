
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface AppearanceTabProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  darkMode,
  setDarkMode
}) => {
  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-medium">Apparence</h2>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Mode sombre</span>
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
      </div>
    </div>
  );
};
