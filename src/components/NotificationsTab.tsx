
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
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <div>
        <h2 className="text-lg font-semibold">Préférences de notification</h2>
        <p className="text-sm text-muted-foreground mt-1">Choisissez comment vous souhaitez être notifié</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notifications par email</p>
            <p className="text-xs text-muted-foreground">Recevoir les notifications importantes par email</p>
          </div>
          <Switch
            checked={emailUpdates}
            onCheckedChange={setEmailUpdates}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notifications SMS</p>
            <p className="text-xs text-muted-foreground">Recevoir les notifications urgentes par SMS</p>
          </div>
          <Switch
            checked={false}
            onCheckedChange={() => {}}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notifications de commandes</p>
            <p className="text-xs text-muted-foreground">Être notifié des nouvelles commandes</p>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </div>
    </div>
  );
};
