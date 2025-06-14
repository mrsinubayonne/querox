
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Save, Trash, Loader2 } from "lucide-react";
import { useWebsitePages } from "@/hooks/useWebsitePages";
import { useToast } from "@/hooks/use-toast";

interface WebsiteContentManagerProps {
  websiteId: string;
}

const availableTypes = [
  { page_type: "home", title: "Accueil" },
  { page_type: "menu", title: "Menu" },
  { page_type: "about", title: "À propos" },
  { page_type: "contact", title: "Contact" },
  { page_type: "gallery", title: "Galerie" },
];

const WebsiteContentManager: React.FC<WebsiteContentManagerProps> = ({ websiteId }) => {
  const { pages, loading, fetchPages, updatePage, addPage, deletePage } = useWebsitePages(websiteId);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>({});
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, [websiteId]);

  const handleEdit = (page: any) => {
    setEditId(page.id);
    setEditValue({ ...page, content: page.content || {} });
  };

  const handleSave = async (id: string) => {
    await updatePage(id, editValue);
    setEditId(null);
    toast({ title: "Modifié", description: "Contenu mis à jour." });
  };

  const handleAdd = async (type: string) => {
    setAdding(true);
    await addPage(type);
    setAdding(false);
    toast({ title: "Page ajoutée" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette page ?")) return;
    await deletePage(id);
    toast({ title: "Page supprimée" });
  };

  return (
    <div>
      <h3 className="font-semibold mb-3">Pages du site</h3>
      {loading ? (
        <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Chargement...</div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="rounded border p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{page.title} <span className="text-xs text-gray-400">({page.page_type})</span></span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(page)}><Pencil size={16} /></Button>
                  <Button size="icon" variant="outline" onClick={() => handleDelete(page.id)}><Trash size={16} /></Button>
                </div>
              </div>
              {editId === page.id ? (
                <div className="space-y-2">
                  <Input value={editValue.title} onChange={e => setEditValue(ev => ({ ...ev, title: e.target.value }))} />
                  <Textarea rows={2} value={editValue.content?.description || ""} placeholder="Description" onChange={e => setEditValue(ev => ({ ...ev, content: { ...ev.content, description: e.target.value } }))}/>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" onClick={() => handleSave(page.id)}><Save size={16} className="mr-1" />Enregistrer</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 px-1">{page.content?.description || <span className="italic text-gray-400">Aucune description</span>}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Button disabled={adding} onClick={() => handleAdd("custom")}><Plus size={16} className="mr-1" />Ajouter une page personnalisée</Button>
      </div>
    </div>
  );
};

export default WebsiteContentManager;
