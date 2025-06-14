
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string | undefined) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onLogoChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onLogoChange(undefined);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Logo du restaurant (optionnel)</Label>
      
      {currentLogo ? (
        <div className="relative inline-block">
          <img 
            src={currentLogo} 
            alt="Logo du restaurant" 
            className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeLogo}
          >
            <X size={12} />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-3">
            Glissez votre logo ici ou cliquez pour sélectionner
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
          />
          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor="logo-upload" className="cursor-pointer">
              <Upload size={14} className="mr-2" />
              Choisir un logo
            </label>
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Le logo sera affiché au centre du QR code. Format recommandé : carré, fond transparent.
      </p>
    </div>
  );
};

export default LogoUpload;
