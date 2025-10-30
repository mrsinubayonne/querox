
import React, { useState } from 'react';
import { Package, Plus, SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickOrderModal } from './QuickOrderModal';
import { useNavigate } from 'react-router-dom';

interface OrdersHeaderProps {
  onOrderCreated: () => Promise<void>;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({ onOrderCreated }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600">Gérez toutes vos commandes</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/tables')}>
          <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
          Voir les Tables
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>
      <QuickOrderModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        onSuccess={onOrderCreated}
      />
    </div>
  );
};
