import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Sparkles, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  dishName?: string;
  dishDescription?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange, dishName, dishDescription }) => {
  const [dragActive, setDragActive] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onImageChange(APP_CONFIG.images.defaultMenuItem);
  };

  const handleGenerateAI = async () => {
    if (!dishName || dishName.trim().length < 2) {
      toast.error('Saisissez d\'abord le nom du plat');
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-dish-image', {
        body: { name: dishName, description: dishDescription },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error('Aucune image reçue');
      onImageChange(data.imageUrl);
      toast.success('Image générée avec succès ✨');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Échec de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const hasImage = currentImage && currentImage !== APP_CONFIG.images.defaultMenuItem;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Image du plat</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateAI}
          disabled={generating || !dishName}
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Génération...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-1" /> Générer avec l'IA</>
          )}
        </Button>
      </div>

      {hasImage ? (
        <div className="relative">
          <img src={currentImage} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={removeImage}
          >
            <X size={12} />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Glissez une image, choisissez un fichier, ou générez avec l'IA
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <Button type="button" variant="outline" asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              Choisir une image
            </label>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
