import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, CheckCircle, X, Edit2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExtractedDish {
  name: string;
  description: string;
  price: number;
  category: string;
}

interface ImportMenuFromImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId: string;
  onImportComplete: () => void;
}

const ImportMenuFromImageModal: React.FC<ImportMenuFromImageModalProps> = ({
  open,
  onOpenChange,
  menuId,
  onImportComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [extractedDishes, setExtractedDishes] = useState<ExtractedDish[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Format invalide",
        description: "Veuillez uploader une image (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(imageFile);
      const imageBase64 = await base64Promise;

      // Call edge function
      const { data, error } = await supabase.functions.invoke("extract-menu-from-image", {
        body: { imageBase64 },
      });

      if (error) throw error;

      if (!data.dishes || data.dishes.length === 0) {
        toast({
          title: "Aucun plat détecté",
          description: "L'IA n'a pas pu extraire de plats de cette image. Essayez avec une image plus claire.",
          variant: "destructive",
        });
        return;
      }

      setExtractedDishes(data.dishes);
      toast({
        title: "Analyse terminée",
        description: `${data.dishes.length} plat(s) détecté(s). Vérifiez et modifiez si nécessaire avant d'importer.`,
      });
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Erreur d'analyse",
        description: error.message || "Impossible d'analyser l'image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDish = (index: number, field: keyof ExtractedDish, value: string | number) => {
    const updated = [...extractedDishes];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedDishes(updated);
  };

  const handleRemoveDish = (index: number) => {
    setExtractedDishes(extractedDishes.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (extractedDishes.length === 0) return;

    setLoading(true);
    try {
      // Group by category
      const categoriesMap = new Map<string, ExtractedDish[]>();
      extractedDishes.forEach((dish) => {
        const category = dish.category || "Autres";
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, []);
        }
        categoriesMap.get(category)!.push(dish);
      });

      // Create categories and items
      for (const [categoryName, dishes] of categoriesMap.entries()) {
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from("menu_categories")
          .select("id")
          .eq("menu_id", menuId)
          .eq("name", categoryName)
          .maybeSingle();

        let categoryId: string;
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          const { data: newCategory, error: categoryError } = await supabase
            .from("menu_categories")
            .insert([{ menu_id: menuId, name: categoryName }])
            .select("id")
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }

        // Insert menu items
        const itemsToInsert = dishes.map((dish) => ({
          category_id: categoryId,
          name: dish.name,
          description: dish.description || null,
          price: dish.price,
          is_available: true,
        }));

        const { error: itemsError } = await supabase
          .from("menu_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Import réussi",
        description: `${extractedDishes.length} plat(s) importé(s) avec succès`,
      });

      onImportComplete();
      onOpenChange(false);
      setExtractedDishes([]);
      setImageFile(null);
    } catch (error: any) {
      console.error("Error importing dishes:", error);
      toast({
        title: "Erreur d'import",
        description: error.message || "Impossible d'importer les plats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer un menu depuis une image</DialogTitle>
          <DialogDescription>
            Uploadez une photo de votre menu et l'IA extraira automatiquement tous les plats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload */}
          {!extractedDishes.length && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-sm text-muted-foreground mb-2">
                    Cliquez pour uploader ou glissez votre image ici
                  </div>
                  <div className="text-xs text-muted-foreground">
                    JPG, PNG ou WEBP (max 10MB)
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imageFile && (
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">{imageFile.name}</span>
                  <Button
                    onClick={analyzeImage}
                    disabled={loading}
                    className="ml-auto"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analyser l'image
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Extracted Dishes */}
          {extractedDishes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Plats détectés ({extractedDishes.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExtractedDishes([]);
                    setImageFile(null);
                  }}
                >
                  Recommencer
                </Button>
              </div>

              <div className="space-y-3">
                {extractedDishes.map((dish, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {editingIndex === index ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nom du plat</Label>
                            <Input
                              value={dish.name}
                              onChange={(e) =>
                                handleEditDish(index, "name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label>Catégorie</Label>
                            <Input
                              value={dish.category}
                              onChange={(e) =>
                                handleEditDish(index, "category", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={dish.description}
                            onChange={(e) =>
                              handleEditDish(index, "description", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Prix (FCFA)</Label>
                          <Input
                            type="number"
                            value={dish.price}
                            onChange={(e) =>
                              handleEditDish(index, "price", parseFloat(e.target.value))
                            }
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setEditingIndex(null)}
                        >
                          Enregistrer
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{dish.name}</h4>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {dish.category}
                              </span>
                            </div>
                            {dish.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {dish.description}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-primary mt-2">
                              {dish.price.toLocaleString("fr-FR")} FCFA
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingIndex(index)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDish(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleImport}
                disabled={loading || extractedDishes.length === 0}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importer {extractedDishes.length} plat(s)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMenuFromImageModal;
