
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface NotificationsTabProps {
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  emailUpdates: boolean;
  setEmailUpdates: (value: boolean) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  setNotifications,
  emailUpdates,
  setEmailUpdates
}) => {
  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-medium">Préférences de notifications</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notifications sur le site</p>
            <p className="text-xs text-muted-foreground">Recevez des notifications dans l'application</p>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Mises à jour par email</p>
            <p className="text-xs text-muted-foreground">Recevez des mises à jour par email</p>
          </div>
          <Switch
            checked={emailUpdates}
            onCheckedChange={setEmailUpdates}
          />
        </div>
      </div>
    </div>
  );
};
