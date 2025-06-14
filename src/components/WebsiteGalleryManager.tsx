
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Trash, Loader2 } from "lucide-react";
import { useWebsiteGallery } from "@/hooks/useWebsiteGallery";
import { useToast } from "@/hooks/use-toast";

interface WebsiteGalleryManagerProps {
  websiteId: string;
}

const WebsiteGalleryManager: React.FC<WebsiteGalleryManagerProps> = ({ websiteId }) => {
  const { images, loading, fetchImages, addImage, deleteImage } = useWebsiteGallery(websiteId);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [websiteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      await addImage(file);
      setFile(null);
      toast({ title: "Image ajoutée" });
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-3">Galerie d&apos;images</h3>
      <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
        <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        <Button variant="outline" type="submit" disabled={!file}><ImagePlus size={16} />Ajouter</Button>
      </form>
      {loading ? (
        <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Chargement...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group rounded overflow-hidden border">
              <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-32 object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100"
                onClick={() => deleteImage(img.id)}
              >
                <Trash size={14} />
              </Button>
              {img.caption && <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white p-1 text-xs">{img.caption}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebsiteGalleryManager;
