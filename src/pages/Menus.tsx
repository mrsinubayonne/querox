
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Menu, Upload, Eye, Edit, Trash2 } from "lucide-react";
import { useMenus } from "@/hooks/useMenus";

const Menus: React.FC = () => {
  const { menus, loading, createMenu } = useMenus();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDescription, setNewMenuDescription] = useState('');

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) return;

    await createMenu({
      name: newMenuName,
      description: newMenuDescription,
      is_active: true
    });

    setNewMenuName('');
    setNewMenuDescription('');
    setIsCreateDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menus</h1>
          <p className="text-gray-600">Gérez les menus de votre restaurant</p>
        </div>

        {menus.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Menu className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Aucun menu créé</CardTitle>
                <CardDescription>
                  Commencez par créer votre premier menu
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mb-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un menu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau menu</DialogTitle>
                      <DialogDescription>
                        Ajoutez un nom et une description pour votre menu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nom du menu</label>
                        <Input
                          value={newMenuName}
                          onChange={(e) => setNewMenuName(e.target.value)}
                          placeholder="Ex: Menu du jour"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newMenuDescription}
                          onChange={(e) => setNewMenuDescription(e.target.value)}
                          placeholder="Description optionnelle du menu"
                        />
                      </div>
                      <Button onClick={handleCreateMenu} className="w-full">
                        Créer le menu
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer un menu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>
                  Visualisez vos menus comme vos clients les verront
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Format QR Code</p>
                  <p>• Version web</p>
                  <p>• Version imprimable</p>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Aperçu (aucun menu)
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {menus.map((menu) => (
              <Card key={menu.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {menu.description && (
                    <CardDescription>{menu.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Créé le {new Date(menu.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un nouveau menu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau menu</DialogTitle>
                      <DialogDescription>
                        Ajoutez un nom et une description pour votre menu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nom du menu</label>
                        <Input
                          value={newMenuName}
                          onChange={(e) => setNewMenuName(e.target.value)}
                          placeholder="Ex: Menu du jour"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newMenuDescription}
                          onChange={(e) => setNewMenuDescription(e.target.value)}
                          placeholder="Description optionnelle du menu"
                        />
                      </div>
                      <Button onClick={handleCreateMenu} className="w-full">
                        Créer le menu
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Guide de démarrage</CardTitle>
            <CardDescription>
              Suivez ces étapes pour créer votre premier menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h3 className="font-semibold">Créer une catégorie</h3>
                  <p className="text-sm text-gray-600">Organisez vos plats par catégories (Entrées, Plats, Desserts...)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h3 className="font-semibold">Ajouter des plats</h3>
                  <p className="text-sm text-gray-600">Ajoutez vos plats avec descriptions, prix et photos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h3 className="font-semibold">Générer le QR Code</h3>
                  <p className="text-sm text-gray-600">Créez des QR codes pour vos tables</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Menus;
