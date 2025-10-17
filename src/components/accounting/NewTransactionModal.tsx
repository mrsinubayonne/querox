
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
}

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'recette',
    status: 'en_attente',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction = {
      id: Date.now(),
      title: formData.title,
      date: new Date().toISOString().split('T')[0],
      amount: formData.type === 'depense' ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
      isPositive: formData.type === 'recette',
      status: formData.status,
      description: formData.description,
      icon: formData.type === 'recette' 
        ? <TrendingUp className="h-4 w-4 text-green-600" />
        : <TrendingDown className="h-4 w-4 text-red-600" />
    };

    onSubmit(newTransaction);
    setFormData({
      title: '',
      amount: '',
      type: 'recette',
      status: 'en_attente',
      description: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la transaction</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Vente du jour, Achat matériel..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (CFA)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de transaction</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recette">Recette</SelectItem>
                <SelectItem value="vente">Vente</SelectItem>
                <SelectItem value="depense">Dépense</SelectItem>
                <SelectItem value="achat">Achat</SelectItem>
                <SelectItem value="salaire">Salaire</SelectItem>
                <SelectItem value="loyer">Loyer</SelectItem>
                <SelectItem value="taxes">Taxes</SelectItem>
                <SelectItem value="charges">Charges</SelectItem>
                <SelectItem value="fournitures">Fournitures</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="entretien">Entretien</SelectItem>
                <SelectItem value="assurance">Assurance</SelectItem>
                <SelectItem value="utilities">Eau/Électricité/Gaz</SelectItem>
                <SelectItem value="equipment">Équipement</SelectItem>
                <SelectItem value="licence">Licences et permis</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="bancaire">Frais bancaires</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirmé">Confirmé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de la transaction..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Créer la transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;
