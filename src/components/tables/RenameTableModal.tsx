import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { queueMutation, generateLocalId } from "@/lib/offlineStorage";
import { useAuth } from "@/contexts/AuthContext";

interface RenameTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentName: string;
  onSuccess: () => void;
}

export const RenameTableModal: React.FC<RenameTableModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  currentName,
  onSuccess,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const { isOffline } = useNetworkStatus();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      toast.error("Nom requis", { description: "Veuillez entrer un nom pour la table." });
      return;
    }

    setLoading(true);
    try {
      if (isOffline) {
        // Queue mutation for offline sync
        await queueMutation({
          table: 'table_sessions',
          operation: 'update',
          data: { id: sessionId, custom_table_name: newName.trim() },
          localId: generateLocalId(),
          userId: user?.id || '',
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        toast.success("Table renommée (hors ligne)", { description: `La table a été renommée en "${newName}". Sera synchronisé.` });
      } else {
        const { error } = await supabase
          .from("table_sessions")
          .update({ custom_table_name: newName.trim() })
          .eq("id", sessionId);

        if (error) throw error;

        toast.success("Table renommée", { description: `La table a été renommée en "${newName}".` });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error renaming table:", error);
      toast.error("Erreur", { description: "Impossible de renommer la table." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Renommer la table</DialogTitle>
          <DialogDescription>
            Donnez un nouveau nom à cette table.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-name">Nouveau nom</Label>
              <Input
                id="table-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: VIP 1, Terrasse 3..."
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
