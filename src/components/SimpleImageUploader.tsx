
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';

interface SimpleImageUploaderProps {
  imageUrl: string | undefined;
  onImageChange: (url: string | undefined) => void;
  label: string;
}

const SimpleImageUploader: React.FC<SimpleImageUploaderProps> = ({ imageUrl, onImageChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block mb-2 font-medium text-sm">{label}</label>
      <div className="border rounded-lg p-2 space-y-2">
        {imageUrl && (
          <div className="relative">
            <img src={imageUrl} alt={label} className="w-full h-40 object-cover rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => onImageChange(undefined)}
            >
              <X size={16} />
            </Button>
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
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Choisir une image
        </Button>
      </div>
    </div>
  );
};

export default SimpleImageUploader;
