import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOutlets } from '@/hooks/useOutlets';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SelectOutlet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { outlets, loading, createOutlet, selectOutlet, selectedOutletId, canAddMoreOutlets, getOutletLimit } = useOutlets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du point de vente est requis');
      return;
    }

    const newOutlet = await createOutlet({
      name: formData.name,
      address: formData.address || null,
      phone: formData.phone || null
    });

    if (newOutlet) {
      setIsDialogOpen(false);
      setFormData({ name: '', address: '', phone: '' });
      // Rediriger directement au dashboard (propriétaire)
      navigate('/dashboard');
    }
  };

  const handleSelectOutlet = async (outletId: string) => {
    await selectOutlet(outletId);
    // Rediriger directement au dashboard (propriétaire)
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sélectionnez votre point de vente
            </h1>
            <p className="text-xl text-gray-600">
              Choisissez le point de vente que vous souhaitez gérer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <Card 
                key={outlet.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectOutlet(outlet.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {outlet.name}
                  </CardTitle>
                  <CardDescription>Point de vente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {outlet.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{outlet.address}</span>
                    </div>
                  )}
                  {outlet.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{outlet.phone}</span>
                    </div>
                  )}
                  <Button className="w-full mt-4">
                    Accéder à ce point de vente
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Card pour créer un nouveau point de vente */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild disabled={!canAddMoreOutlets()}>
                <Card className={`transition-shadow cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[280px] ${
                  canAddMoreOutlets() 
                    ? 'hover:shadow-lg' 
                    : 'opacity-50 cursor-not-allowed'
                }`}>
                  <CardContent className="text-center py-8">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground">
                      {canAddMoreOutlets() 
                        ? 'Créer un nouveau point de vente'
                        : `Limite atteinte (${getOutletLimit()} max)`
                      }
                    </p>
                    {!canAddMoreOutlets() && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <Button 
                          variant="link" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/abonnement');
                          }}
                        >
                          Passer à un plan supérieur
                        </Button>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau point de vente</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau point de vente à votre compte
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOutlet} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du point de vente *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Restaurant Centre-ville"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: 123 Rue de la République"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: +33 1 23 45 67 89"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Créer le point de vente
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {outlets.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore de point de vente. Commencez par en créer un.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectOutlet;
