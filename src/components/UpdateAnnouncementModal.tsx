import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Mail, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'update_announcement_seen_v1';

const UpdateAnnouncementModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Nouvelle mise à jour ! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            La gestion de votre équipe est maintenant encore plus simple
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              Ce qui change
            </h4>
            
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Connexion simplifiée</strong> — Chaque membre d'équipe se connecte avec son propre email
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Plus besoin de profils</strong> — Fini les codes d'accès à partager
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Sécurité renforcée</strong> — Chaque compte est personnel et sécurisé
                </span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Invitez votre équipe</strong> depuis la page Équipe. Ils recevront un email pour créer leur compte.
            </p>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full">
          C'est compris !
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAnnouncementModal;
