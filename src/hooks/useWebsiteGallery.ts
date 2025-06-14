
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWebsiteGallery = (websiteId: string) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (!websiteId) return;
    setLoading(true);
    const { data } = await supabase
      .from("website_gallery")
      .select("*")
      .eq("website_id", websiteId)
      .order("order_index", { ascending: true });
    setImages(data || []);
    setLoading(false);
  };

  const addImage = async (file: File) => {
    // For demonstration: encode image as data url, in real app should use Storage!
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const { data } = await supabase
        .from("website_gallery")
        .insert([
          {
            website_id: websiteId,
            image_url: dataUrl,
            caption: "",
            alt_text: "",
          }
        ])
        .select()
        .single();
      setImages((prev) => prev.concat(data));
    };
    reader.readAsDataURL(file);
  };

  const deleteImage = async (id: string) => {
    await supabase.from("website_gallery").delete().eq("id", id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return { images, loading, fetchImages, addImage, deleteImage };
};
