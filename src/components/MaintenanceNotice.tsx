import React, { useEffect, useState } from 'react';
import { X, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const MAINTENANCE_ID = 'maintenance-2026-07-09';
const BANNER_KEY = `querox_maintenance_banner_${MAINTENANCE_ID}`;
const MODAL_KEY = `querox_maintenance_modal_${MAINTENANCE_ID}`;

const TITLE = 'Travaux en cours — Amélioration & renforcement';
const SHORT = "Nous améliorons Querox en ce moment. Vos données sont en sécurité.";
const LONG =
  "L'équipe Querox effectue actuellement une mise à jour et un renforcement de la plateforme pour vous offrir une expérience encore plus rapide, stable et sécurisée.\n\nToutes vos données sont préservées et rien n'est perdu. Si une action ne répond pas comme d'habitude, merci de patienter quelques instants — tout revient à la normale automatiquement.\n\nMerci pour votre confiance et votre patience.";

const MaintenanceNotice: React.FC = () => {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(BANNER_KEY)) setBannerOpen(true);
    if (!localStorage.getItem(MODAL_KEY)) {
      const t = setTimeout(() => setModalOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem(BANNER_KEY, '1');
    setBannerOpen(false);
  };
  const closeModal = () => {
    localStorage.setItem(MODAL_KEY, '1');
    setModalOpen(false);
  };

  return (
    <>
      {bannerOpen && (
        <div className="w-full border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="max-w-7xl mx-auto flex items-start gap-3 px-4 py-2.5">
            <Wrench className="w-5 h-5 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">{TITLE}</span>
              <span className="mx-2 opacity-40">•</span>
              <span>{SHORT}</span>
            </div>
            <button
              onClick={closeBanner}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition"
              aria-label="Fermer la bannière"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Wrench className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-xl">{TITLE}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap text-left text-sm text-foreground/80">
              {LONG}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-xs">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-xs">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Nouvelles améliorations</span>
            </div>
          </div>
          <Button onClick={closeModal} className="w-full">J'ai compris, merci !</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaintenanceNotice;
