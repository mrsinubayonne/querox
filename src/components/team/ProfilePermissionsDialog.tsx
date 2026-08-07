import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  EDITABLE_PERMISSIONS,
  PERMISSION_LABELS,
  PermissionKey,
  PermissionOverrides,
  getPermissionOverrides,
  setPermissionOverrides,
} from '@/lib/profileAccess';

interface ProfilePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  profileName: string;
  /** Permissions par défaut du rôle */
  defaults: Partial<Record<PermissionKey, boolean>>;
}

const ProfilePermissionsDialog: React.FC<ProfilePermissionsDialogProps> = ({
  open, onOpenChange, profileId, profileName, defaults,
}) => {
  const [values, setValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const overrides = getPermissionOverrides(profileId);
    const initial: Record<string, boolean> = {};
    EDITABLE_PERMISSIONS.forEach((key) => {
      initial[key] = overrides[key] ?? defaults[key] ?? false;
    });
    setValues(initial);
  }, [open, profileId, defaults]);

  const save = () => {
    const overrides: PermissionOverrides = {};
    EDITABLE_PERMISSIONS.forEach((key) => {
      overrides[key] = values[key] === true;
    });
    setPermissionOverrides(profileId, overrides);
    toast.success(`Accès de ${profileName} mis à jour`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Accès de « {profileName} »</DialogTitle>
          <DialogDescription>
            Activez ou désactivez chaque section. Ces réglages remplacent ceux du rôle.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1">
          {EDITABLE_PERMISSIONS.map((key) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">{PERMISSION_LABELS[key]}</span>
              <Switch
                checked={values[key] === true}
                onCheckedChange={(checked) => setValues((v) => ({ ...v, [key]: checked }))}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePermissionsDialog;
