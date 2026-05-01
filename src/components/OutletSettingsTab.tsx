import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOutlets } from '@/hooks/useOutlets';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, Store, Trash2, AlertTriangle, Link2, Copy, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const OutletSettingsTab: React.FC = () => {
  const { outlets, selectedOutletId, updateOutlet, deleteOutlet, loading } = useOutlets();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', whatsapp_number: '' });
  const [confirmName, setConfirmName] = useState('');

  const currentOutlet = outlets.find(o => o.id === selectedOutletId);

  useEffect(() => {
    if (currentOutlet) {
      setFormData({
        name: currentOutlet.name || '',
        address: currentOutlet.address || '',
        phone: currentOutlet.phone || '',
        whatsapp_number: (currentOutlet as any).whatsapp_number || '',
      });
    }
  }, [currentOutlet]);

  const restaurantSlug = (profile as any)?.restaurant_slug || '';
  const outletSlug = (currentOutlet as any)?.slug || '';
  const publicUrl = restaurantSlug && outletSlug
    ? `https://querox.me/${restaurantSlug}/${outletSlug}`
    : '';

  const copyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({ title: 'Lien copié', description: publicUrl });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de copier', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutletId) return;

    try {
      setSaving(true);
      await updateOutlet(selectedOutletId, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      });
      toast({ title: "Succès", description: "Point de vente mis à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOutletId || !currentOutlet) return;
    if (outlets.length <= 1) {
      toast({
        title: "Impossible",
        description: "Vous devez garder au moins un point de vente",
        variant: "destructive"
      });
      return;
    }
    if (confirmName !== currentOutlet.name) {
      toast({
        title: "Erreur",
        description: "Le nom saisi ne correspond pas au point de vente",
        variant: "destructive"
      });
      return;
    }
    await deleteOutlet(selectedOutletId);
    setConfirmName('');
    navigate('/select-outlet');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentOutlet) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Aucun point de vente sélectionné
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>Informations du Point de Vente</CardTitle>
            </div>
            <CardDescription>
              Gérez les informations de votre point de vente actuel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du point de vente *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Restaurant Principal" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Rue Example, Paris" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+33 1 23 45 67 89" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </div>
      </form>

      {/* Zone de danger */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
          </div>
          <CardDescription>
            Actions irréversibles sur ce point de vente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={outlets.length <= 1}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ce point de vente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer "{currentOutlet.name}" ?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span className="block">
                    Cette action est irréversible. Toutes les données associées à ce point de vente (commandes, factures, inventaire, etc.) seront définitivement supprimées.
                  </span>
                  <span className="block font-semibold text-destructive">
                    Pour confirmer, tapez le nom exact du point de vente ci-dessous :
                  </span>
                  <span className="block font-mono bg-muted px-2 py-1 rounded text-foreground">
                    {currentOutlet.name}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Tapez le nom du point de vente"
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmName('')}>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={confirmName !== currentOutlet.name}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {outlets.length <= 1 && (
            <p className="text-sm text-muted-foreground mt-2">
              Vous devez garder au moins un point de vente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
