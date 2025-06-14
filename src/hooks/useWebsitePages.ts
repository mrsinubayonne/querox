
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWebsitePages = (websiteId: string) => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPages = async () => {
    if (!websiteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("website_pages")
      .select("*")
      .eq("website_id", websiteId)
      .order("order_index", { ascending: true });
    setPages(data || []);
    setLoading(false);
  };

  const updatePage = async (id: string, updates: any) => {
    const { data } = await supabase
      .from("website_pages")
      .update({
        title: updates.title,
        content: updates.content,
        is_enabled: updates.is_enabled !== undefined ? updates.is_enabled : true,
      })
      .eq("id", id)
      .select()
      .single();
    setPages((prev) => prev.map((p) => (p.id === id ? data : p)));
  };

  const addPage = async (page_type = "custom") => {
    // Default content for custom
    const { data } = await supabase
      .from("website_pages")
      .insert([
        {
          website_id: websiteId,
          page_type,
          title: "Nouvelle page",
          content: { description: "" },
        },
      ])
      .select()
      .single();
    setPages((prev) => prev.concat(data));
  };

  const deletePage = async (id: string) => {
    await supabase.from("website_pages").delete().eq("id", id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  return { pages, loading, fetchPages, updatePage, addPage, deletePage };
};
