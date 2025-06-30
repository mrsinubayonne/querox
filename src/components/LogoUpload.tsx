
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onLogoChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        console.error('File is not an image:', file.type);
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File too large:', file.size);
        alert('Le fichier est trop volumineux (max 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('File read successfully');
        const result = event.target?.result as string;
        onLogoChange(result);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Erreur lors de la lecture du fichier');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    console.log('Removing logo');
    onLogoChange('/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png');
  };

  return (
    <div>
      <label className="block mb-2 font-medium text-sm">Logo du restaurant</label>
      <div className="border rounded-lg p-2 space-y-2">
        {currentLogo && currentLogo !== '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png' ? (
          <div className="relative">
            <img src={currentLogo} alt="Logo" className="w-full h-40 object-contain rounded-md bg-gray-50" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={removeLogo}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-sm">Aucun logo</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            console.log('Upload button clicked');
            inputRef.current?.click();
          }}
        >
          <Upload className="mr-2 h-4 w-4" />
          Choisir un logo
        </Button>
      </div>
    </div>
  );
};

export default LogoUpload;
