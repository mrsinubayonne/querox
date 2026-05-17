import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  period: 'mensuel' | 'annuel';
}

interface AccountingBudgetTabProps {
  onConfigureBudget: () => void;
}

const AccountingBudgetTab: React.FC<AccountingBudgetTabProps> = ({ onConfigureBudget }) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPeriod, setNewPeriod] = useState<'mensuel' | 'annuel'>('mensuel');

  const addBudgetItem = () => {
    if (!newCategory || !newAmount) {
      toast.error("Erreur", { description: "Veuillez remplir tous les champs" });
      return;
    }

    const item: BudgetItem = {
      id: Date.now().toString(),
      category: newCategory,
      amount: parseFloat(newAmount),
      period: newPeriod
    };

    setBudgetItems([...budgetItems, item]);
    setNewCategory('');
    setNewAmount('');
    toast.success("Budget ajouté", { description: `${newCategory} a été ajouté au budget prévisionnel` });
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
    toast.success("Budget supprimé", { description: "L'élément a été retiré du budget" });
  };

  const totalBudget = budgetItems.reduce((sum, item) => {
    const amount = item.period === 'annuel' ? item.amount / 12 : item.amount;
    return sum + amount;
  }, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configurer le budget prévisionnel</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              placeholder="Ex: Loyer, Salaires..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="period">Période</Label>
            <select
              id="period"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value as 'mensuel' | 'annuel')}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={addBudgetItem} className="w-full">
              <Plus size={16} className="mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {budgetItems.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Budget configuré</h4>
            <div className="space-y-2">
              {budgetItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.period})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{item.amount.toFixed(2)} €</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBudgetItem(item.id)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Budget mensuel total:</span>
                <span className="text-2xl font-bold text-blue-600">{totalBudget.toFixed(2)} €</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Budget annuel estimé: {(totalBudget * 12).toFixed(2)} €
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AccountingBudgetTab;
