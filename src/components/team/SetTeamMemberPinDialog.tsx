import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { KeyRound, Loader2 } from 'lucide-react';

interface SetTeamMemberPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName?: string;
  currentPseudo?: string;
  onSuccess?: () => void;
}

export const SetTeamMemberPinDialog: React.FC<SetTeamMemberPinDialogProps> = ({
  open, onOpenChange, memberId, memberName, currentPseudo, onSuccess,
}) => {
  const [pseudo, setPseudo] = useState(currentPseudo || '');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setPseudo(currentPseudo || '');
      setPin('');
    }
  }, [open, currentPseudo]);

  const submit = async () => {
    if (!pseudo.trim() || pseudo.trim().length < 2) {
      toast.error('Pseudo invalide', { description: 'Au moins 2 caractères' });
      return;
    }
    if (!/^\d{4,8}$/.test(pin)) {
      toast.error('PIN invalide', { description: 'Entre 4 et 8 chiffres' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc('set_team_member_pin', {
        _member_id: memberId,
        _pseudo: pseudo.trim(),
        _pin: pin.trim(),
      });
      if (error) throw error;
      toast.success('PIN défini ✅', { description: 'Le membre peut se connecter avec son pseudo + PIN.' });
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur', { description: err?.message || 'Impossible de définir le PIN' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" /> PIN pour {memberName || 'ce membre'}
          </DialogTitle>
          <DialogDescription>
            Le membre se connectera avec : code restaurant + pseudo + PIN.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="set-pseudo">Pseudo</Label>
            <Input
              id="set-pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value.toLowerCase().replace(/\s/g, ''))}
              placeholder="ex: marie"
            />
            <p className="text-xs text-muted-foreground mt-1">Unique dans votre restaurant. Minuscules, sans espaces.</p>
          </div>
          <div>
            <Label htmlFor="set-pin">Nouveau PIN (4 à 8 chiffres)</Label>
            <Input
              id="set-pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="font-mono tracking-widest text-center"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : 'Définir le PIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
