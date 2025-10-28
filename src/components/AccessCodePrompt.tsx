import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

interface AccessCodePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => boolean;
  title: string;
  description: string;
}

const AccessCodePrompt: React.FC<AccessCodePromptProps> = ({
  open,
  onOpenChange,
  onVerify,
  title,
  description,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(code)) {
      setCode('');
      setError('');
      onOpenChange(false);
    } else {
      setError('Code incorrect. Veuillez réessayer.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">Code d'accès</Label>
            <Input
              id="access-code"
              type="password"
              placeholder="Entrez votre code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              className={error ? 'border-destructive' : ''}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setCode('');
                setError('');
              }}
            >
              Annuler
            </Button>
            <Button type="submit">
              Vérifier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessCodePrompt;
