import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AccountingEntry {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  entry_type: 'revenue' | 'expense' | 'projection';
  category: string;
  date: string;
  created_at: string;
}

export const ManualAccountingEntries: React.FC = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    entry_type: 'revenue' as 'revenue' | 'expense' | 'projection',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounting_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries((data || []) as AccountingEntry[]);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des entrées');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.amount || !formData.category.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Le montant doit être un nombre positif');
        return;
      }

      if (editingEntry) {
        const { error } = await supabase
          .from('accounting_entries')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            amount,
            entry_type: formData.entry_type,
            category: formData.category.trim(),
            date: formData.date
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('Entrée mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('accounting_entries')
          .insert({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            amount,
            entry_type: formData.entry_type,
            category: formData.category.trim(),
            date: formData.date
          });

        if (error) throw error;
        toast.success('Entrée ajoutée avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEntries();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return;

    try {
      const { error } = await supabase
        .from('accounting_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Entrée supprimée avec succès');
      fetchEntries();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const handleEdit = (entry: AccountingEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      description: entry.description || '',
      amount: entry.amount.toString(),
      entry_type: entry.entry_type,
      category: entry.category,
      date: entry.date
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      entry_type: 'revenue',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingEntry(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const totalRevenue = entries.filter(e => e.entry_type === 'revenue').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'projection':
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue':
        return 'Revenu';
      case 'expense':
        return 'Dépense';
      case 'projection':
        return 'Projection';
      default:
        return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'revenue':
        return 'default';
      case 'expense':
        return 'destructive';
      case 'projection':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Total Revenus</span>
              <TrendingUp className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-3xl font-bold">
              {totalRevenue.toLocaleString('fr-FR')} FCFA
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Total Dépenses</span>
              <TrendingDown className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-3xl font-bold">
              {totalExpenses.toLocaleString('fr-FR')} FCFA
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg ${netProfit >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Profit Net</span>
              <Target className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-3xl font-bold">
              {netProfit.toLocaleString('fr-FR')} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Entrées Comptables Manuelles
              </CardTitle>
              <CardDescription>Gérez vos revenus, dépenses et projections</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Entrée
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Modifier l\'entrée' : 'Nouvelle entrée comptable'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Titre *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Abonnement client Premium"
                        required
                      />
                    </div>

                    <div>
                      <Label>Type *</Label>
                      <Select
                        value={formData.entry_type}
                        onValueChange={(v: any) => setFormData({ ...formData, entry_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenu</SelectItem>
                          <SelectItem value="expense">Dépense</SelectItem>
                          <SelectItem value="projection">Projection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Catégorie *</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Ex: Abonnements, Marketing, etc."
                        required
                      />
                    </div>

                    <div>
                      <Label>Montant (FCFA) *</Label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Ex: 65000"
                        required
                      />
                    </div>

                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Détails supplémentaires..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingEntry ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune entrée comptable</p>
              <p className="text-sm mt-1">Cliquez sur "Nouvelle Entrée" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getEntryIcon(entry.entry_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{entry.title}</p>
                        <Badge variant={getTypeBadgeVariant(entry.entry_type)} className="text-xs">
                          {getTypeLabel(entry.entry_type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {entry.category}
                        </Badge>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        entry.entry_type === 'revenue' ? 'text-green-600' : 
                        entry.entry_type === 'expense' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {entry.entry_type === 'expense' ? '-' : '+'}{entry.amount.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
