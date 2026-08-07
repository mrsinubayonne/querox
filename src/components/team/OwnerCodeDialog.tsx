import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, ShieldCheck } from 'lucide-react';
import { hasOwnerCode, setOwnerCode, verifyOwnerCode, markOwnerUnlocked } from '@/lib/profileAccess';
import { toast } from 'sonner';

interface OwnerCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const OwnerCodeDialog: React.FC<OwnerCodeDialogProps> = ({ open, onOpenChange, userId, onSuccess }) => {
  const isSetup = !hasOwnerCode(userId);
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  const reset = () => { setCode(''); setConfirmCode(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim();

    if (isSetup) {
      if (value.length < 4) {
        toast.error('Le code doit contenir au moins 4 caractères');
        return;
      }
      if (value !== confirmCode.trim()) {
        toast.error('Les deux codes ne correspondent pas');
        return;
      }
      setOwnerCode(userId, value);
      markOwnerUnlocked();
      toast.success("Code propriétaire enregistré");
      reset();
      onSuccess();
      return;
    }

    if (!verifyOwnerCode(userId, value)) {
      toast.error('Code propriétaire incorrect');
      return;
    }
    markOwnerUnlocked();
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              {isSetup ? <ShieldCheck className="h-5 w-5 text-amber-600" /> : <Crown className="h-5 w-5 text-amber-600" />}
            </div>
            <DialogTitle>{isSetup ? 'Définir votre code propriétaire' : 'Accès propriétaire'}</DialogTitle>
          </div>
          <DialogDescription>
            {isSetup
              ? "Aucun code n'est encore défini. Choisissez-en un puis confirmez-le : il protégera l'accès propriétaire."
              : "Entrez votre code propriétaire pour accéder au mode complet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner-code">{isSetup ? 'Nouveau code' : "Code d'accès"}</Label>
            <Input
              id="owner-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••"
              autoFocus
            />
          </div>

          {isSetup && (
            <div className="space-y-2">
              <Label htmlFor="owner-code-confirm">Confirmer le code</Label>
              <Input
                id="owner-code-confirm"
                type="password"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                placeholder="••••"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
              Annuler
            </Button>
            <Button type="submit">{isSetup ? 'Enregistrer et continuer' : 'Continuer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerCodeDialog;
